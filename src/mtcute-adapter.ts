import { TelegramClient } from '@mtcute/bun';
import { Dispatcher } from '@mtcute/dispatcher';
import { MessageEntity, TextWithEntities, InlineKeyboardMarkup, InlineKeyboardButton } from '@mtcute/bun';
import type { 
  RootNode, 
  TextNode, 
  FormattedNode, 
  LinkNode, 
  EmojiNode, 
  CodeBlockNode, 
  BlockQuoteNode, 
  RowNode 
} from './reconciler';
import { createContainer } from './reconciler';
import type { ReactElement } from 'react';

export interface MtcuteAdapterConfig {
  apiId: number;
  apiHash: string;
  botToken: string;
  storage?: string;
}

export class MtcuteAdapter {
  private client: TelegramClient;
  private dispatcher: Dispatcher;
  private activeContainers: Map<string, ReturnType<typeof createContainer>> = new Map();

  constructor(config: MtcuteAdapterConfig) {
    this.client = new TelegramClient({
      apiId: config.apiId,
      apiHash: config.apiHash,
      storage: config.storage || '.mtcute',
    });

    this.dispatcher = Dispatcher.for(this.client);
    this.setupHandlers();
  }

  async start(botToken: string) {
    await this.client.start({ botToken });
    console.log('Bot started successfully');
  }

  private setupHandlers() {
    // Handle callback queries (button clicks)
    this.dispatcher.onCallbackQuery(async (query) => {
      const [containerId, buttonId] = query.data.split(':');
      const container = this.activeContainers.get(containerId);
      
      if (container) {
        // Click the button in our React app
        container.clickButton(buttonId);
        
        // Answer the callback query
        await query.answer();
      } else {
        await query.answer({ text: 'Session expired. Please start again.' });
      }
    });
  }

  // Convert our RootNode to TextWithEntities
  private rootNodeToTextWithEntities(root: RootNode): TextWithEntities {
    const text: string[] = [];
    const entities: MessageEntity[] = [];
    
    const processNode = (node: any, parentFormat?: string) => {
      switch (node.type) {
        case 'text':
          text.push(node.content);
          break;
          
        case 'formatted':
          const startOffset = text.join('').length;
          node.children.forEach((child: any) => processNode(child, node.format));
          const length = text.join('').length - startOffset;
          
          if (length > 0) {
            switch (node.format) {
              case 'bold':
                entities.push({ type: 'bold', offset: startOffset, length });
                break;
              case 'italic':
                entities.push({ type: 'italic', offset: startOffset, length });
                break;
              case 'underline':
                entities.push({ type: 'underline', offset: startOffset, length });
                break;
              case 'strikethrough':
                entities.push({ type: 'strikethrough', offset: startOffset, length });
                break;
              case 'spoiler':
                entities.push({ type: 'spoiler', offset: startOffset, length });
                break;
              case 'code':
                entities.push({ type: 'code', offset: startOffset, length });
                break;
            }
          }
          break;
          
        case 'link':
          const linkStartOffset = text.join('').length;
          node.children.forEach((child: any) => processNode(child));
          const linkLength = text.join('').length - linkStartOffset;
          
          if (linkLength > 0) {
            entities.push({ 
              type: 'text_link', 
              offset: linkStartOffset, 
              length: linkLength,
              url: node.href 
            });
          }
          break;
          
        case 'emoji':
          // For custom emoji, we need to add the fallback text and entity
          const emojiOffset = text.join('').length;
          text.push(node.fallback || '👍');
          entities.push({
            type: 'custom_emoji',
            offset: emojiOffset,
            length: node.fallback?.length || 2,
            customEmojiId: BigInt(node.emojiId)
          });
          break;
          
        case 'codeblock':
          const codeStartOffset = text.join('').length;
          text.push(node.content);
          entities.push({
            type: 'pre',
            offset: codeStartOffset,
            length: node.content.length,
            language: node.language
          });
          break;
          
        case 'blockquote':
          const quoteStartOffset = text.join('').length;
          node.children.forEach((child: any) => processNode(child));
          const quoteLength = text.join('').length - quoteStartOffset;
          
          if (quoteLength > 0) {
            entities.push({
              type: 'blockquote',
              offset: quoteStartOffset,
              length: quoteLength,
              collapsed: node.expandable
            });
          }
          break;
          
        case 'row':
          // Rows are handled separately for inline keyboard
          break;
      }
    };
    
    // Process all non-row children
    root.children
      .filter(child => child.type !== 'row')
      .forEach(child => processNode(child));
    
    return {
      text: text.join(''),
      entities
    };
  }

  // Convert row nodes to inline keyboard
  private rootNodeToInlineKeyboard(root: RootNode, containerId: string): InlineKeyboardMarkup | undefined {
    const rows = root.children.filter(child => child.type === 'row') as RowNode[];
    
    if (rows.length === 0) return undefined;
    
    const keyboard: InlineKeyboardButton[][] = rows.map(row => 
      row.children.map(button => ({
        text: button.text,
        data: `${containerId}:${button.id}`
      }))
    );
    
    return { inline: keyboard };
  }

  // Create a React-powered message
  async sendReactMessage(chatId: number | string, app: ReactElement) {
    const containerId = `${chatId}_${Date.now()}`;
    const container = createContainer();
    
    // Store the container for button click handling
    this.activeContainers.set(containerId, container);
    
    // Set up re-render callback
    container.container.onRenderContainer = async (root) => {
      const textWithEntities = this.rootNodeToTextWithEntities(root);
      const replyMarkup = this.rootNodeToInlineKeyboard(root, containerId);
      
      // For now, we'll send a new message each time
      // In a real app, you'd want to edit the existing message
      await this.client.sendMessage(chatId, {
        text: textWithEntities.text,
        entities: textWithEntities.entities,
        replyMarkup
      });
    };
    
    // Initial render
    container.render(app);
    
    // Clean up old containers (keep last 100)
    if (this.activeContainers.size > 100) {
      const oldestKey = this.activeContainers.keys().next().value;
      if (oldestKey) this.activeContainers.delete(oldestKey);
    }
    
    return containerId;
  }

  // Edit an existing message with a new React tree
  async editReactMessage(
    chatId: number | string, 
    messageId: number, 
    app: ReactElement
  ) {
    const containerId = `${chatId}_${messageId}`;
    let container = this.activeContainers.get(containerId);
    
    if (!container) {
      container = createContainer();
      this.activeContainers.set(containerId, container);
    }
    
    // Set up edit callback
    container.container.onRenderContainer = async (root) => {
      const textWithEntities = this.rootNodeToTextWithEntities(root);
      const replyMarkup = this.rootNodeToInlineKeyboard(root, containerId);
      
      await this.client.editMessage(chatId, {
        id: messageId,
        text: textWithEntities.text,
        entities: textWithEntities.entities,
        replyMarkup
      });
    };
    
    // Render the app
    container.render(app);
  }

  // Convenience method to handle commands with React
  onCommand(command: string, handler: (ctx: any) => ReactElement) {
    this.dispatcher.onNewMessage({ text: `/${command}` }, async (msg) => {
      const app = handler(msg);
      await this.sendReactMessage(msg.chat.id, app);
    });
  }

  getClient() {
    return this.client;
  }

  getDispatcher() {
    return this.dispatcher;
  }
}
import { TelegramClient } from '@mtcute/bun';
import { Dispatcher } from '@mtcute/dispatcher';
import type { TextWithEntities } from '@mtcute/bun';
import { tl } from '@mtcute/tl';
import type { 
  RootNode, 
  TextNode, 
  FormattedNode, 
  LinkNode, 
  EmojiNode, 
  CodeBlockNode, 
  BlockQuoteNode, 
  RowNode 
} from '@react-telegram/core';
import { createContainer } from '@react-telegram/core';
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
  private commandHandlers: Map<string, (ctx: any) => ReactElement> = new Map();

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
    // Handle new messages for commands
    this.dispatcher.onNewMessage(async (msg) => {
      if (msg.text && msg.text.startsWith('/')) {
        const commandMatch = msg.text.match(/^\/([\w@]+)/);
        if (commandMatch) {
          const command = commandMatch[1];
          const handler = command ? this.commandHandlers.get(command) : undefined;
          if (handler) {
            const app = handler(msg);
            await this.sendReactMessage(msg.chat.id, app);
          }
        }
      } else if (msg.text) {
        // Track if any input has autoDelete enabled
        let shouldDelete = false;
        
        this.activeContainers.forEach(container => {
          container.container.inputCallbacks.forEach(inputData => {
            // Call the callback
            inputData.callback(msg.text!);
            
            // Check if this input has autoDelete enabled
            if (inputData.autoDelete) {
              shouldDelete = true;
            }
          });
        });
        
        // Delete the user's message if any input had autoDelete enabled
        if (shouldDelete) {
          try {
            await msg.delete();
          } catch (err) {
            // Ignore errors if message deletion fails (e.g., bot lacks permissions)
            console.error('Failed to delete message:', err);
          }
        }
      }
    });

    // Handle callback queries (button clicks)
    this.dispatcher.onCallbackQuery(async (query) => {
      if (!query.data) {
        await query.answer({ text: 'No data provided' });
        return;
      }
      
      const dataStr = typeof query.data === 'string' ? query.data : new TextDecoder().decode(query.data);
      const [containerId, buttonId] = dataStr.split(':');
      const container = containerId ? this.activeContainers.get(containerId) : undefined;
      
      if (container && buttonId) {
        // Click the button in our React app
        container.clickButton(buttonId);
        
        // Answer the callback query
        await query.answer({ text: '' });
      } else {
        await query.answer({ text: 'Session expired. Please start again.' });
      }
    });
  }

  // Convert our RootNode to TextWithEntities
  private rootNodeToTextWithEntities(root: RootNode): TextWithEntities {
    const text: string[] = [];
    const entities: tl.TypeMessageEntity[] = [];
    
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
                entities.push({ _: 'messageEntityBold', offset: startOffset, length });
                break;
              case 'italic':
                entities.push({ _: 'messageEntityItalic', offset: startOffset, length });
                break;
              case 'underline':
                entities.push({ _: 'messageEntityUnderline', offset: startOffset, length });
                break;
              case 'strikethrough':
                entities.push({ _: 'messageEntityStrike', offset: startOffset, length });
                break;
              case 'spoiler':
                entities.push({ _: 'messageEntitySpoiler', offset: startOffset, length });
                break;
              case 'code':
                entities.push({ _: 'messageEntityCode', offset: startOffset, length });
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
              _: 'messageEntityTextUrl', 
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
            _: 'messageEntityCustomEmoji',
            offset: emojiOffset,
            length: node.fallback?.length || 2,
            documentId: node.emojiId as any // MTCute expects Long but accepts string/bigint
          });
          break;
          
        case 'codeblock':
          const codeStartOffset = text.join('').length;
          text.push(node.content);
          entities.push({
            _: 'messageEntityPre',
            offset: codeStartOffset,
            length: node.content.length,
            language: node.language || ''
          });
          break;
          
        case 'blockquote':
          const quoteStartOffset = text.join('').length;
          node.children.forEach((child: any) => processNode(child));
          const quoteLength = text.join('').length - quoteStartOffset;
          
          if (quoteLength > 0) {
            entities.push({
              _: 'messageEntityBlockquote',
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
  private rootNodeToInlineKeyboard(root: RootNode, containerId: string): tl.RawReplyInlineMarkup | undefined {
    const rows = root.children.filter(child => child.type === 'row') as RowNode[];
    
    if (rows.length === 0) return undefined;
    
    const keyboard: tl.TypeKeyboardButton[][] = rows.map(row => 
    {
      const rowButtons = row.children.map(button => ({
        _: 'keyboardButtonCallback',
        text: button.text,
        data: Buffer.from(`${containerId}:${button.id}`)
      }) as tl.TypeKeyboardButton)

      if (rowButtons.length >8) {
        throw new Error('Row has more than 8 buttons');
      };

      return rowButtons;
    }
    );
    
    return { _: 'replyInlineMarkup', rows: keyboard.map(row => ({ _: 'keyboardButtonRow', buttons: row })) };
  }

  // Create a React-powered message
  async sendReactMessage(chatId: number | string, app: ReactElement) {
    const containerId = `${chatId}_${Date.now()}`;
    const container = createContainer();
    
    // Store the container for button click handling
    this.activeContainers.set(containerId, container);
    
    // Track the message ID for editing
    let messageId: number | null = null;
    
    // Set up re-render callback
    container.container.onRenderContainer = async (root) => {
      try {
        const textWithEntities = this.rootNodeToTextWithEntities(root);
        const replyMarkup = this.rootNodeToInlineKeyboard(root, containerId);
        
        if (messageId === null) {
          // First render: send a new message
          const sentMessage = await this.client.sendText(chatId, textWithEntities, {
            replyMarkup
          });
          messageId = sentMessage.id;
        } else {
          // Subsequent renders: edit the existing message
          await this.client.editMessage({
            chatId,
            message: messageId,
            text: textWithEntities,
              replyMarkup
            });
          }
      } catch (err) {
        console.error('Error sending message:', err);
        await this.client.sendText(chatId, 'Error sending message, please try again later.');
      }
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

  // Convenience method to handle commands with React
  onCommand(command: string, handler: (ctx: any) => ReactElement) {
    this.commandHandlers.set(command, handler);
  }

  getClient() {
    return this.client;
  }

  getDispatcher() {
    return this.dispatcher;
  }
}
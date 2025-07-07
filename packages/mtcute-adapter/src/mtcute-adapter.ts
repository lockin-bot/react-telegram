import type { TextWithEntities } from '@mtcute/bun';
import { TelegramClient } from '@mtcute/bun';
import { Dispatcher, type MessageContext } from '@mtcute/dispatcher';
import { tl } from '@mtcute/tl';
import type {
  RootNode,
  RowNode
} from '@react-telegram/core';
import { createContainer } from '@react-telegram/core';
import type { TelegramNode } from '@react-telegram/core/src/jsx';
import type { ReactElement } from 'react';

export interface MtcuteAdapterConfig {
  apiId: number;
  apiHash: string;
  storage?: string;
}

export interface MessagePersistenceOptions {
  getPreviousMessageId: (containerId: string) => Promise<number | null>;
  setPreviousMessageId: (containerId: string, messageId: number) => Promise<void>;
}

export interface MtcuteAdapterOptions {
  messagePersistence?: MessagePersistenceOptions;
}

export class MtcuteAdapter {
  private client: TelegramClient;
  private dispatcher: Dispatcher;
  private activeContainers: Map<string, ReturnType<typeof createContainer>> = new Map();
  private commandHandlers: Map<string, (ctx: MessageContext) => ReactElement> = new Map();
  private options: MtcuteAdapterOptions;

  constructor(clientOrConfig: TelegramClient | MtcuteAdapterConfig, options: MtcuteAdapterOptions = {}) {
    if (clientOrConfig instanceof TelegramClient) {
      this.client = clientOrConfig;
    } else {
      this.client = new TelegramClient({
        apiId: clientOrConfig.apiId,
        apiHash: clientOrConfig.apiHash,
        storage: clientOrConfig.storage || '.mtcute',
      });
    }

    this.options = options;
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
            return;
          }
        }
      } 
      if (msg.text) {
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
    
    const processNode = (node: TelegramNode) => {
      switch (node.type) {
        case 'text':
          text.push(node.content);
          break;
          
        case 'formatted':
          const startOffset = text.join('').length;
          node.children.forEach((child) => processNode(child));
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
          node.children.forEach((child) => processNode(child));
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
          node.children.forEach((child) => processNode(child));
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
      row.children.map(button => ({
        _: 'keyboardButtonCallback',
        text: button.text,
        data: Buffer.from(`${containerId}:${button.id}`)
      }) as tl.TypeKeyboardButton)
    );
    
    return { _: 'replyInlineMarkup', rows: keyboard.map(row => ({ _: 'keyboardButtonRow', buttons: row })) };
  }

  // Create a React-powered message
  async sendReactMessage(chatId: number, app: ReactElement, key?: string) {
    // Create stable containerId using chatId and optional key
    const containerId = key ? `${chatId}_${key}` : `${chatId}`;
    const container = createContainer();
    
    // Store the container for button click handling
    this.activeContainers.set(containerId, container);
    
    // Track the message ID for editing
    let messageId: number | null = null;
    
    // Initialize messageId from persistence if available
    if (this.options.messagePersistence) {
      try {
        const persistedId = await this.options.messagePersistence.getPreviousMessageId(containerId);
        if (persistedId !== null) {
          messageId = persistedId;
        }
      } catch (error) {
        console.error('Failed to get persisted message ID:', error);
      }
    }
    
    // Set up re-render callback
    container.container.onRenderContainer = async (root) => {
      const textWithEntities = this.rootNodeToTextWithEntities(root);
      const replyMarkup = this.rootNodeToInlineKeyboard(root, containerId);
      
      await retryOnRpcError(async () => {

        if (messageId === null) {
          // First render: send a new message
          const sentMessage = await this.client.sendText(chatId, textWithEntities, {
            replyMarkup
          });
          messageId = sentMessage.id;
          
          // Persist the message ID if persistence is available
          if (this.options.messagePersistence) {
            try {
              await this.options.messagePersistence.setPreviousMessageId(containerId, messageId);
            } catch (error) {
              console.error('Failed to persist message ID:', error);
            }
          }
        } else {
          // Subsequent renders: edit the existing message
          await this.client.editMessage({
            chatId,
            message: messageId,
            text: textWithEntities,
            replyMarkup
          }).catch(async e => {
            if (tl.RpcError.is(e) && e.code === 400 && e.text === "MESSAGE_NOT_MODIFIED") {
              return;
            }
            // If message not found, send a new one
            if (tl.RpcError.is(e) && e.code === 400 && e.text === "MESSAGE_ID_INVALID") {
              const sentMessage = await this.client.sendText(chatId, textWithEntities, {
                replyMarkup
              });
              messageId = sentMessage.id;
              
              // Update persisted message ID
              if (this.options.messagePersistence) {
                try {
                  await this.options.messagePersistence.setPreviousMessageId(containerId, messageId);
                } catch (error) {
                  console.error('Failed to persist message ID:', error);
                }
              }
              return;
            }
            throw e;
          });
        }
      })
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
  onCommand(command: string, handler: (ctx: MessageContext) => ReactElement) {
    this.commandHandlers.set(command, handler);
  }

  getClient() {
    return this.client;
  }

  getDispatcher() {
    return this.dispatcher;
  }
}

async function retryOnRpcError<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch(async (error) => {
      if (tl.RpcError.is(error) && error.is('FLOOD_WAIT_%d')) {
          const seconds = error.seconds;
          console.log(`FLOOD_WAIT_${seconds}: Waiting for ${seconds} seconds`);
          await new Promise(resolve => setTimeout(resolve, seconds * 1000));
          return await retryOnRpcError(fn);
      }
      throw error;
  });
}
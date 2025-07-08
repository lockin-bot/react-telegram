import React, { type ReactElement } from 'react';
import { TelegramClient } from '@mtcute/bun';
import { Dispatcher, type MessageContext } from '@mtcute/dispatcher';
import { tl } from '@mtcute/tl';
import { createContainer } from '@react-telegram/core';
import type { RootNode } from '@react-telegram/core';
import { rootNodeToTextWithEntities, rootNodeToInlineKeyboard } from './shared/telegram-node-converter';
import { retryOnRpcError } from './shared/retry-utils';
import { TgProvider } from './spa-hooks';
import type { 
  MtcuteSPAAdapterConfig, 
  MtcuteSPAAdapterOptions, 
  SPAState,
  SPAStorageAdapter 
} from './mtcute-spa-adapter-types';

export class MtcuteSPAAdapter {
  private client: TelegramClient;
  private dispatcher: Dispatcher;
  private options: MtcuteSPAAdapterOptions;
  private app: ReactElement | null = null;
  private activeChats: Map<number, {
    container: ReturnType<typeof createContainer>;
    state: SPAState;
  }> = new Map();

  constructor(clientOrConfig: TelegramClient | MtcuteSPAAdapterConfig, options: MtcuteSPAAdapterOptions = {}) {
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
    console.log('SPA Bot started successfully');
  }

  registerApp(app: ReactElement) {
    this.app = app;
  }

  private async getChatState(chatId: number): Promise<SPAState> {
    const chatIdStr = chatId.toString();
    
    // Try to get from active chats first
    const active = this.activeChats.get(chatId);
    if (active) {
      return active.state;
    }

    // Try to load from storage
    if (this.options.storageAdapter) {
      const saved = await this.options.storageAdapter.getState(chatIdStr);
      if (saved) {
        return saved;
      }
    }

    // Return default state
    return {
      messageId: null,
      lastContent: null,
      lastKeyboard: null,
      appState: {}
    };
  }

  private async saveChatState(chatId: number, state: SPAState) {
    if (this.options.storageAdapter) {
      await this.options.storageAdapter.setState(chatId.toString(), state);
    }
  }

  private async renderApp(chatId: number) {
    if (!this.app) {
      throw new Error('No app registered. Call registerApp() first.');
    }

    let chatData = this.activeChats.get(chatId);
    
    if (!chatData) {
      const state = await this.getChatState(chatId);
      const container = createContainer();
      
      chatData = { container, state };
      this.activeChats.set(chatId, chatData);

      // Set up render callback
      container.container.onRenderContainer = async (root) => {
        await this.handleRender(chatId, root);
      };

      // Restore button handlers if we have a keyboard
      if (state.lastKeyboard) {
        this.restoreButtonHandlers(chatId, container);
      }
    }

    const { container, state } = chatData;

    // Render the app wrapped with TgStateProvider
    container.render(
      <TgProvider 
        chatId={chatId} 
        initialState={state.appState}
      >
        {this.app}
      </TgProvider>
    );
  }

  private async handleRender(chatId: number, root: RootNode) {
    const chatData = this.activeChats.get(chatId);
    if (!chatData) return;

    const { state } = chatData;
    const textWithEntities = rootNodeToTextWithEntities(root);
    const replyMarkup = rootNodeToInlineKeyboard(root, chatId.toString());

    // Store the content for restoration
    state.lastContent = textWithEntities.text;
    state.lastKeyboard = replyMarkup;

    await retryOnRpcError(async () => {
      if (state.messageId === null) {
        // First render: send a new message
        const sentMessage = await this.client.sendText(chatId, textWithEntities, {
          replyMarkup
        });
        state.messageId = sentMessage.id;
        await this.saveChatState(chatId, state);
      } else {
        // Subsequent renders: edit the existing message
        await this.client.editMessage({
          chatId,
          message: state.messageId,
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
            state.messageId = sentMessage.id;
            await this.saveChatState(chatId, state);
            return;
          }
          throw e;
        });
      }
    });
  }

  private restoreButtonHandlers(chatId: number, container: ReturnType<typeof createContainer>) {
    // The container already has button click handling built in
    // We just need to make sure the buttons are mapped correctly
  }

  private setupHandlers() {
    // Handle all messages (including commands)
    this.dispatcher.onNewMessage(async (msg) => {
      if (!msg.text) return;
      
      const chatId = msg.chat.id;
      
      // Always update the existing message instead of creating new ones
      await this.renderApp(chatId);
    });

    // Handle callback queries (button clicks)
    this.dispatcher.onCallbackQuery(async (query) => {
      if (!query.data) {
        await query.answer({ text: 'No data provided' });
        return;
      }
      
      const dataStr = typeof query.data === 'string' ? query.data : new TextDecoder().decode(query.data);
      const [chatIdStr, buttonId] = dataStr.split(':');
      const chatId = parseInt(chatIdStr);
      
      const chatData = this.activeChats.get(chatId);
      
      if (chatData && buttonId) {
        // Click the button in our React app
        chatData.container.clickButton(buttonId);
        
        // Answer the callback query
        await query.answer({ text: '' });
      } else {
        // Try to restore the session
        await this.renderApp(chatId);
        await query.answer({ text: 'Session restored. Please try again.' });
      }
    });
  }

  getClient() {
    return this.client;
  }

  getDispatcher() {
    return this.dispatcher;
  }
}
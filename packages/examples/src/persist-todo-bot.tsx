/// <reference types="@react-telegram/core" />
import React from 'react';
import { TelegramClient } from '@mtcute/bun';
import { MtcuteAdapter } from '@react-telegram/mtcute-adapter';
import { FileStorage } from './storage/FileStorage';
import { MessageIdStorage } from './storage/MessageIdStorage';
import { RootStore } from './stores/RootStore';
import { PersistentTodoBot } from './components/PersistentTodoBot';

// Store instances globally to persist across command invocations
let rootStore: RootStore | null = null;
let storage: FileStorage | null = null;
let messageIdStorage: MessageIdStorage | null = null;

async function initializeStore() {
  if (!storage) {
    storage = new FileStorage('todos.json');
  }
  
  if (!messageIdStorage) {
    // Use a separate file for message IDs
    const messageStorage = new FileStorage('message-ids.json');
    messageIdStorage = new MessageIdStorage(messageStorage);
  }
  
  if (!rootStore) {
    rootStore = new RootStore(storage);
    // Wait for the store to hydrate from storage
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { rootStore, messageIdStorage };
}

async function main() {
  const config = {
    apiId: parseInt(process.env.API_ID || '0'),
    apiHash: process.env.API_HASH || '',
    botToken: process.env.BOT_TOKEN || '',
    storage: process.env.STORAGE_PATH || '.mtcute'
  };
  
  if (!config.apiId || !config.apiHash || !config.botToken) {
    console.error('Please set API_ID, API_HASH, and BOT_TOKEN environment variables');
    process.exit(1);
  }
  
  // Create TelegramClient
  const client = new TelegramClient({
    apiId: config.apiId,
    apiHash: config.apiHash,
    storage: config.storage,
  });
  
  // Initialize the store and message storage
  const { rootStore: store, messageIdStorage: msgStorage } = await initializeStore();
  
  // Create adapter with message persistence
  const adapter = new MtcuteAdapter(client, {
    messagePersistence: {
      getPreviousMessageId: async (containerId) => {
        return await msgStorage.getMessageId(containerId);
      },
      setPreviousMessageId: async (containerId, messageId) => {
        await msgStorage.setMessageId(containerId, messageId);
      }
    }
  });
  
  // Set up single command handler
  adapter.onCommand('start', (msg) => (
    <PersistentTodoBot store={store.todoStore} />
  ));
  
  // Start the bot with the token
  await adapter.start(config.botToken);
  
  console.log('Persistent Todo Bot is running! Send /start to begin.');
  console.log('Todos will be saved to ./storage/todos.json');
  console.log('Message IDs will be saved to ./storage/message-ids.json');
}

// Run the bot
main().catch(console.error);

/// <reference types="@react-telegram/core" />
import React from 'react';
import { TelegramClient } from '@mtcute/bun';
import { MtcuteAdapter } from '@react-telegram/mtcute-adapter';
import { FileStorage } from './storage/FileStorage';
import { RootStore } from './stores/RootStore';
import { PersistentTodoBot } from './components/PersistentTodoBot';

// Store instances globally to persist across command invocations
let rootStore: RootStore | null = null;
let storage: FileStorage | null = null;

async function initializeStore() {
  if (!storage) {
    storage = new FileStorage('todos.json');
  }
  
  if (!rootStore) {
    rootStore = new RootStore(storage);
    // Wait for the store to hydrate from storage
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return rootStore;
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
  
  // Create adapter with the client
  const adapter = new MtcuteAdapter(client);
  
  // Initialize the store
  const store = await initializeStore();
  
  // Set up single command handler
  adapter.onCommand('start', () => (
    <PersistentTodoBot store={store.todoStore} />
  ));
  
  // Start the bot with the token
  await adapter.start(config.botToken);
  
  console.log('Persistent Todo Bot is running! Send /start to begin.');
  console.log('Todos will be saved to ./storage/todos.json');
}

// Run the bot
main().catch(console.error);
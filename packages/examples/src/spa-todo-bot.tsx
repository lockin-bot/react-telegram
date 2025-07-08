/// <reference types="@react-telegram/core" />
import React, { useState } from 'react';
import { TelegramClient } from '@mtcute/bun';
import { MtcuteSPAAdapter, useTgState, type SPAStorageAdapter } from '@react-telegram/mtcute-adapter';
import { FileStorage } from './storage/FileStorage';

// Create storage adapter for SPA state
class FileSPAStorage implements SPAStorageAdapter {
  constructor(private storage: FileStorage) {}

  async getState(chatId: string) {
    const data = await this.storage.get(`spa_${chatId}`);
    return data ? JSON.parse(data) : null;
  }

  async setState(chatId: string, state: any) {
    await this.storage.set(`spa_${chatId}`, JSON.stringify(state));
  }

  async deleteState(chatId: string) {
    await this.storage.delete(`spa_${chatId}`);
  }
}

// Todo item component
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const TodoApp = () => {
  const [todos = [], setTodos] = useTgState<TodoItem[]>('todos', []);
  const [view = 'list', setView] = useTgState<'list' | 'add'>('view', 'list');
  const [inputText, setInputText] = useState('');

  const addTodo = (text: string) => {
    if (text.trim().length < 3) return;
    
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false
    };
    
    setTodos([...todos, newTodo]);
    setView('list');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  if (view === 'add') {
    return (
      <>
        <b>➕ Add New Todo</b>
        <br />
        <br />
        <i>Enter todo text (min 3 characters):</i>
        <br />
        <br />
        <input 
          onSubmit={(text) => {
            addTodo(text);
          }} 
          autoDelete 
        />
        <br />
        <row>
          <button onClick={() => setView('list')}>⬅️ Back</button>
        </row>
      </>
    );
  }

  return (
    <>
      <b>📝 SPA Todo List ({activeTodos.length} active, {completedTodos.length} completed)</b>
      <br />
      <code>━━━━━━━━━━━━━━━━━━━━━━━━━━━━</code>
      <br />
      <br />
      
      {todos.length === 0 ? (
        <i>No todos yet! Add your first todo.</i>
      ) : (
        <>
          {activeTodos.map(todo => (
            <React.Fragment key={todo.id}>
              <row>
                <button onClick={() => toggleTodo(todo.id)}>
                  ☐ {todo.text}
                </button>
                <button onClick={() => deleteTodo(todo.id)}>🗑️</button>
              </row>
            </React.Fragment>
          ))}
          
          {completedTodos.length > 0 && activeTodos.length > 0 && (
            <>
              <br />
              <code>───── Completed ─────</code>
              <br />
            </>
          )}
          
          {completedTodos.map(todo => (
            <React.Fragment key={todo.id}>
              <row>
                <button onClick={() => toggleTodo(todo.id)}>
                  ☑️ <s>{todo.text}</s>
                </button>
                <button onClick={() => deleteTodo(todo.id)}>🗑️</button>
              </row>
            </React.Fragment>
          ))}
        </>
      )}
      
      <br />
      <row>
        <button onClick={() => setView('add')}>➕ Add Todo</button>
        {completedTodos.length > 0 && (
          <button onClick={clearCompleted}>🧹 Clear Completed</button>
        )}
      </row>
      
      <br />
      <i>💡 Send any message to refresh the UI</i>
    </>
  );
};

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
  
  // Create storage
  const fileStorage = new FileStorage('spa-states.json');
  const spaStorage = new FileSPAStorage(fileStorage);
  
  // Create client
  const client = new TelegramClient({
    apiId: config.apiId,
    apiHash: config.apiHash,
    storage: config.storage,
  });
  
  // Create SPA adapter
  const adapter = new MtcuteSPAAdapter(client, {
    storageAdapter: spaStorage
  });
  
  // Register the app
  adapter.registerApp(<TodoApp />);
  
  // Start the bot
  await adapter.start(config.botToken);
  
  console.log('SPA Todo Bot is running!');
  console.log('Send any message to start using the bot.');
  console.log('State will persist across restarts.');
}

// Run the bot
main().catch(console.error);
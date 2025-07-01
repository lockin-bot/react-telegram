/// <reference path="./jsx.d.ts" />
import React, { useState } from 'react';
import { MtcuteAdapter } from './mtcute-adapter';

// Example React components for Telegram
const CounterApp = () => {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <b>🔢 Counter Bot</b>
      <br />
      <br />
      <i>Current count: {count}</i>
      <br />
      <br />
      <row>
        <button onClick={() => setCount(c => c - 1)}>➖ Decrease</button>
        <button onClick={() => setCount(c => c + 1)}>➕ Increase</button>
      </row>
      <row>
        <button onClick={() => setCount(0)}>🔄 Reset</button>
      </row>
    </>
  );
};

const TodoApp = () => {
  const [todos, setTodos] = useState<string[]>(['Buy milk', 'Learn React']);
  const [showCompleted, setShowCompleted] = useState(false);
  
  return (
    <>
      <b>📝 Todo List</b>
      <br />
      <br />
      {todos.length === 0 ? (
        <i>No todos yet!</i>
      ) : (
        todos.map((todo, i) => (
          <React.Fragment key={i}>
            {showCompleted ? <s>{todo}</s> : todo}
            <br />
          </React.Fragment>
        ))
      )}
      <br />
      <row>
        <button onClick={() => setTodos([...todos, `Task ${todos.length + 1}`])}>
          ➕ Add Task
        </button>
        <button onClick={() => setTodos(todos.slice(0, -1))}>
          ➖ Remove Last
        </button>
      </row>
      <row>
        <button onClick={() => setShowCompleted(!showCompleted)}>
          {showCompleted ? '✅ Mark Active' : '☑️ Mark Done'}
        </button>
        <button onClick={() => setTodos([])}>
          🗑️ Clear All
        </button>
      </row>
    </>
  );
};

const HelpApp = () => {
  const [section, setSection] = useState<'main' | 'formatting' | 'features'>('main');
  
  if (section === 'formatting') {
    return (
      <>
        <b>Text Formatting Examples</b>
        <br />
        <br />
        <b>Bold text</b>
        <br />
        <i>Italic text</i>
        <br />
        <u>Underlined text</u>
        <br />
        <s>Strikethrough</s>
        <br />
        <tg-spoiler>Hidden spoiler</tg-spoiler>
        <br />
        <code>inline code</code>
        <br />
        <br />
        <pre>
{`function example() {
  return "Code block";
}`}
        </pre>
        <br />
        <blockquote>This is a quote</blockquote>
        <br />
        <row>
          <button onClick={() => setSection('main')}>⬅️ Back</button>
        </row>
      </>
    );
  }
  
  if (section === 'features') {
    return (
      <>
        <b>Bot Features</b>
        <br />
        <br />
        <blockquote expandable>
          This bot demonstrates a React-based Telegram bot using a custom reconciler.
          
          Features include:
          • Stateful React components
          • Interactive buttons
          • Text formatting
          • Custom emoji support
          • Dynamic content updates
        </blockquote>
        <br />
        Links: <a href="https://github.com">GitHub</a> | <a href="tg://user?id=123456">Contact</a>
        {'\n\n'}
        <row>
          <button onClick={() => setSection('main')}>⬅️ Back</button>
        </row>
      </>
    );
  }
  
  return (
    <>
      <b>🤖 React Telegram Bot</b>
      <br />
      <br />
      Welcome! This bot is powered by React ⚛️
      <br />
      <br />
      Available commands:
      <br />
      /counter - Interactive counter
      <br />
      /todo - Todo list manager
      <br />
      /help - This help message
      <br />
      <br />
      <row>
        <button onClick={() => setSection('formatting')}>📝 Formatting</button>
        <button onClick={() => setSection('features')}>✨ Features</button>
      </row>
    </>
  );
};

// Main bot setup
async function main() {
  // You'll need to set these environment variables
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
  
  const adapter = new MtcuteAdapter(config);
  
  // Set up command handlers
  adapter.onCommand('start', () => <HelpApp />);
  adapter.onCommand('help', () => <HelpApp />);
  adapter.onCommand('counter', () => <CounterApp />);
  adapter.onCommand('todo', () => <TodoApp />);
  
  // Start the bot
  await adapter.start(config.botToken);
  
  console.log('Bot is running! Send /start to begin.');
}

// Run the bot
main().catch(console.error);
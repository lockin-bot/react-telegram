/// <reference types="@react-telegram/core" />
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { TodoStore } from '../stores/TodoStore';
import { TodoApp } from './TodoApp';

interface PersistentTodoBotProps {
  store: TodoStore;
}

type View = 'welcome' | 'todo' | 'help';

export const PersistentTodoBot = observer(({ store }: PersistentTodoBotProps) => {
  const [view, setView] = useState<View>('welcome');

  const handleCommand = (text: string) => {
    const command = text.trim().toLowerCase();
    
    if (command === '/help') {
      setView('help');
    } else if (command === '/todo') {
      setView('todo');
    }
  };

  if (view === 'todo') {
    return (
      <>
        <TodoApp store={store} />
        <br />
        <row>
          <button onClick={() => setView('welcome')}>🏠 Home</button>
          <button onClick={() => setView('help')}>❓ Help</button>
        </row>
      </>
    );
  }

  if (view === 'help') {
    return (
      <>
        <b>📚 Help - Available Commands</b>
        <br />
        <br />
        <code>/start</code> - Back to welcome screen
        <br />
        <code>/todo</code> - Manage your todo list
        <br />
        <code>/help</code> - Show this help message
        <br />
        <br />
        <blockquote expandable>
          <b>Features:</b>
          <br />
          • Add, complete, and delete todos
          <br />
          • Todos persist across bot restarts
          <br />
          • View statistics about your todos
          <br />
          • Clear completed todos in bulk
          <br />
          <br />
          All data is stored locally in JSON files.
        </blockquote>
        <br />
        <row>
          <button onClick={() => setView('welcome')}>🏠 Home</button>
          <button onClick={() => setView('todo')}>📝 Todos</button>
        </row>
        <input onSubmit={handleCommand} autoDelete />
      </>
    );
  }

  // Welcome view (default)
  return (
    <>
      <b>🤖 Persistent Todo Bot</b>
      <br />
      <br />
      Welcome! This bot demonstrates persistent state management with MobX.
      <br />
      <br />
      Your todos are automatically saved and will persist across bot restarts.
      <br />
      <br />
      <row>
        <button onClick={() => setView('todo')}>📝 Manage Todos</button>
        <button onClick={() => setView('help')}>❓ Help</button>
      </row>
      <br />
      <br />
      <i>Or type a command:</i>
      <br />
      <input onSubmit={handleCommand} autoDelete />
    </>
  );
});
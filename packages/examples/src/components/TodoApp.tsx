/// <reference types="@react-telegram/core" />
import React, { useState, useContext, createContext } from 'react';
import { observer } from 'mobx-react-lite';
import { TodoStore } from '../stores/TodoStore';
import { TodoList } from './TodoList';
import { TodoInput } from './TodoInput';

interface TodoAppProps {
  store: TodoStore;
}

export const TodoStoreContext = createContext<TodoStore | null>(null);

export const useTodoStore = () => {
  const store = useContext(TodoStoreContext);
  if (!store) {
    throw new Error('useTodoStore must be used within TodoStoreProvider');
  }
  return store;
};

export const TodoApp = observer(({ store }: TodoAppProps) => {
  const [view, setView] = useState<'list' | 'add' | 'stats'>('list');
  const [error, setError] = useState<string | null>(null);
  
  const { todoCount } = store;

  const handleAddTodo = (text: string) => {
    try {
      store.addTodo(text);
      setView('list');
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleClearCompleted = () => {
    store.clearCompleted();
  };

  return (
    <TodoStoreContext.Provider value={store}>
      {view === 'list' && (
        <>
          <b>📝 Todo List ({todoCount.active} active, {todoCount.completed} completed)</b>
          <br />
          <code>━━━━━━━━━━━━━━━━━━━━━━━━━━━━</code>
          <br />
          <br />
          <TodoList />
          <br />
          <row>
            <button onClick={() => setView('add')}>➕ Add</button>
            {todoCount.completed > 0 && (
              <button onClick={handleClearCompleted}>🗑️ Clear Completed</button>
            )}
          </row>
          <row>
            <button onClick={() => setView('stats')}>📊 Stats</button>
          </row>
        </>
      )}

      {view === 'add' && (
        <>
          <b>➕ Add New Todo</b>
          <br />
          <br />
          <i>Enter todo text (min 3 characters):</i>
          <br />
          <br />
          {error && (
            <>
              <code>❌ {error}</code>
              <br />
              <br />
            </>
          )}
          <TodoInput 
            onSubmit={handleAddTodo} 
          />
          <br />
          <row>
            <button onClick={() => setView('list')}>⬅️ Back</button>
          </row>
        </>
      )}

      {view === 'stats' && (
        <>
          <b>📊 Todo Statistics</b>
          <br />
          <br />
          <blockquote>
            Total todos: {todoCount.total}
            <br />
            Active: {todoCount.active}
            <br />
            Completed: {todoCount.completed}
            <br />
            Completion rate: {todoCount.total > 0 
              ? Math.round((todoCount.completed / todoCount.total) * 100) 
              : 0}%
          </blockquote>
          <br />
          <row>
            <button onClick={() => setView('list')}>⬅️ Back</button>
          </row>
        </>
      )}
    </TodoStoreContext.Provider>
  );
});
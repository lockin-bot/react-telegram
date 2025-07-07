/// <reference types="@react-telegram/core" />
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTodoStore } from './TodoApp';
import { TodoItem } from './TodoItem';

export const TodoList = observer(() => {
  const store = useTodoStore();
  
  if (store.todos.length === 0) {
    return <i>No todos yet! Click "Add" to create your first todo.</i>;
  }

  return (
    <>
      {store.activeTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
      {store.completedTodos.length > 0 && store.activeTodos.length > 0 && (
        <>
          <br />
          <code>───── Completed ─────</code>
          <br />
        </>
      )}
      {store.completedTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </>
  );
});
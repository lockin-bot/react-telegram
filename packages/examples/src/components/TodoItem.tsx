/// <reference types="@react-telegram/core" />
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTodoStore } from './TodoApp';
import { TodoItem as TodoItemType } from '../stores/TodoStore';

interface TodoItemProps {
  todo: TodoItemType;
}

export const TodoItem = observer(({ todo }: TodoItemProps) => {
  const store = useTodoStore();
  const [showActions, setShowActions] = useState(false);

  const handleToggle = () => {
    store.toggleTodo(todo.id);
  };

  const handleDelete = () => {
    store.deleteTodo(todo.id);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (showActions) {
    return (
      <>
        <b>{todo.completed ? '☑️' : '□'} {todo.text}</b>
        <br />
        <i>Created: {formatDate(todo.createdAt)}</i>
        {todo.completedAt && (
          <>
            <br />
            <i>Completed: {formatDate(todo.completedAt)}</i>
          </>
        )}
        <br />
        <row>
          <button onClick={handleToggle}>
            {todo.completed ? '↩️ Undo' : '✅ Complete'}
          </button>
          <button onClick={handleDelete}>🗑️ Delete</button>
          <button onClick={() => setShowActions(false)}>❌ Close</button>
        </row>
        <br />
      </>
    );
  }

  return (
    <>
      <row>
        <button onClick={() => setShowActions(true)}>
          {todo.completed ? '☑️' : '□'} {todo.completed ? <s>{todo.text}</s> : todo.text}
        </button>
      </row>
    </>
  );
});
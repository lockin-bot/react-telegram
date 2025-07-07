/// <reference types="@react-telegram/core" />
import React from 'react';

interface TodoInputProps {
  onSubmit: (text: string) => void;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onSubmit }) => {
  return (
    <>
      <i>Type your todo below (min 3 characters):</i>
      <br />
      <br />
      <input onSubmit={onSubmit} autoDelete />
    </>
  );
};
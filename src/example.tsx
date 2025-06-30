/// <reference path="./jsx.d.ts" />
import React, { useState } from 'react';
import { createContainer } from './reconciler';

// Example usage
const App = () => {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <b>Welcome to Telegram React!</b>
      {'\n'}
      <i>Current count: {count}</i>
      {'\n'}
      <row>
        <button onClick={() => setCount(p => p - 1)}>➖ Decrease</button>
        <button onClick={() => setCount(p => p + 1)}>➕ Increase</button>
      </row>
      {'\n'}
      <blockquote>
        This is a custom React reconciler that renders to structured data
        suitable for Telegram's message format.
      </blockquote>
    </>
  );
};

// Create container and render
const { render, clickButton } = createContainer();

console.log('Initial render:');
render(<App />);

console.log('\nClicking increase button (1-1):');
clickButton('1-1');

console.log('\nClicking increase button again:');
clickButton('1-1');

console.log('\nClicking decrease button (1-0):');
clickButton('1-0');
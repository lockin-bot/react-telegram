/// <reference path="./jsx.d.ts" />
import React, { useState } from 'react';
import { createContainer } from './reconciler';

// Create container and render
const { container, render, clickButton } = createContainer();

console.log('Initial render:');

// Example usage
const App = () => {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <b>Welcome to Telegram React!</b>
      <br />
      <i>Current count: {count}</i>
      <row>
        <button onClick={() => setCount(p => p - 1)}>➖ Decrease</button>
        <button onClick={() => setCount(p => p + 1)}>➕ Increase</button>
      </row>
      <blockquote>
        This is a custom React reconciler that renders to structured data
        suitable for Telegram's message format.
      </blockquote>
    </>
  );
};

console.log('Initial render');
render(<App />);

container.onRenderContainer = (root) => {
  console.log('onRenderContainer called');
  console.log(JSON.stringify(root, null, 2));
};

setTimeout(() => {
  console.log('\nClicking increase (0-1)');
  clickButton('0-1');
  
  setTimeout(() => {
    console.log('\nClicking decrease (0-0)');
    clickButton('0-0');
  }, 10);
}, 10);
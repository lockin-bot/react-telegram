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

setTimeout(() => {
  console.log('\nInitial state:');
  console.log(JSON.stringify(container.root, null, 2));
  console.log('Button handlers:', container.buttonHandlers.size);
  
  console.log('\nClicking increase (0-1)');
  clickButton('0-1');
  
  setTimeout(() => {
    console.log('\nAfter increase:');
    console.log(JSON.stringify(container.root, null, 2));
    
    console.log('\nClicking decrease (0-0)');
    clickButton('0-0');
    
    setTimeout(() => {
      console.log('\nAfter decrease:');
      console.log(JSON.stringify(container.root, null, 2));
    }, 10);
  }, 10);
}, 10);
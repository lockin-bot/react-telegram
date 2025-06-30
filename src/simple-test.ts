import React from 'react';
import { createContainer } from './reconciler';

// Test without vitest first
console.log('Testing reconciler...\n');

const { container, render, clickButton } = createContainer();

// Simple text test
render(React.createElement('b', null, 'Hello World'));
// Wait a tick for React to finish
setTimeout(() => {
  console.log('Simple bold text:');
  console.log(JSON.stringify(container.root, null, 2));
  
  // Clear for next test
  container.root.children = [];
  
  // Complex nested test
  render(
    React.createElement(React.Fragment, null,
      React.createElement('b', null, 
        'Bold ',
        React.createElement('i', null, 'italic'),
        ' text'
      ),
      '\n',
      React.createElement('row', null,
        React.createElement('button', { onClick: () => console.log('Button 1 clicked') }, 'Button 1'),
        React.createElement('button', { onClick: () => console.log('Button 2 clicked') }, 'Button 2')
      )
    )
  );
  
  setTimeout(() => {
    console.log('\nComplex nested structure:');
    console.log(JSON.stringify(container.root, null, 2));
    
    // Check button handlers
    console.log('\nButton handlers:', container.buttonHandlers);
    
    // Test button click
    console.log('\nTesting button clicks...');
    clickButton('0-0');
    clickButton('0-1');
  }, 10);
}, 0);
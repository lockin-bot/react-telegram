/// <reference path="./jsx.d.ts" />
import { describe, it, expect } from 'vitest';
import React, { useState } from 'react';
import { createContainer } from './reconciler';

describe('Telegram Reconciler - Persistence Mode', () => {
  it('should preserve static content in formatted elements during re-renders', async () => {
    const { container, render, clickButton } = createContainer();
    
    const App = () => {
      const [count, setCount] = useState(0);
      
      return (
        <>
          <b>Static bold text</b>
          <i>Count: {count}</i>
          <blockquote>Static quote content</blockquote>
          <row>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
          </row>
        </>
      );
    };
    
    render(<App />);
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check initial render
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'bold',
      children: [{ type: 'text', content: 'Static bold text' }]
    });
    
    expect(container.root.children[1]).toEqual({
      type: 'formatted',
      format: 'italic',
      children: [
        { type: 'text', content: 'Count: ' },
        { type: 'text', content: '0' }
      ]
    });
    
    expect(container.root.children[2]).toEqual({
      type: 'blockquote',
      children: [{ type: 'text', content: 'Static quote content' }]
    });
    
    // Click button to trigger re-render
    clickButton('0-0');
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Bold text should still have its content
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'bold',
      children: [{ type: 'text', content: 'Static bold text' }]
    });
    
    // Italic should update count but keep structure
    expect(container.root.children[1]).toEqual({
      type: 'formatted',
      format: 'italic',
      children: [
        { type: 'text', content: 'Count: ' },
        { type: 'text', content: '1' }
      ]
    });
    
    // Blockquote should still have its content
    expect(container.root.children[2]).toEqual({
      type: 'blockquote',
      children: [{ type: 'text', content: 'Static quote content' }]
    });
  });

  it('should handle mixed static and dynamic content', async () => {
    const { container, render, clickButton } = createContainer();
    
    const App = () => {
      const [show, setShow] = useState(true);
      
      return (
        <>
          <b>
            Always here
            {show && ' - Dynamic part'}
          </b>
          <row>
            <button onClick={() => setShow(s => !s)}>Toggle</button>
          </row>
        </>
      );
    };
    
    render(<App />);
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Initial state with dynamic part
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'bold',
      children: [
        { type: 'text', content: 'Always here' },
        { type: 'text', content: ' - Dynamic part' }
      ]
    });
    
    // Toggle to hide dynamic part
    clickButton('0-0');
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Should only have static part now
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'bold',
      children: [
        { type: 'text', content: 'Always here' }
      ]
    });
    
    // Toggle back
    clickButton('0-0');
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Should have both parts again
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'bold',
      children: [
        { type: 'text', content: 'Always here' },
        { type: 'text', content: ' - Dynamic part' }
      ]
    });
  });
});
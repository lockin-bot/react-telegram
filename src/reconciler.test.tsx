/// <reference path="./jsx.d.ts" />
import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';
import { createContainer } from './reconciler';

describe('Telegram Reconciler', () => {
  it('should render text formatting', async () => {
    const { container, render } = createContainer();
    
    render(
      <>
        <b>bold</b>
        <i>italic</i>
        <u>underline</u>
        <s>strikethrough</s>
        <span className="tg-spoiler">spoiler</span>
      </>
    );
    
    // Wait for React to finish rendering
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(container.root.children).toHaveLength(5);
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'bold',
      children: [{ type: 'text', content: 'bold' }]
    });
    expect(container.root.children[1]).toEqual({
      type: 'formatted',
      format: 'italic',
      children: [{ type: 'text', content: 'italic' }]
    });
  });

  it('should render nested formatting', async () => {
    const { container, render } = createContainer();
    
    render(
      <b>
        bold <i>italic bold</i> bold
      </b>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(container.root.children).toHaveLength(1);
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'bold',
      children: [
        { type: 'text', content: 'bold ' },
        {
          type: 'formatted',
          format: 'italic',
          children: [{ type: 'text', content: 'italic bold' }]
        },
        { type: 'text', content: ' bold' }
      ]
    });
  });

  it('should render links', async () => {
    const { container, render } = createContainer();
    
    render(
      <>
        <a href="http://www.example.com/">inline URL</a>
        <a href="tg://user?id=123456789">inline mention</a>
      </>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(container.root.children).toHaveLength(2);
    expect(container.root.children[0]).toEqual({
      type: 'link',
      href: 'http://www.example.com/',
      children: [{ type: 'text', content: 'inline URL' }]
    });
  });

  it('should render emoji', async () => {
    const { container, render } = createContainer();
    
    render(
      <tg-emoji emojiId="5368324170671202286">👍</tg-emoji>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(container.root.children).toHaveLength(1);
    expect(container.root.children[0]).toEqual({
      type: 'emoji',
      emojiId: '5368324170671202286',
      fallback: '👍'
    });
  });

  it('should render code blocks', async () => {
    const { container, render } = createContainer();
    
    render(
      <>
        <code>inline code</code>
        <pre>pre-formatted code</pre>
      </>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(container.root.children).toHaveLength(2);
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'code',
      children: [{ type: 'text', content: 'inline code' }]
    });
    expect(container.root.children[1]).toEqual({
      type: 'codeblock',
      content: 'pre-formatted code',
      language: undefined
    });
  });

  it('should render blockquotes', async () => {
    const { container, render } = createContainer();
    
    render(
      <>
        <blockquote>Regular quote</blockquote>
        <blockquote expandable>Expandable quote</blockquote>
      </>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(container.root.children).toHaveLength(2);
    expect(container.root.children[0]).toEqual({
      type: 'blockquote',
      children: [{ type: 'text', content: 'Regular quote' }],
      expandable: undefined
    });
    expect(container.root.children[1]).toEqual({
      type: 'blockquote',
      children: [{ type: 'text', content: 'Expandable quote' }],
      expandable: true
    });
  });

  it('should render buttons with IDs based on position', async () => {
    const { container, render } = createContainer();
    const onClick1 = vi.fn();
    const onClick2 = vi.fn();
    
    render(
      <row>
        <button onClick={onClick1}>Button 1</button>
        <button onClick={onClick2}>Button 2</button>
      </row>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(container.root.children).toHaveLength(1);
    const row = container.root.children[0];
    expect(row?.type).toBe('row');
    if (row?.type === 'row') {
      expect(row.children).toHaveLength(2);
      expect(row.children[0]?.id).toBe('0-0');
      expect(row.children[1]?.id).toBe('0-1');
    }
  });

  it('should handle button clicks', async () => {
    const { render, clickButton } = createContainer();
    const onClick = vi.fn();
    
    render(
      <row>
        <button onClick={onClick}>Click me</button>
      </row>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    clickButton('0-0');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should handle buttons with complex children', async () => {
    const { container, render } = createContainer();
    const onClick = vi.fn();
    const mode = 'normal';
    
    render(
      <row>
        <button onClick={onClick}>
          Switch to {mode === 'normal' ? 'Secret' : 'Normal'} Mode
        </button>
      </row>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const row = container.root.children[0];
    expect(row?.type).toBe('row');
    if (row?.type === 'row') {
      expect(row.children[0]?.text).toBe('Switch to Secret Mode');
    }
  });

  it('should handle buttons with array children', async () => {
    const { container, render } = createContainer();
    
    render(
      <row>
        <button>{'Hello'}{' '}{'World'}</button>
        <button>{['One', ' ', 'Two', ' ', 'Three']}</button>
        <button>{123} items</button>
      </row>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const row = container.root.children[0];
    expect(row?.type).toBe('row');
    if (row?.type === 'row') {
      expect(row.children[0]?.text).toBe('Hello World');
      expect(row.children[1]?.text).toBe('One Two Three');
      expect(row.children[2]?.text).toBe('123 items');
    }
  });

  it('should work with React state', async () => {
    const { container, render, clickButton } = createContainer();
    
    const App = () => {
      const [count, setCount] = useState(0);
      return (
        <>
          count {count}
          <row>
            <button onClick={() => setCount(p => p - 1)}>Decrease</button>
            <button onClick={() => setCount(p => p + 1)}>Increase</button>
          </row>
        </>
      );
    };
    
    render(<App />);
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Initial state - React creates separate text nodes
    expect(container.root.children[0]).toEqual({
      type: 'text',
      content: 'count '
    });
    expect(container.root.children[1]).toEqual({
      type: 'text',
      content: '0'
    });
    
    // The row is the third child (index 2)
    expect(container.root.children[2]?.type).toBe('row');
    
    // Click increase button
    clickButton('0-1');
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // After re-render, the text should update
    expect(container.root.children[1]).toEqual({
      type: 'text',
      content: '1'
    });
    
    // Click decrease button
    clickButton('0-0');
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(container.root.children[1]).toEqual({
      type: 'text',
      content: '0'
    });
  });

  it('should handle input elements', async () => {
    const { container, render } = createContainer();
    const onSubmit = vi.fn();
    
    render(
      <>
        <input onSubmit={onSubmit} />
        <input onSubmit={onSubmit} autoDelete />
      </>
    );
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(container.root.children).toHaveLength(2);
    expect(container.root.children[0]).toEqual({
      type: 'input',
      onSubmit: expect.any(Function),
      autoDelete: undefined
    });
    expect(container.root.children[1]).toEqual({
      type: 'input',
      onSubmit: expect.any(Function),
      autoDelete: true
    });
    
    // Check input callbacks
    expect(container.inputCallbacks).toHaveLength(2);
    expect(container.inputCallbacks[0]).toEqual({
      callback: expect.any(Function),
      autoDelete: undefined
    });
    expect(container.inputCallbacks[1]).toEqual({
      callback: expect.any(Function),
      autoDelete: true
    });
    
    // Test callback execution
    container.inputCallbacks[0]?.callback('test message');
    expect(onSubmit).toHaveBeenCalledWith('test message');
  });
});
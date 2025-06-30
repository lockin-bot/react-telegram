/// <reference path="./jsx.d.ts" />
import { describe, it, expect } from 'vitest';
import React, { useState } from 'react';
import { createContainer } from './reconciler';

describe('MtcuteAdapter Integration Tests', () => {
  it('should generate correct structure for a Telegram message', async () => {
    const { container, render } = createContainer();
    
    const App = () => (
      <>
        <b>Bold text</b>
        {' normal '}
        <i>italic</i>
        {'\n'}
        <a href="https://example.com">Link</a>
        {'\n'}
        <row>
          <button onClick={() => {}}>Yes</button>
          <button onClick={() => {}}>No</button>
        </row>
      </>
    );
    
    render(<App />);
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check text nodes (bold, ' normal ', italic, '\n', link, '\n')
    const textNodes = container.root.children.filter(n => n.type !== 'row');
    expect(textNodes).toHaveLength(6);
    
    // Check button row
    const rows = container.root.children.filter(n => n.type === 'row');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.type).toBe('row');
    if (rows[0]?.type === 'row') {
      expect(rows[0].children).toHaveLength(2);
      expect(rows[0].children[0]?.text).toBe('Yes');
      expect(rows[0].children[1]?.text).toBe('No');
    }
  });

  it('should handle interactive state changes', async () => {
    const { container, render, clickButton } = createContainer();
    
    const CounterApp = () => {
      const [count, setCount] = useState(0);
      
      return (
        <>
          <b>Count: {count}</b>
          {'\n'}
          <row>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
          </row>
        </>
      );
    };
    
    render(<CounterApp />);
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check initial state
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'bold',
      children: [
        { type: 'text', content: 'Count: ' },
        { type: 'text', content: '0' }
      ]
    });
    
    // Click button
    clickButton('0-0');
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check updated state
    expect(container.root.children[0]).toEqual({
      type: 'formatted',
      format: 'bold',
      children: [
        { type: 'text', content: 'Count: ' },
        { type: 'text', content: '1' }
      ]
    });
  });

  it('should handle all Telegram formatting types', async () => {
    const { container, render } = createContainer();
    
    const FormattingApp = () => (
      <>
        <b>Bold</b>
        {'\n'}
        <i>Italic</i>
        {'\n'}
        <u>Underline</u>
        {'\n'}
        <s>Strikethrough</s>
        {'\n'}
        <tg-spoiler>Spoiler</tg-spoiler>
        {'\n'}
        <code>code</code>
        {'\n'}
        <pre>code block</pre>
        {'\n'}
        <blockquote expandable>Quote</blockquote>
        {'\n'}
        <tg-emoji emojiId="123456">👍</tg-emoji>
      </>
    );
    
    render(<FormattingApp />);
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const formattedNodes = container.root.children.filter(n => n.type === 'formatted');
    const otherNodes = container.root.children.filter(n => n.type !== 'formatted' && n.type !== 'text');
    
    // Check we have all formatting types
    expect(formattedNodes).toHaveLength(6); // bold, italic, underline, strikethrough, spoiler, code
    expect(otherNodes).toHaveLength(3); // codeblock, blockquote, emoji
    
    // Check specific nodes
    const emoji = otherNodes.find(n => n.type === 'emoji');
    expect(emoji?.type).toBe('emoji');
    if (emoji?.type === 'emoji') {
      expect(emoji.emojiId).toBe('123456');
      expect(emoji.fallback).toBe('👍');
    }
    
    const blockquote = otherNodes.find(n => n.type === 'blockquote');
    expect(blockquote?.type).toBe('blockquote');
    if (blockquote?.type === 'blockquote') {
      expect(blockquote.expandable).toBe(true);
    }
  });
});
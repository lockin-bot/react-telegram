import { describe, it, expect } from 'bun:test';
import { createContainer } from './reconciler';
import React from 'react';

describe('React Telegram Reconciler', () => {
  it('should create a container', () => {
    const { container, render } = createContainer();
    expect(container.root).toEqual({ type: 'root', children: [] });
  });

  it('should render text content', (done) => {
    const { container, render } = createContainer();
    render(React.createElement('span', null, 'Hello World'));
    
    setTimeout(() => {
      expect(container.root.children).toHaveLength(1);
      expect(container.root.children[0]).toMatchObject({
        type: 'formatted',
        format: 'bold',
        children: [{ type: 'text', content: 'Hello World' }]
      });
      done();
    }, 0);
  });

  it('should render bold text', (done) => {
    const { container, render } = createContainer();
    render(React.createElement('b', null, 'Bold text'));
    
    setTimeout(() => {
      expect(container.root.children[0]).toMatchObject({
        type: 'formatted',
        format: 'bold',
        children: [{ type: 'text', content: 'Bold text' }]
      });
      done();
    }, 0);
  });

  it('should render line breaks', (done) => {
    const { container, render } = createContainer();
    render(React.createElement('br'));
    
    setTimeout(() => {
      expect(container.root.children[0]).toMatchObject({
        type: 'text',
        content: '\n'
      });
      done();
    }, 0);
  });

  it('should handle buttons with onClick', (done) => {
    const { container, render, clickButton } = createContainer();
    let clicked = false;
    
    render(React.createElement('row', null,
      React.createElement('button', { onClick: () => { clicked = true; } }, 'Click me')
    ));
    
    setTimeout(() => {
      expect(container.root.children[0]).toMatchObject({
        type: 'row',
        children: [{
          type: 'button',
          text: 'Click me',
          id: '0-0'
        }]
      });
      
      clickButton('0-0');
      expect(clicked).toBe(true);
      done();
    }, 0);
  });
});
/// <reference path="./jsx.d.ts" />
import React, { useState } from 'react';
import { createContainer } from './reconciler';
import type { RootNode } from './reconciler';

// This example demonstrates TypeScript support with custom JSX elements

const TypedApp: React.FC = () => {
  const [showSpoiler, setShowSpoiler] = useState(false);
  
  return (
    <>
      <b>TypeScript Example</b>
      <br />
      <i>All custom elements are properly typed!</i>
      <br />
      <br />
      
      {/* Text formatting */}
      <u>Underlined text</u>
      {' '}
      <s>Strikethrough</s>
      {' '}
      <code>inline code</code>
      <br />
      <br />
      
      {/* Spoiler */}
      {showSpoiler ? (
        <tg-spoiler>Secret message!</tg-spoiler>
      ) : (
        <span className="tg-spoiler">Hidden content</span>
      )}
      <br />
      <br />
      
      {/* Links */}
      <a href="https://telegram.org">Telegram Website</a>
      {' | '}
      <a href="tg://user?id=123456">User mention</a>
      <br />
      <br />
      
      {/* Emoji */}
      <tg-emoji emojiId="5368324170671202286">👍</tg-emoji>
      <br />
      <br />
      
      {/* Code block */}
      <pre>
        <code class="language-typescript">
          {`const message = "Hello, Telegram!";
console.log(message);`}
        </code>
      </pre>
      <br />
      
      {/* Blockquote */}
      <blockquote expandable>
        This is an expandable quote.
        It can contain multiple lines.
      </blockquote>
      <br />
      <br />
      
      {/* Interactive buttons */}
      <row>
        <button onClick={() => setShowSpoiler(!showSpoiler)}>
          {showSpoiler ? 'Hide' : 'Show'} Spoiler
        </button>
        <button onClick={() => console.log('Clicked!')}>
          Log Message
        </button>
      </row>
    </>
  );
};

// Create container with proper typing
const { render, container } = createContainer();

// Render the app
render(<TypedApp />);

// Wait for render to complete
setTimeout(() => {
  // Access the typed output
  const output: RootNode = container.root;

  console.log('Typed output structure:');
  console.log(JSON.stringify(output, null, 2));

  // Type-safe access to nodes
  console.log('\nAnalyzing node types:');
  output.children.forEach(child => {
    switch (child.type) {
      case 'formatted':
        console.log(`- Found ${child.format} formatting`);
        break;
      case 'row':
        console.log(`- Found row with ${child.children.length} buttons`);
        break;
      case 'link':
        console.log(`- Found link to ${child.href}`);
        break;
      case 'emoji':
        console.log(`- Found emoji with ID ${child.emojiId}`);
        break;
      case 'codeblock':
        console.log(`- Found code block with language: ${child.language || 'none'}`);
        break;
      case 'blockquote':
        console.log(`- Found ${child.expandable ? 'expandable' : 'regular'} blockquote`);
        break;
    }
  });
}, 0);
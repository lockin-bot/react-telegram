/// <reference path="./jsx.d.ts" />
import React, { useState } from 'react';
import { createContainer } from './reconciler';

const InputExample: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [waitingForInput, setWaitingForInput] = useState(true);

  const handleInput = (text: string) => {
    setMessages(prev => [...prev, `You said: ${text}`]);
    // Keep waiting for more input
  };

  const clearMessages = () => {
    setMessages([]);
    setWaitingForInput(true);
  };

  return (
    <>
      <b>Input Example</b>
      {'\n\n'}
      
      {messages.length === 0 ? (
        <>
          <i>Reply to this message to send text!</i>
          {'\n\n'}
          The bot will echo whatever you type.
        </>
      ) : (
        <>
          <b>Message History:</b>
          {'\n'}
          {messages.map((msg, idx) => (
            <React.Fragment key={idx}>
              {msg}
              {'\n'}
            </React.Fragment>
          ))}
        </>
      )}
      
      {'\n\n'}
      
      {/* Input handler - will process any reply to this message */}
      {waitingForInput && <input onSubmit={handleInput} />}
      
      {/* Button to clear history */}
      {messages.length > 0 && (
        <row>
          <button onClick={clearMessages}>Clear History</button>
          <button onClick={() => setWaitingForInput(!waitingForInput)}>
            {waitingForInput ? 'Stop Input' : 'Start Input'}
          </button>
        </row>
      )}
    </>
  );
};

// Create container and render
const { render, container } = createContainer();
render(<InputExample />);

// Log the output for debugging
setTimeout(() => {
  console.log('Input example output:');
  console.log(JSON.stringify(container.root, null, 2));
  console.log(`Input callbacks registered: ${container.inputCallbacks.length}`);
}, 0);
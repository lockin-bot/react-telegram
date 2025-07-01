/// <reference types="@react-telegram/core" />
import React, { useState } from 'react';
import { MtcuteAdapter } from '@react-telegram/mtcute-adapter';

const AutoDeleteDemo: React.FC = () => {
  const [mode, setMode] = useState<'normal' | 'secret'>('normal');
  const [messages, setMessages] = useState<string[]>([]);

  const handleNormalInput = (text: string) => {
    setMessages(prev => [...prev, `Normal message: ${text}`]);
  };

  const handleSecretInput = (text: string) => {
    setMessages(prev => [...prev, `Secret received (message deleted): ***`]);
  };

  const toggleMode = () => {
    setMode(mode === 'normal' ? 'secret' : 'normal');
    setMessages([]);
  };

  return (
    <>
      <b>Input Auto-Delete Demo</b>
      <br /><br />
      Current mode: <b>{mode === 'normal' ? '📝 Normal Mode' : '🤫 Secret Mode'}</b>
      <br /><br />
      
      {mode === 'normal' ? (
        <>
          <i>Send any message - it will stay in the chat.</i>
          <br />
          <input onSubmit={handleNormalInput} />
        </>
      ) : (
        <>
          <i>Send a secret message - it will be deleted automatically!</i>
          <br />
          <input onSubmit={handleSecretInput} autoDelete />
        </>
      )}
      
      <br />
      <br />
      
      {messages.length > 0 && (
        <>
          <b>Received Messages:</b>
          <br />
          {messages.map((msg, idx) => (
            <React.Fragment key={idx}>
              • {msg}
              <br />
            </React.Fragment>
          ))}
          <br />
        </>
      )}
      
      <row>
        <button onClick={toggleMode}>
          Switch to {mode === 'normal' ? 'Secret' : 'Normal'} Mode
        </button>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])}>Clear</button>
        )}
      </row>
    </>
  );
};

// Set up the bot
async function main() {
  const adapter = new MtcuteAdapter({
    apiId: parseInt(process.env.API_ID!),
    apiHash: process.env.API_HASH!,
    botToken: process.env.BOT_TOKEN!
  });

  // Register the demo command
  adapter.onCommand('autodelete', () => <AutoDeleteDemo />);

  // Start the bot
  await adapter.start(process.env.BOT_TOKEN!);
  console.log('Auto-delete demo bot is running! Send /autodelete to start.');
}

main().catch(console.error);
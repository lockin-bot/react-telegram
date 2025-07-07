/// <reference types="@react-telegram/core" />
import React, { useState, useEffect } from 'react';
import { MtcuteAdapter } from '@react-telegram/mtcute-adapter';

// Timer component with useEffect and setInterval
const TimerApp = () => {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    // Only set up interval if isRunning is true
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    // Cleanup function to clear interval
    return () => {
      clearInterval(interval);
    };
  }, [isRunning]); // Re-run effect when isRunning changes

  return (
    <>
      <b>⏱️ Timer with useEffect</b>
      <br />
      <br />
      <i>Seconds elapsed: {count}</i>
      <br />
      <br />
      Status: {isRunning ? '🟢 Running' : '🔴 Paused'}
      <br />
      <br />
      <row>
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? '⏸️ Pause' : '▶️ Resume'}
        </button>
        <button onClick={() => setCount(0)}>🔄 Reset</button>
      </row>
      <br />
      <blockquote>
        This example demonstrates useEffect with setInterval.
        The timer automatically increments every second and properly
        cleans up when paused or when the component unmounts.
      </blockquote>
    </>
  );
};

// Main bot setup
async function main() {
  // You'll need to set these environment variables
  const config = {
    apiId: parseInt(process.env.API_ID || '0'),
    apiHash: process.env.API_HASH || '',
    storage: process.env.STORAGE_PATH || '.mtcute'
  };
  
  const botToken = process.env.BOT_TOKEN || '';
  
  if (!config.apiId || !config.apiHash || !botToken) {
    console.error('Please set API_ID, API_HASH, and BOT_TOKEN environment variables');
    process.exit(1);
  }
  
  const adapter = new MtcuteAdapter(config);
  
  // Set up command handler for timer
  adapter.onCommand('timer', () => <TimerApp />);
  adapter.onCommand('start', () => (
    <>
      <b>🤖 Timer Bot</b>
      <br />
      <br />
      Welcome! This bot demonstrates useEffect with setInterval.
      <br />
      <br />
      Use /timer to start the timer example.
    </>
  ));
  
  // Start the bot
  await adapter.start(botToken);
  
  console.log('Timer bot is running! Send /start to begin.');
}

// Run the bot
main().catch(console.error);
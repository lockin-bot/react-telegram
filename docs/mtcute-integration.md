# MTCute Integration

This project includes an adapter for using the React Telegram reconciler with [MTCute](https://github.com/mtcute/mtcute), a TypeScript library for Telegram's MTProto API.

## Setup

1. Install dependencies:
```bash
bun add @mtcute/bun @mtcute/dispatcher @mtcute/html-parser
```

2. Create a `.env` file with your Telegram credentials:
```env
API_ID=your_api_id
API_HASH=your_api_hash
BOT_TOKEN=your_bot_token
```

3. Get your API credentials from https://my.telegram.org
4. Create a bot and get the token from @BotFather on Telegram

## Usage

### Basic Example

```tsx
import React, { useState } from 'react';
import { MtcuteAdapter } from './mtcute-adapter';

// Create your React component
const CounterApp = () => {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <b>Counter: {count}</b>
      {'\n'}
      <row>
        <button onClick={() => setCount(c => c - 1)}>➖</button>
        <button onClick={() => setCount(c => c + 1)}>➕</button>
      </row>
    </>
  );
};

// Set up the bot
const adapter = new MtcuteAdapter({
  apiId: parseInt(process.env.API_ID!),
  apiHash: process.env.API_HASH!,
  botToken: process.env.BOT_TOKEN!,
});

// Handle commands
adapter.onCommand('counter', () => <CounterApp />);

// Start the bot
await adapter.start(process.env.BOT_TOKEN!);
```

### How It Works

1. **React to Telegram Conversion**: The adapter converts the React tree into Telegram's message format:
   - Text nodes → Plain text
   - Formatting elements → MessageEntity objects
   - `<row>` elements → InlineKeyboardMarkup
   - `<button>` elements → InlineKeyboardButton

2. **Button Click Handling**: 
   - Each button gets a unique ID based on its position
   - Clicks are routed back to the React component via callback queries
   - The component re-renders and updates the message

3. **State Management**:
   - Each message has its own React container
   - State is preserved between button clicks
   - Containers are cleaned up automatically (keeps last 100)

### Supported Elements

All elements from the reconciler are supported:

- **Text Formatting**: `<b>`, `<i>`, `<u>`, `<s>`, `<code>`
- **Special Elements**: `<tg-spoiler>`, `<tg-emoji>`
- **Links**: `<a href="...">`
- **Code Blocks**: `<pre>`, with optional language
- **Quotes**: `<blockquote>`, with `expandable` prop
- **Buttons**: `<row>` with `<button>` children

### Advanced Features

#### Editing Messages

```tsx
// Edit an existing message
await adapter.editReactMessage(chatId, messageId, <UpdatedApp />);
```

#### Custom Handlers

```tsx
// Access the underlying MTCute client and dispatcher
const client = adapter.getClient();
const dispatcher = adapter.getDispatcher();

// Add custom handlers
dispatcher.onNewMessage(async (msg) => {
  // Custom logic
});
```

#### Message Callbacks

```tsx
// React to message updates
container.onRenderContainer = (root) => {
  console.log('Message updated:', root);
};
```

## Example Bot

See `src/example-bot.tsx` for a complete example bot with:
- Interactive counter
- Todo list manager
- Help system with navigation
- All formatting demonstrations
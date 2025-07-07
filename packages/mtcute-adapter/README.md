# @react-telegram/mtcute-adapter

MTCute adapter for React Telegram bots. This package provides the integration between React Telegram's core reconciler and the MTCute Telegram client library.

## Installation

```bash
bun add @react-telegram/mtcute-adapter @react-telegram/core react
```

## Usage

```tsx
import React from 'react';
import { TelegramClient } from '@mtcute/bun';
import { MtcuteAdapter } from '@react-telegram/mtcute-adapter';

const Bot = () => (
  <>
    <b>Hello from React Telegram!</b>
    <br />
    <br />
    <row>
      <button onClick={() => console.log('clicked!')}>Click me</button>
    </row>
  </>
);

async function main() {
  // Option 1: Pass a TelegramClient directly
  const client = new TelegramClient({
    apiId: parseInt(process.env.API_ID!),
    apiHash: process.env.API_HASH!,
    storage: '.mtcute'
  });
  
  const adapter = new MtcuteAdapter(client);

  // Option 2: Let the adapter create the client
  const adapter2 = new MtcuteAdapter({
    apiId: parseInt(process.env.API_ID!),
    apiHash: process.env.API_HASH!,
    storage: '.mtcute' // optional, defaults to '.mtcute'
  });

  adapter.onCommand('start', () => <Bot />);
  
  // Start the bot with token (required)
  await adapter.start(process.env.BOT_TOKEN!);
  
  console.log('Bot is running!');
}

main().catch(console.error);
```

## Features

- Full React component support for Telegram messages
- Automatic message updates when state changes
- Button click handling
- Text input support with auto-delete option
- Command handling
- TypeScript support

## API

### MtcuteAdapter

```typescript
// Option 1: Pass a TelegramClient
const adapter = new MtcuteAdapter(telegramClient);

// Option 2: Pass a config object
const adapter = new MtcuteAdapter({
  apiId: number,
  apiHash: string,
  storage?: string // Default: '.mtcute'
});
```

### Methods

- `onCommand(command: string, handler: (ctx: MessageContext) => ReactElement)` - Register a command handler
- `start(botToken: string)` - Start the bot (botToken is required)
- `sendReactMessage(chatId: number | string, app: ReactElement)` - Send a React-powered message
- `getClient()` - Get the underlying MTCute client
- `getDispatcher()` - Get the MTCute dispatcher

## License

MIT
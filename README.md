# React Telegram ⚛️🤖

Build interactive Telegram bots using React components! This monorepo contains packages for creating Telegram bots with familiar React patterns, state management, and full TypeScript support.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=white)

## 📦 Packages

### [@react-telegram/core](./packages/core)
Core React reconciler for building Telegram bot interfaces. Translates React components into Telegram message structures.

### [@react-telegram/mtcute-adapter](./packages/mtcute-adapter) 
MTCute adapter that connects the React reconciler with the Telegram Bot API.

### [Examples](./packages/examples)
Complete example bots demonstrating various features and patterns.

## 🚀 Installation

```bash
# Using bun (recommended)
bun add @react-telegram/core @react-telegram/mtcute-adapter

# Using npm
npm install @react-telegram/core @react-telegram/mtcute-adapter

# Using yarn
yarn add @react-telegram/core @react-telegram/mtcute-adapter
```

## ✨ Features

- **React Components**: Write bot interfaces using familiar React syntax
- **State Management**: Full React state with `useState`, `useEffect`, and hooks
- **Interactive Elements**: Buttons with onClick handlers, text inputs
- **Rich Formatting**: Bold, italic, code blocks, spoilers, links, and more
- **Message Updates**: Automatic message editing when state changes
- **TypeScript Support**: Full type safety with autocompletion
- **Line Breaks**: Use `<br />` tags for clean formatting

## 📱 Quick Example

```tsx
import React, { useState } from 'react';
import { MtcuteAdapter } from '@react-telegram/mtcute-adapter';

const CounterBot = () => {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <b>Counter Bot 🤖</b>
      <br />
      <br />
      Current count: <b>{count}</b>
      <br />
      <br />
      <row>
        <button onClick={() => setCount(count - 1)}>➖ Decrease</button>
        <button onClick={() => setCount(count + 1)}>➕ Increase</button>
      </row>
    </>
  );
};

// Initialize the bot
async function main() {
  const adapter = new MtcuteAdapter({
    apiId: parseInt(process.env.API_ID!),
    apiHash: process.env.API_HASH!,
    botToken: process.env.BOT_TOKEN!
  });

  adapter.onCommand('start', () => <CounterBot />);
  await adapter.start(process.env.BOT_TOKEN!);
  
  console.log('Bot is running!');
}

main().catch(console.error);
```

## 🛠️ Development Setup

This project uses Bun workspaces for managing multiple packages.

```bash
# Clone the repository
git clone https://github.com/your-username/react-telegram.git
cd react-telegram

# Install dependencies
bun install

# Run examples
cd packages/examples
bun run start
```

### Environment Variables

Create a `.env` file in the examples package:

```env
API_ID=your_telegram_api_id
API_HASH=your_telegram_api_hash
BOT_TOKEN=your_bot_token_from_botfather
```

Get your credentials from:
- Bot token: [@BotFather](https://t.me/botfather)
- API credentials: [my.telegram.org](https://my.telegram.org)

## 📖 Supported Elements

### Text Formatting
- `<b>`, `<strong>` - Bold text
- `<i>`, `<em>` - Italic text
- `<u>`, `<ins>` - Underlined text
- `<s>`, `<strike>`, `<del>` - Strikethrough
- `<code>` - Inline code
- `<pre>` - Code blocks
- `<br />` - Line breaks

### Telegram-Specific
- `<tg-spoiler>` - Hidden spoiler text
- `<tg-emoji emojiId="">` - Custom emoji
- `<blockquote expandable>` - Quotes
- `<a href="">` - Links

### Interactive Elements
- `<button onClick={}>` - Inline keyboard buttons
- `<row>` - Button row container
- `<input onSubmit={} autoDelete>` - Text input handler

## 🎯 Advanced Examples

### Todo List Bot
```tsx
const TodoBot = () => {
  const [todos, setTodos] = useState<string[]>([]);
  
  return (
    <>
      <b>📝 Todo List</b>
      <br />
      <br />
      {todos.length === 0 ? (
        <i>No todos yet!</i>
      ) : (
        todos.map((todo, i) => (
          <>
            {i + 1}. {todo}
            <br />
          </>
        ))
      )}
      <br />
      <row>
        <button onClick={() => setTodos([...todos, `Task ${todos.length + 1}`])}>
          ➕ Add Task
        </button>
        <button onClick={() => setTodos(todos.slice(0, -1))}>
          ➖ Remove Last
        </button>
      </row>
    </>
  );
};
```

### Input Handling
```tsx
const InputBot = () => {
  const [name, setName] = useState('');
  
  return (
    <>
      <b>What's your name?</b>
      <br />
      <br />
      {name && <>Hello, {name}!</>}
      <input 
        onSubmit={(text) => setName(text)} 
        autoDelete // Automatically delete user's message
      />
    </>
  );
};
```

## 🏗️ Project Structure

```
react-telegram/
├── packages/
│   ├── core/              # Core React reconciler
│   │   ├── src/
│   │   │   ├── reconciler.ts
│   │   │   ├── jsx.d.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── mtcute-adapter/    # MTCute Telegram adapter
│   │   ├── src/
│   │   │   ├── mtcute-adapter.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── examples/          # Example bots
│       ├── src/
│       │   ├── example-bot.tsx
│       │   ├── quiz-bot.tsx
│       │   └── ...
│       └── package.json
│
└── package.json          # Root workspace configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MTCute](https://mtcute.dev/) for the Telegram client library
- [React](https://react.dev/) for the component model
- [Bun](https://bun.sh/) for the fast runtime

---

**[⭐ Star this repo](https://github.com/your-username/react-telegram)** if you find it useful!

Built with ❤️ and React
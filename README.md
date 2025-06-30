# React Telegram Bot ⚛️🤖

Build interactive Telegram bots using React components with state management, just like a web app!

![Demo](https://img.shields.io/badge/demo-live-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=white)

## ✨ Features

- **React Components**: Write bot interfaces using familiar React syntax
- **State Management**: Full React state with `useState`, `useEffect`, and more
- **Interactive Buttons**: onClick handlers that work just like web buttons
- **Rich Text Formatting**: Bold, italic, code blocks, spoilers, and more
- **Message Editing**: Efficient updates using Telegram's edit message API
- **TypeScript Support**: Full type safety throughout
- **Hot Reload**: Instant development feedback with Bun's hot reload

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/react-telegram-bot.git
cd react-telegram-bot

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Telegram bot credentials

# Run the bot
bun run src/example-bot.tsx
```

## 📱 Example Bot

Here's a complete interactive counter bot in just a few lines:

```tsx
import React, { useState } from 'react';
import { MtcuteAdapter } from './mtcute-adapter';

const CounterApp = () => {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <b>🔢 Counter Bot</b>
      {'\n\n'}
      <i>Current count: {count}</i>
      {'\n\n'}
      <row>
        <button onClick={() => setCount(c => c - 1)}>➖ Decrease</button>
        <button onClick={() => setCount(c => c + 1)}>➕ Increase</button>
      </row>
      <row>
        <button onClick={() => setCount(0)}>🔄 Reset</button>
      </row>
    </>
  );
};

// Set up the bot
const adapter = new MtcuteAdapter(config);
adapter.onCommand('counter', () => <CounterApp />);
```

## 🎯 What Makes This Special?

### Real React State Management
Components maintain state between interactions, just like in a web app:

```tsx
const TodoApp = () => {
  const [todos, setTodos] = useState(['Buy milk', 'Learn React']);
  
  return (
    <>
      <b>📝 Todo List</b>
      {todos.map(todo => <>{todo}{'\n'}</>)}
      <button onClick={() => setTodos([...todos, 'New task'])}>
        ➕ Add Task
      </button>
    </>
  );
};
```

### Rich Text Formatting
Support for all Telegram formatting features:

```tsx
<>
  <b>Bold</b> and <i>italic</i> text
  <code>inline code</code>
  <pre>Code blocks</pre>
  <blockquote>Quotes</blockquote>
  <tg-spoiler>Hidden text</tg-spoiler>
  <a href="https://example.com">Links</a>
</>
```

### Efficient Message Updates
The bot automatically uses Telegram's edit message API for updates instead of sending multiple messages:

- ✅ First render: Sends new message  
- ✅ State changes: Edits existing message
- ✅ No message spam in chats

## 🛠️ Built With

- **[MTCute](https://mtcute.dev/)** - Modern Telegram client library
- **[React](https://react.dev/)** - UI library with custom reconciler
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
- **[TypeScript](https://typescriptlang.org/)** - Type safety

## 📖 How It Works

This project implements a custom React reconciler that translates React components into Telegram messages:

1. **React Components** → **Virtual DOM Tree**
2. **Custom Reconciler** → **Telegram Message Structure**
3. **Message Renderer** → **Rich Text + Inline Keyboards**
4. **State Updates** → **Message Edits**

The reconciler handles:
- Text formatting (`<b>`, `<i>`, `<code>`, etc.)
- Interactive buttons with click handlers
- Message layout with rows and columns
- Efficient updates via message editing

## 🎮 Example Bots Included

### 🔢 Counter Bot
Interactive counter with increment/decrement buttons

### 📝 Todo List Bot  
Full todo list manager with add/remove/toggle functionality

### ❓ Help Bot
Multi-section help system with navigation

### 🎨 Formatting Demo
Showcase of all supported Telegram formatting features

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- Telegram API credentials from [my.telegram.org](https://my.telegram.org)

### Environment Setup
```bash
# Required environment variables
API_ID=your_api_id
API_HASH=your_api_hash
BOT_TOKEN=your_bot_token
STORAGE_PATH=.mtcute  # Optional
```

### Development
```bash
# Run with hot reload
bun --hot src/example-bot.tsx

# Run tests
bun test

# Type check
bun run tsc --noEmit
```

## 📚 API Reference

### MtcuteAdapter
```tsx
const adapter = new MtcuteAdapter({
  apiId: number,
  apiHash: string,
  botToken: string,
  storage?: string
});

// Register command handlers
adapter.onCommand('start', (ctx) => <YourComponent />);

// Start the bot
await adapter.start();
```

### Supported Elements
- `<b>`, `<i>`, `<u>`, `<s>` - Text formatting
- `<code>`, `<pre>` - Code formatting  
- `<blockquote>` - Quotes
- `<tg-spoiler>` - Spoiler text
- `<a href="">` - Links
- `<button onClick={}>` - Interactive buttons
- `<row>` - Button layout

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MTCute](https://mtcute.dev/) for the excellent Telegram client library
- [React team](https://react.dev/) for the reconciler architecture
- [Bun team](https://bun.sh/) for the amazing runtime

---

**[⭐ Star this repo](https://github.com/your-username/react-telegram-bot)** if you find it useful!

Built with ❤️ and React

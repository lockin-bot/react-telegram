# Persistent Todo Bot Example

This example demonstrates how to build a Telegram bot with persistent state using React, MobX, and custom storage adapters.

## Features

- **State Persistence**: Todos are automatically saved to disk and restored on bot restart
- **Message Persistence**: Bot messages are edited instead of recreated after restarts
- **MobX Integration**: Reactive state management with MobX
- **Custom Storage**: Flexible storage layer with file-based and memory implementations
- **Full CRUD Operations**: Add, complete, edit, and delete todos
- **Statistics View**: Track your productivity with todo statistics
- **Comprehensive Tests**: Unit and integration tests with Vitest

## Running the Bot

1. Set up environment variables:
```bash
export API_ID=your_api_id
export API_HASH=your_api_hash
export BOT_TOKEN=your_bot_token
```

2. Run the bot:
```bash
bun run persist
```

3. Send `/start` to your bot on Telegram

## Bot Commands

The bot now uses a single `/start` command with an interactive interface:
- Type `/help` or click the Help button to see available commands
- Type `/todo` or click Manage Todos to access your todo list
- Commands can be typed anywhere in the interface when input is available

## Architecture

### Adapter Configuration
- Uses the new MtcuteAdapter API that accepts a TelegramClient instance
- Message persistence to edit existing messages after bot restarts
- Single `/start` command with all functionality in one React component
- Interactive navigation between views using buttons and text commands

### State Management
- **MobX Store**: Manages todo state with reactive updates
- **mobx-persist-store**: Automatically persists state changes
- **Custom Storage Adapter**: Saves to `./storage/todos.json`

### Components
- **TodoApp**: Root component with navigation
- **TodoList**: Displays active and completed todos
- **TodoItem**: Individual todo with actions
- **TodoInput**: Handles user input for new todos

### Storage
- **IStorage**: Abstract storage interface
- **FileStorage**: JSON file-based storage
- **MemoryStorage**: In-memory storage for testing
- **MessageIdStorage**: Manages Telegram message IDs for persistence

## Testing

Run tests with:
```bash
bun test
```

View test UI:
```bash
bun test:ui
```

## File Structure
```
src/
├── persist-todo-bot.tsx      # Main bot entry point
├── components/
│   ├── TodoApp.tsx          # Root component
│   ├── TodoList.tsx         # List view
│   ├── TodoItem.tsx         # Item component
│   └── TodoInput.tsx        # Input handler
├── stores/
│   ├── TodoStore.ts         # MobX store
│   └── RootStore.ts         # Root store
└── storage/
    ├── IStorage.ts          # Storage interface
    ├── FileStorage.ts       # File storage
    └── MemoryStorage.ts     # Memory storage
```

## How It Works

1. **State Persistence**: Every state change is automatically saved to disk
2. **Message Persistence**: Message IDs are saved so bot can edit existing messages after restart
3. **Restoration**: On bot restart, todos and message IDs are loaded from storage
4. **Reactive UI**: MobX ensures UI updates when state changes
5. **Input Handling**: User messages are captured as todo input

## Future Enhancements

- Multi-user support with separate storage
- Todo categories and tags
- Due dates and reminders
- Export/import functionality
- Backup to cloud storage
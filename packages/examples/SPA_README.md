# SPA Todo Bot Example

This example demonstrates the new MtcuteSPAAdapter which provides a true Single Page Application experience for Telegram bots.

## Key Features

### 1. **Single Message Paradigm**
- All interactions happen within a single message per chat
- Commands don't create new messages - they update the existing one
- Provides a seamless, app-like experience

### 2. **Per-Chat State Management**
- Each chat has its own isolated state
- State persists across bot restarts
- Built-in React hooks for state management

### 3. **Button Persistence**
- Buttons continue to work after bot restarts
- No "session expired" errors
- Automatic session restoration

### 4. **React Hooks API**
- `useTgState()` - Similar to useState but with automatic persistence
- `useTgChatId()` - Get the current chat ID
- State changes are automatically saved

## Usage

```tsx
import { MtcuteSPAAdapter, useTgState } from '@react-telegram/mtcute-adapter';

const TodoApp = () => {
  // State is automatically persisted per chat
  const [todos, setTodos] = useTgState<Todo[]>('todos', []);
  const [view, setView] = useTgState<string>('view', 'list');
  
  return (
    <>
      <b>My SPA Bot</b>
      {/* Your UI here */}
    </>
  );
};

// Set up the adapter
const adapter = new MtcuteSPAAdapter(client, {
  storageAdapter: myStorageAdapter
});

adapter.registerApp(<TodoApp />);
await adapter.start(botToken);
```

## Architecture

### State Storage
The adapter uses a pluggable storage system:

```typescript
interface SPAStorageAdapter {
  getState(chatId: string): Promise<SPAState | null>;
  setState(chatId: string, state: SPAState): Promise<void>;
  deleteState(chatId: string): Promise<void>;
}
```

### State Structure
Each chat's state includes:
- `messageId` - The Telegram message ID to edit
- `lastContent` - The last rendered content
- `lastKeyboard` - The last rendered keyboard
- `appState` - Your application's state

### TgStateProvider
The adapter automatically wraps your app with `TgStateProvider`:
- Provides React context for state management
- Handles state persistence automatically
- Isolates state per chat

## Running the Example

1. Set environment variables:
```bash
export API_ID=your_api_id
export API_HASH=your_api_hash
export BOT_TOKEN=your_bot_token
```

2. Run the bot:
```bash
bun run spa
```

3. Send any message to your bot to start

## Differences from Traditional Bots

1. **No Command Registration** - Just send any message to interact
2. **Stateful** - The bot remembers your state between messages
3. **Single Message** - All updates happen in one message
4. **Session Persistence** - Works seamlessly across restarts

## Best Practices

1. Use `useTgState` for any data that should persist
2. Keep state minimal for better performance
3. Handle loading states while data is being restored
4. Test button functionality after restarts

## Future Enhancements

- Multi-step flows with navigation
- Animation support
- File upload handling
- Inline query support
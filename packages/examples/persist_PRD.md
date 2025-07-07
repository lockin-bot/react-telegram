# Persistent Todo App Example - Product Requirements Document

## Overview
We will implement a sophisticated Todo app example that demonstrates state persistence across bot restarts using MobX and custom storage layers. This example will showcase advanced patterns for building production-ready Telegram bots with React.

## Objectives
1. Create a fully-featured Todo app with persistent state
2. Demonstrate best practices for state management in Telegram bots
3. Provide comprehensive test coverage using Vitest
4. Show how to restore bot UI state after restarts

## Technical Architecture

### State Management
- **MobX** for reactive state management
- **mobx-persist-store** for automatic persistence
- Custom storage adapter for file-based persistence

### Storage Layer
- JSON file storage in `./storage/todos.json`
- Add `./storage` to `.gitignore`
- Abstract storage interface for testing (memory storage mock)

### MtcuteAdapter Enhancement
- Add support for `messageId` parameter to edit existing messages on restart
- Store active message IDs in persistent storage
- Gracefully handle missing/invalid message IDs

## Feature Requirements

### Todo Item Structure
```typescript
interface TodoItem {
  id: string;          // UUID
  text: string;        // Todo description
  completed: boolean;  // Completion status
  createdAt: Date;     // Timestamp
  completedAt?: Date;  // Optional completion timestamp
}
```

### Core Features

#### 1. Todo List View
- Display all todos with completion status
- Show creation date/time
- Visual distinction for completed items (strikethrough)
- Empty state message when no todos exist
- Todo count summary (X active, Y completed)

#### 2. Todo Management
- **Add Todo**: Input field with validation (min 3 chars)
- **Toggle Complete**: Button to mark todo as done/undone
- **Edit Todo**: Inline editing capability
- **Delete Todo**: Individual delete with confirmation
- **Clear Completed**: Bulk action to remove all completed todos

#### 3. Navigation
- Main list view
- Individual todo detail view
- Settings/info page

#### 4. Persistence Features
- Auto-save on every state change
- Restore state on bot restart
- Message ID persistence for seamless UI restoration
- Migration support for schema changes

### UI/UX Requirements

#### Layout Structure
```
📝 Todo List (3 active, 2 completed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Buy groceries
□ Review PR #123
□ Call dentist
☑ Submit report
☑ Fix bug #456

[➕ Add] [🗑️ Clear Completed]
[⚙️ Settings] [📊 Stats]
```

#### Interactive Elements
- Inline keyboards for all actions
- Confirmation dialogs for destructive actions
- Loading states during operations
- Error handling with user-friendly messages

## Implementation Plan

### Phase 1: Core Infrastructure
1. Set up MobX store with TypeScript
2. Implement custom storage adapter
3. Enhance MtcuteAdapter for message persistence
4. Create base Todo app component structure

### Phase 2: Todo Features
1. Implement CRUD operations
2. Add completion toggling
3. Build list and detail views
4. Add input handling for new todos

### Phase 3: Persistence Layer
1. Integrate mobx-persist-store
2. Implement file-based storage
3. Add message ID tracking
4. Handle restart scenarios

### Phase 4: Testing
1. Unit tests for MobX store
2. Integration tests for storage layer
3. Component tests with React Testing Library
4. End-to-end tests with mock adapter

### Phase 5: Polish
1. Add animations/transitions
2. Implement keyboard shortcuts
3. Add statistics page
4. Performance optimizations

## Testing Strategy

### Unit Tests
- MobX store actions and computeds
- Storage adapter methods
- Utility functions

### Integration Tests
- Store + Storage integration
- Message persistence scenarios
- Data migration tests

### Component Tests
- Todo list rendering
- User interactions
- State updates

### Mock Implementation
```typescript
class MockStorage implements IStorage {
  private data = new Map<string, string>();
  
  async get(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  }
  
  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }
  
  async clear(): Promise<void> {
    this.data.clear();
  }
}
```

## File Structure
```
packages/examples/
├── src/
│   ├── persist-todo-bot.tsx      # Main bot file
│   ├── components/
│   │   ├── TodoApp.tsx           # Root component
│   │   ├── TodoList.tsx          # List view
│   │   ├── TodoItem.tsx          # Item component
│   │   └── TodoInput.tsx         # Input component
│   ├── stores/
│   │   ├── TodoStore.ts          # MobX store
│   │   └── RootStore.ts          # Root store
│   ├── storage/
│   │   ├── IStorage.ts           # Storage interface
│   │   ├── FileStorage.ts        # JSON file storage
│   │   └── MemoryStorage.ts      # Mock for testing
│   └── utils/
│       └── persistence.ts         # Persistence helpers
├── tests/
│   ├── TodoStore.test.ts
│   ├── TodoApp.test.tsx
│   └── persistence.test.ts
└── storage/                       # Runtime storage (gitignored)
    └── todos.json
```

## Success Criteria
1. Todos persist across bot restarts
2. UI state (current view, message) is restored
3. 90%+ test coverage
4. Sub-second state restoration
5. Graceful handling of corrupted data
6. Clear documentation and examples

## Future Enhancements
- Multi-user support with separate storage
- Todo categories/tags
- Due dates and reminders
- Export/import functionality
- Backup to cloud storage
import { describe, it, expect, beforeEach } from 'vitest';
import { TodoStore } from '../src/stores/TodoStore';
import { MemoryStorage } from '../src/storage/MemoryStorage';

describe('TodoStore', () => {
  let store: TodoStore;
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    store = new TodoStore(storage);
  });

  describe('addTodo', () => {
    it('should add a new todo', () => {
      store.addTodo('Test todo');
      
      expect(store.todos).toHaveLength(1);
      expect(store.todos[0].text).toBe('Test todo');
      expect(store.todos[0].completed).toBe(false);
      expect(store.todos[0].createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for short text', () => {
      expect(() => store.addTodo('ab')).toThrow('Todo text must be at least 3 characters long');
    });

    it('should trim whitespace', () => {
      store.addTodo('  Test todo  ');
      expect(store.todos[0].text).toBe('Test todo');
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo completion status', () => {
      store.addTodo('Test todo');
      const todoId = store.todos[0].id;

      store.toggleTodo(todoId);
      expect(store.todos[0].completed).toBe(true);
      expect(store.todos[0].completedAt).toBeInstanceOf(Date);

      store.toggleTodo(todoId);
      expect(store.todos[0].completed).toBe(false);
      expect(store.todos[0].completedAt).toBeUndefined();
    });

    it('should handle non-existent todo', () => {
      expect(() => store.toggleTodo('non-existent')).not.toThrow();
    });
  });

  describe('editTodo', () => {
    it('should edit todo text', () => {
      store.addTodo('Original text');
      const todoId = store.todos[0].id;

      store.editTodo(todoId, 'Updated text');
      expect(store.todos[0].text).toBe('Updated text');
    });

    it('should throw error for short text', () => {
      store.addTodo('Test todo');
      const todoId = store.todos[0].id;

      expect(() => store.editTodo(todoId, 'ab')).toThrow('Todo text must be at least 3 characters long');
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', () => {
      store.addTodo('Todo 1');
      store.addTodo('Todo 2');
      const todoId = store.todos[0].id;

      store.deleteTodo(todoId);
      expect(store.todos).toHaveLength(1);
      expect(store.todos[0].text).toBe('Todo 2');
    });
  });

  describe('clearCompleted', () => {
    it('should remove only completed todos', () => {
      store.addTodo('Active todo');
      store.addTodo('Completed todo');
      store.toggleTodo(store.todos[1].id);

      store.clearCompleted();
      expect(store.todos).toHaveLength(1);
      expect(store.todos[0].text).toBe('Active todo');
    });
  });

  describe('clearAll', () => {
    it('should remove all todos', () => {
      store.addTodo('Todo 1');
      store.addTodo('Todo 2');

      store.clearAll();
      expect(store.todos).toHaveLength(0);
    });
  });

  describe('computed values', () => {
    it('should calculate active and completed todos', () => {
      store.addTodo('Active 1');
      store.addTodo('Active 2');
      store.addTodo('Completed 1');
      store.toggleTodo(store.todos[2].id);

      expect(store.activeTodos).toHaveLength(2);
      expect(store.completedTodos).toHaveLength(1);
      expect(store.todoCount).toEqual({
        active: 2,
        completed: 1,
        total: 3,
      });
    });
  });
});
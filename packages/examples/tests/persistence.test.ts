import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TodoStore } from '../src/stores/TodoStore';
import { MemoryStorage } from '../src/storage/MemoryStorage';
import { FileStorage } from '../src/storage/FileStorage';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Persistence', () => {
  describe('MemoryStorage', () => {
    let storage: MemoryStorage;

    beforeEach(() => {
      storage = new MemoryStorage();
    });

    it('should store and retrieve values', async () => {
      await storage.set('key1', 'value1');
      const value = await storage.get('key1');
      expect(value).toBe('value1');
    });

    it('should return null for non-existent keys', async () => {
      const value = await storage.get('non-existent');
      expect(value).toBeNull();
    });

    it('should delete values', async () => {
      await storage.set('key1', 'value1');
      await storage.delete('key1');
      const value = await storage.get('key1');
      expect(value).toBeNull();
    });

    it('should clear all values', async () => {
      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');
      await storage.clear();
      
      expect(await storage.get('key1')).toBeNull();
      expect(await storage.get('key2')).toBeNull();
    });
  });

  describe('TodoStore persistence', () => {
    let storage: MemoryStorage;
    let store: TodoStore;

    beforeEach(() => {
      storage = new MemoryStorage();
      store = new TodoStore(storage);
    });

    it('should persist todos to storage', async () => {
      store.addTodo('Test todo 1');
      store.addTodo('Test todo 2');
      
      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check storage directly
      const storedData = await storage.get('TodoStore');
      expect(storedData).toBeTruthy();
      
      const parsed = JSON.parse(storedData!);
      expect(parsed.todos).toHaveLength(2);
    });

    it('should restore todos from storage', async () => {
      // Create first store and add todos
      store.addTodo('Persisted todo');
      store.toggleTodo(store.todos[0].id);
      
      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create new store with same storage
      const newStore = new TodoStore(storage);
      
      // Wait for hydration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(newStore.todos).toHaveLength(1);
      expect(newStore.todos[0].text).toBe('Persisted todo');
      expect(newStore.todos[0].completed).toBe(true);
    });
  });

  describe('FileStorage', () => {
    const testFilePath = path.join(process.cwd(), 'storage', 'test-storage.json');
    let storage: FileStorage;

    beforeEach(() => {
      storage = new FileStorage('test-storage.json');
    });

    afterEach(async () => {
      // Clean up test file
      try {
        await fs.unlink(testFilePath);
      } catch {
        // Ignore if file doesn't exist
      }
    });

    it('should create storage directory if it does not exist', async () => {
      await storage.set('test', 'value');
      
      const stats = await fs.stat(path.dirname(testFilePath));
      expect(stats.isDirectory()).toBe(true);
    });

    it('should persist data to disk', async () => {
      await storage.set('diskKey', 'diskValue');
      
      const fileContent = await fs.readFile(testFilePath, 'utf-8');
      const parsed = JSON.parse(fileContent);
      expect(parsed.diskKey).toBe('diskValue');
    });

    it('should handle missing files gracefully', async () => {
      const value = await storage.get('nonExistent');
      expect(value).toBeNull();
    });
  });
});
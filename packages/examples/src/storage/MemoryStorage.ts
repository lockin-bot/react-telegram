import { IStorage } from './IStorage';

export class MemoryStorage implements IStorage {
  private data = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }

  // Helper method for testing
  getAll(): Record<string, string> {
    return Object.fromEntries(this.data);
  }
}
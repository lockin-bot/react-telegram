import { IStorage } from './IStorage';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileStorage implements IStorage {
  private filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), 'storage', fileName);
  }

  private async ensureDirectory(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      await this.ensureDirectory();
      const data = await fs.readFile(this.filePath, 'utf-8');
      const json = JSON.parse(data);
      return json[key] || null;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async set(key: string, value: string): Promise<void> {
    await this.ensureDirectory();
    let data: Record<string, string> = {};
    
    try {
      const existing = await fs.readFile(this.filePath, 'utf-8');
      data = JSON.parse(existing);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }

    data[key] = value;
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async delete(key: string): Promise<void> {
    await this.ensureDirectory();
    let data: Record<string, string> = {};
    
    try {
      const existing = await fs.readFile(this.filePath, 'utf-8');
      data = JSON.parse(existing);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return;
      }
      throw error;
    }

    delete data[key];
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async clear(): Promise<void> {
    await this.ensureDirectory();
    await fs.writeFile(this.filePath, '{}');
  }
}
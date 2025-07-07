import { IStorage } from './IStorage';

export class MessageIdStorage {
  constructor(private storage: IStorage) {}

  async getMessageId(containerId: string): Promise<number | null> {
    const value = await this.storage.get(`message_${containerId}`);
    return value ? parseInt(value, 10) : null;
  }

  async setMessageId(containerId: string, messageId: number): Promise<void> {
    await this.storage.set(`message_${containerId}`, messageId.toString());
  }

  async deleteMessageId(containerId: string): Promise<void> {
    await this.storage.delete(`message_${containerId}`);
  }
}
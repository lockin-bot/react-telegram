import { describe, it, expect } from 'bun:test';
import { MtcuteAdapter } from './mtcute-adapter';

describe('MtcuteAdapter', () => {
  it('should create an adapter instance', () => {
    const adapter = new MtcuteAdapter({
      apiId: 123,
      apiHash: 'test-hash',
      botToken: 'test-token',
    });
    
    expect(adapter).toBeDefined();
    expect(adapter.getClient).toBeDefined();
    expect(adapter.getDispatcher).toBeDefined();
    expect(adapter.onCommand).toBeDefined();
  });

  it('should register command handlers', () => {
    const adapter = new MtcuteAdapter({
      apiId: 123,
      apiHash: 'test-hash',
      botToken: 'test-token',
    });
    
    const handler = () => null;
    adapter.onCommand('test', handler);
    
    // Handler should be registered (internal state test would require exposing commandHandlers)
    expect(() => adapter.onCommand('test', handler)).not.toThrow();
  });
});
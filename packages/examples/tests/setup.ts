// Test setup file
import { vi } from 'vitest';

// Mock uuid to return predictable values in tests
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-' + Date.now()),
}));

// Mock @react-telegram/core
vi.mock('@react-telegram/core', () => ({}));
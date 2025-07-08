import type { ReactElement } from 'react';

export interface SPAState {
  messageId: number | null;
  lastContent: string | null;
  lastKeyboard: any | null;
  appState: Record<string, any>;
}

export interface SPAStorageAdapter {
  getState(chatId: string): Promise<SPAState | null>;
  setState(chatId: string, state: SPAState): Promise<void>;
  deleteState(chatId: string): Promise<void>;
}

export interface MtcuteSPAAdapterConfig {
  apiId: number;
  apiHash: string;
  storage?: string;
}

export interface MtcuteSPAAdapterOptions {
  storageAdapter?: SPAStorageAdapter;
}

export interface TgStateContextValue {
  chatId: number;
  getState: <T = any>(key: string) => T | undefined;
  setState: <T = any>(key: string, value: T | ((prev: T | undefined) => T)) => void;
}
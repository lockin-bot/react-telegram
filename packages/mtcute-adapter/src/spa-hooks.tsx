import React, { createContext, useContext, useCallback, useSyncExternalStore } from 'react';
import { produce, Draft } from 'immer';

// Base interface that users can extend
export interface TgGlobalState {
  [key: string]: any;
}

// Store implementation
class TgStore<T extends TgGlobalState = TgGlobalState> {
  private state: T;
  private listeners: Set<() => void> = new Set();
  private chatId: number;

  constructor(chatId: number, initialState: T = {} as T) {
    this.chatId = chatId;
    this.state = initialState;
  }

  getState = (): T => {
    return this.state;
  };

  setState = (updater: (draft: Draft<T>) => void) => {
    this.state = produce(this.state, updater);
    this.listeners.forEach(listener => listener());
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getChatId = () => {
    return this.chatId;
  };
}

// Global store registry
const stores = new Map<number, TgStore<any>>();

// Get or create store for a specific chat
function getStore<T extends TgGlobalState>(chatId: number, initialState?: T): TgStore<T> {
  if (!stores.has(chatId)) {
    stores.set(chatId, new TgStore(chatId, initialState));
  }
  return stores.get(chatId)!;
}

// Context for current chat
interface TgChatContextValue {
  chatId: number;
}

const TgChatContext = createContext<TgChatContextValue | null>(null);

// Provider component
interface TgProviderProps {
  chatId: number;
  children: React.ReactNode;
  initialState?: TgGlobalState;
}

export function TgProvider<T extends TgGlobalState = TgGlobalState>({ 
  chatId, 
  children, 
  initialState 
}: TgProviderProps & { initialState?: T }) {
  // Initialize store for this chat if needed
  React.useEffect(() => {
    getStore<T>(chatId, initialState);
  }, [chatId, initialState]);

  return (
    <TgChatContext.Provider value={{ chatId }}>
      {children}
    </TgChatContext.Provider>
  );
}

// Hook to get current store
function useCurrentStore<T extends TgGlobalState>(): TgStore<T> {
  const context = useContext(TgChatContext);
  if (!context) {
    throw new Error('Tg hooks must be used within TgProvider');
  }
  return getStore<T>(context.chatId);
}

// Hook to use a selector from the state
export function useTgSelector<T extends TgGlobalState, R>(
  selector: (state: T) => R
): R {
  const store = useCurrentStore<T>();
  
  const selectValue = useCallback(() => {
    return selector(store.getState());
  }, [selector, store]);

  return useSyncExternalStore(
    store.subscribe,
    selectValue,
    selectValue
  );
}

// Hook to get the state updater
export function useTgUpdater<T extends TgGlobalState>(): (updater: (draft: Draft<T>) => void) => void {
  const store = useCurrentStore<T>();
  return store.setState;
}

// Combined hook for both reading and updating
export function useTgState<T extends TgGlobalState, R>(
  selector: (state: T) => R
): [R, (updater: (draft: Draft<T>) => void) => void] {
  const value = useTgSelector(selector);
  const updater = useTgUpdater<T>();
  return [value, updater];
}

// Hook to get the entire state (use sparingly)
export function useTgStore<T extends TgGlobalState>(): [T, (updater: (draft: Draft<T>) => void) => void] {
  const store = useCurrentStore<T>();
  
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState
  );

  return [state, store.setState];
}

// Hook to get the current chat ID
export function useTgChatId(): number {
  const context = useContext(TgChatContext);
  if (!context) {
    throw new Error('useTgChatId must be used within TgProvider');
  }
  return context.chatId;
}

// Utility to clear a store (useful for cleanup)
export function clearTgStore(chatId: number) {
  stores.delete(chatId);
}

// Utility to clear all stores
export function clearAllTgStores() {
  stores.clear();
}
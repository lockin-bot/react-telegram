import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { v4 as uuidv4 } from 'uuid';
import { IStorage } from '../storage/IStorage';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export class TodoStore {
  todos: TodoItem[] = [];
  
  constructor(private storage: IStorage) {
    makeAutoObservable(this);
    
    makePersistable(this, {
      name: 'TodoStore',
      properties: ['todos'],
      storage: {
        getItem: async (key) => await storage.get(key),
        setItem: async (key, value) => await storage.set(key, value),
        removeItem: async (key) => await storage.delete(key),
      },
      stringify: true,
      debugMode: false,
    });
  }

  get activeTodos() {
    return this.todos.filter(todo => !todo.completed);
  }

  get completedTodos() {
    return this.todos.filter(todo => todo.completed);
  }

  get todoCount() {
    return {
      active: this.activeTodos.length,
      completed: this.completedTodos.length,
      total: this.todos.length,
    };
  }

  addTodo(text: string) {
    if (!text || text.trim().length < 3) {
      throw new Error('Todo text must be at least 3 characters long');
    }

    const todo: TodoItem = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
    };

    this.todos.push(todo);
  }

  toggleTodo(id: string) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.completedAt = todo.completed ? new Date() : undefined;
    }
  }

  editTodo(id: string, newText: string) {
    if (!newText || newText.trim().length < 3) {
      throw new Error('Todo text must be at least 3 characters long');
    }

    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = newText.trim();
    }
  }

  deleteTodo(id: string) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
    }
  }

  clearCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed);
  }

  clearAll() {
    this.todos = [];
  }
}
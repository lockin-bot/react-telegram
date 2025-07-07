import { TodoStore } from './TodoStore';
import { IStorage } from '../storage/IStorage';

export class RootStore {
  todoStore: TodoStore;

  constructor(storage: IStorage) {
    this.todoStore = new TodoStore(storage);
  }
}
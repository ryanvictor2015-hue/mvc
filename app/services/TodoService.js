
import { Todo } from '../../domain/entities/index.js';

export class TodoService {
    
    constructor(repository) {
        if (!repository) {
            throw new Error('TodoService: repository é obrigatório');
        }
        
        this._repository = repository;
    }

    createTodo(text) {
        
        const todo = new Todo({ text });

        const saved = this._repository.save(todo.toJSON());

        return Todo.fromJSON(saved);
    }

    getAllTodos() {
        return this._repository.getAll();
    }

    _getAllTodosAsEntities() {
        const todos = this._repository.getAll();
        return todos.map(todo => Todo.fromJSON(todo));
    }

    getTodoByIdAsEntity(id) {
        const todo = this._repository.getById(id);
        return todo ? Todo.fromJSON(todo) : null;
    }

    removeTodo(id) {
        return this._repository.delete(id);
    }

    toggleTodo(id) {
        const todo = this.getTodoByIdAsEntity(id);
        if (!todo) {
            return null;
        }

        const toggled = todo.toggle();
        return this._repository.save(toggled.toJSON());
    }

    editTodo(id, newText) {
        const todo = this.getTodoByIdAsEntity(id);
        if (!todo) {
            return null;
        }

        const trimmedText = newText?.trim() || '';
        if (!trimmedText) {
            this._repository.delete(id);
            return null;
        }

        const edited = todo.editText(trimmedText);
        return this._repository.save(edited.toJSON());
    }

    toggleAll(completed) {
        const todos = this._getAllTodosAsEntities();
        const updated = todos.map(todo => 
            completed ? todo.complete() : todo.uncomplete()
        );

        updated.forEach(todo => this._repository.save(todo.toJSON()));
        
        return updated.map(todo => todo.toJSON());
    }

    clearCompleted() {
        const todos = this._repository.getAll();
        const completed = todos.filter(t => t.completed);
        
        completed.forEach(todo => this._repository.delete(todo.id));
        
        return completed.length;
    }

    getStats() {
        const todos = this._repository.getAll();
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const active = total - completed;
        
        return { total, completed, active };
    }


}


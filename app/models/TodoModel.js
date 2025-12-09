
import BaseModel from '../../core/BaseModel.js';
import { TodoFilter } from '../../core/enums/index.js';

export default class TodoModel extends BaseModel {
    
    constructor({ service, eventBus = null, initialState = {} }) {
        if (!service) {
            throw new Error('TodoModel: service é obrigatório');
        }
        
        const defaultState = {
            todos: [],
            filter: TodoFilter.ALL,
            editingId: null
        };

        super({ ...defaultState, ...initialState }, 'todo', eventBus);
        
        this._service = service;

        this._loadFromService();
    }

    _loadFromService() {
        const todos = this._service.getAllTodos();
        this._setStateWithDerived({ todos });
    }

    addTodo(text) {
        try {
            const todo = this._service.createTodo(text);
            
            const { todos } = this.getState();
            this._setStateWithDerived({ todos: [...todos, todo.toJSON()] });
            return todo.toJSON();
        } catch (error) {
            console.error('[TodoModel] Erro ao adicionar tarefa:', error);
            return null;
        }
    }

    removeTodo(id) {
        const removed = this._service.removeTodo(id);
        if (removed) {
            
            const { todos } = this.getState();
            this._setStateWithDerived({ todos: todos.filter(t => t.id !== id) });
        }
    }

    toggleTodo(id) {
        const updated = this._service.toggleTodo(id);
        if (updated) {
            
            const { todos } = this.getState();
            this._setStateWithDerived({
                todos: todos.map(t => t.id === id ? updated : t)
            });
        }
    }

    editTodo(id, newText) {
        try {
            const updated = this._service.editTodo(id, newText);
            if (updated) {
                
                const { todos } = this.getState();
                this._setStateWithDerived({
                    todos: todos.map(t => t.id === id ? updated : t),
                    editingId: null
                });
            } else {
                
                this.removeTodo(id);
                this.setState({ editingId: null });
            }
        } catch (error) {
            console.error('[TodoModel] Erro ao editar tarefa:', error);
        }
    }

    setEditing(id) {
        this.setState({ editingId: id });
    }

    setFilter(filter) {
        if (TodoFilter.isValid(filter)) {
            this._setStateWithDerived({ filter });
        }
    }

    toggleAll(completed) {
        const updated = this._service.toggleAll(completed);
        
        this._setStateWithDerived({ todos: updated });
    }

    clearCompleted() {
        const removedCount = this._service.clearCompleted();
        if (removedCount > 0) {
            
            const { todos } = this.getState();
            this._setStateWithDerived({ todos: todos.filter(t => !t.completed) });
        }
    }

    getFilteredTodos() {
        const { todos, filter } = this.getState();
        
        switch (filter) {
            case TodoFilter.ACTIVE:
                return todos.filter(todo => !todo.completed);
            case TodoFilter.COMPLETED:
                return todos.filter(todo => todo.completed);
            case TodoFilter.ALL:
            default:
                return todos;
        }
    }

    _getFilteredTodosFrom(todos, filter) {
        switch (filter) {
            case TodoFilter.ACTIVE:
                return todos.filter(todo => !todo.completed);
            case TodoFilter.COMPLETED:
                return todos.filter(todo => todo.completed);
            case TodoFilter.ALL:
            default:
                return todos;
        }
    }

    _setStateWithDerived(partialState) {
        const merged = { ...this.getState(), ...partialState };
        const filteredTodos = this._getFilteredTodosFrom(merged.todos, merged.filter);
        const stats = this._calculateStats(merged.todos);
        this.setState({ ...merged, filteredTodos, stats });
    }

    _calculateStats(todosFromState = null) {
        const todos = todosFromState || this.getState().todos;
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const active = total - completed;
        return { total, completed, active };
    }

}


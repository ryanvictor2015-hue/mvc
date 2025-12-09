
import BaseController from '../../core/BaseController.js';

export default class TodoController extends BaseController {
    
    constructor(options) {
        super(options);
    }

    _setupViewCallbacks() {
        
        this._view.onAddTodo = (text) => {
            this._model.addTodo(text);
        };

        this._view.onRemoveTodo = (id) => {
            this._model.removeTodo(id);
        };

        this._view.onToggleTodo = (id) => {
            this._model.toggleTodo(id);
        };

        this._view.onEditTodo = (id, newText) => {
            this._model.editTodo(id, newText);
        };

        this._view.onSetEditing = (id) => {
            this._model.setEditing(id);
        };

        this._view.onFilterChange = (filter) => {
            this._model.setFilter(filter);
        };

        this._view.onToggleAll = (completed) => {
            this._model.toggleAll(completed);
        };

        this._view.onClearCompleted = () => {
            this._model.clearCompleted();
        };
    }
}


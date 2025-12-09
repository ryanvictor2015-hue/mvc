
import BaseView from '../../core/BaseView.js';
import { TodoFilter } from '../../core/enums/index.js';
import { escapeHtml } from '../../core/utils/index.js';

export default class TodoView extends BaseView {
    constructor(rootElement) {
        super(rootElement);

        this.onAddTodo = null;
        this.onRemoveTodo = null;
        this.onToggleTodo = null;
        this.onEditTodo = null;
        this.onSetEditing = null;
        this.onFilterChange = null;
        this.onToggleAll = null;
        this.onClearCompleted = null;
    }

    render(state) {
        const { todos, filter, editingId, filteredTodos, stats } = state;
        
        const displayTodos = filteredTodos || todos;
        
        this._root.innerHTML = `
            <div class="todo-container">
                <header class="todo-header">
                    <h1>Lista de Tarefas</h1>
                    <p class="todo-subtitle">Exemplo de MVC com CRUD completo</p>
                </header>
                
                <div class="todo-input-wrapper">
                    <input 
                        type="checkbox" 
                        id="toggle-all" 
                        class="toggle-all"
                        ${stats.total > 0 && stats.active === 0 ? 'checked' : ''}
                        ${stats.total === 0 ? 'disabled' : ''}
                        aria-label="Marcar todas como completas"
                    />
                    <input 
                        type="text" 
                        id="todo-input" 
                        class="todo-input"
                        placeholder="O que precisa ser feito?"
                        autofocus
                    />
                </div>
                
                <ul class="todo-list" id="todo-list">
                    ${displayTodos.map(todo => this._renderTodoItem(todo, editingId)).join('')}
                </ul>
                
                ${stats && stats.total > 0 ? this._renderFooter(stats, filter) : ''}
            </div>
        `;
    }

    _renderTodoItem(todo, editingId) {
        const isEditing = todo.id === editingId;
        
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}" 
                data-id="${todo.id}">
                ${isEditing ? `
                    <input 
                        type="text" 
                        class="edit-input" 
                        value="${escapeHtml(todo.text)}"
                        data-id="${todo.id}"
                    />
                ` : `
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        data-id="${todo.id}"
                        aria-label="Marcar como ${todo.completed ? 'incompleta' : 'completa'}"
                    />
                    <span class="todo-text" data-id="${todo.id}">${escapeHtml(todo.text)}</span>
                    <button 
                        class="btn-delete" 
                        data-id="${todo.id}"
                        aria-label="Remover tarefa"
                    >
                        ×
                    </button>
                `}
            </li>
        `;
    }

    _renderFooter(stats, currentFilter) {
        const filters = [
            { key: TodoFilter.ALL, label: 'Todas' },
            { key: TodoFilter.ACTIVE, label: 'Ativas' },
            { key: TodoFilter.COMPLETED, label: 'Completas' }
        ];

        return `
            <footer class="todo-footer">
                <span class="todo-count">
                    <strong>${stats.active}</strong> ${stats.active === 1 ? 'tarefa restante' : 'tarefas restantes'}
                </span>
                
                <div class="todo-filters">
                    ${filters.map(f => `
                        <button 
                            class="filter-btn ${currentFilter === f.key ? 'active' : ''}"
                            data-filter="${f.key}"
                        >
                            ${f.label}
                        </button>
                    `).join('')}
                </div>
                
                ${stats.completed > 0 ? `
                    <button class="btn-clear-completed" id="clear-completed">
                        Limpar completas (${stats.completed})
                    </button>
                ` : '<span></span>'}
            </footer>
        `;
    }

    bindEvents() {
        
        this.addEventHandler('#todo-input', 'keypress', (e) => {
            if (e.key === 'Enter') {
                const text = e.target.value.trim();
                if (text && this.onAddTodo) {
                    this.onAddTodo(text);
                    e.target.value = '';
                }
            }
        });

        this.addEventHandler('#toggle-all', 'change', (e) => {
            if (this.onToggleAll) {
                this.onToggleAll(e.target.checked);
            }
        });

        const todoList = this._root.querySelector('#todo-list');
        if (todoList) {
            
            this.addEventHandler(todoList, 'click', (e) => {
                const id = e.target.dataset.id;
                
                if (e.target.classList.contains('todo-checkbox')) {
                    if (this.onToggleTodo) this.onToggleTodo(id);
                } else if (e.target.classList.contains('btn-delete')) {
                    if (this.onRemoveTodo) this.onRemoveTodo(id);
                }
            });

            this.addEventHandler(todoList, 'dblclick', (e) => {
                if (e.target.classList.contains('todo-text')) {
                    const id = e.target.dataset.id;
                    if (this.onSetEditing) this.onSetEditing(id);
                }
            });

            this.addEventHandler(todoList, 'keypress', (e) => {
                if (e.target.classList.contains('edit-input') && e.key === 'Enter') {
                    const id = e.target.dataset.id;
                    const newText = e.target.value;
                    if (this.onEditTodo) this.onEditTodo(id, newText);
                }
            });

            this.addEventHandler(todoList, 'keydown', (e) => {
                if (e.target.classList.contains('edit-input') && e.key === 'Escape') {
                    if (this.onSetEditing) this.onSetEditing(null);
                }
            });

            this.addEventHandler(todoList, 'blur', (e) => {
                if (e.target.classList.contains('edit-input')) {
                    const id = e.target.dataset.id;
                    const newText = e.target.value;
                    if (this.onEditTodo) this.onEditTodo(id, newText);
                }
            }, true); 
        }

        this._root.querySelectorAll('.filter-btn').forEach(btn => {
            this.addEventHandler(btn, 'click', (e) => {
                const filter = e.target.dataset.filter;
                if (this.onFilterChange) this.onFilterChange(filter);
            });
        });

        const clearBtn = this._root.querySelector('#clear-completed');
        if (clearBtn) {
            this.addEventHandler(clearBtn, 'click', () => {
                if (this.onClearCompleted) this.onClearCompleted();
            });
        }

        const editInput = this._root.querySelector('.edit-input');
        if (editInput) {
            editInput.focus();
            editInput.setSelectionRange(editInput.value.length, editInput.value.length);
        }
    }
}


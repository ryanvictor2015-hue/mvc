
import { TodoErrorMessages, TodoLimits } from '../../core/enums/index.js';
import { generateId } from '../../core/utils/index.js';

export class TodoError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TodoError';
    }
}

export class Todo {
    
    constructor({ id, text, completed = false, createdAt = null } = {}) {
        
        this._text = this._validateText(text);

        this._id = id || generateId('todo');
        
        this._completed = Boolean(completed);
        this._createdAt = createdAt || new Date().toISOString();

        Object.freeze(this);
    }

    get id() {
        return this._id;
    }

    get text() {
        return this._text;
    }

    get completed() {
        return this._completed;
    }

    get createdAt() {
        return this._createdAt;
    }

    complete() {
        if (this._completed) {
            return this; 
        }
        
        return new Todo({
            id: this._id,
            text: this._text,
            completed: true,
            createdAt: this._createdAt
        });
    }

    uncomplete() {
        if (!this._completed) {
            return this; 
        }
        
        return new Todo({
            id: this._id,
            text: this._text,
            completed: false,
            createdAt: this._createdAt
        });
    }

    toggle() {
        return this._completed ? this.uncomplete() : this.complete();
    }

    editText(newText) {
        const validatedText = this._validateText(newText);
        
        return new Todo({
            id: this._id,
            text: validatedText,
            completed: this._completed,
            createdAt: this._createdAt
        });
    }

    _validateText(text) {
        if (typeof text !== 'string') {
            throw new TodoError(TodoErrorMessages.TEXT_EMPTY);
        }
        
        const trimmedText = text.trim();
        
        if (trimmedText.length < TodoLimits.TEXT_MIN_LENGTH) {
            throw new TodoError(TodoErrorMessages.TEXT_EMPTY);
        }
        
        if (trimmedText.length > TodoLimits.TEXT_MAX_LENGTH) {
            throw new TodoError(TodoErrorMessages.TEXT_TOO_LONG);
        }
        
        return trimmedText;
    }

    toJSON() {
        return {
            id: this._id,
            text: this._text,
            completed: this._completed,
            createdAt: this._createdAt
        };
    }

    static fromJSON(json) {
        return new Todo({
            id: json.id,
            text: json.text,
            completed: json.completed,
            createdAt: json.createdAt
        });
    }
}


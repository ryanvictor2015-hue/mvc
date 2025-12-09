
import { Events } from './enums/index.js';

export class ErrorHandler {
    
    constructor(eventBus) {
        if (!eventBus) {
            throw new Error('ErrorHandler: eventBus é obrigatório');
        }
        
        this._eventBus = eventBus;
        this._handlers = [];
        this._isInitialized = false;
        this._onErrorListener = null;
        this._onUnhandledRejectionListener = null;
        this._handlerUnsubscribers = [];
    }

    init() {
        if (this._isInitialized) {
            return;
        }

        this._setupGlobalHandlers();
        this._isInitialized = true;
    }

    _setupGlobalHandlers() {
        this._onErrorListener = (event) => {
            const normalizedError = event.error instanceof Error
                ? event.error
                : new Error(event.message || 'Erro desconhecido');

            const errorInfo = {
                message: event.message || normalizedError.message,
                source: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: normalizedError.stack,
                type: 'synchronous',
                timestamp: new Date().toISOString()
            };

            this.handle(normalizedError, errorInfo);
        };

        this._onUnhandledRejectionListener = (event) => {
            const error = event.reason instanceof Error 
                ? event.reason 
                : new Error(String(event.reason));

            const errorInfo = {
                message: error.message,
                stack: error.stack,
                type: 'unhandledrejection',
                reason: event.reason,
                timestamp: new Date().toISOString()
            };

            this.handle(error, errorInfo);
        };

        window.addEventListener('error', this._onErrorListener);
        window.addEventListener('unhandledrejection', this._onUnhandledRejectionListener);
    }

    register(handler) {
        if (typeof handler !== 'function') {
            throw new Error('ErrorHandler.register(): handler deve ser uma função');
        }
        this._handlers.push(handler);

        const unsubscribe = () => this.unregister(handler);
        this._handlerUnsubscribers.push(unsubscribe);
        return unsubscribe;
    }

    unregister(handler) {
        const index = this._handlers.indexOf(handler);
        if (index !== -1) {
            this._handlers.splice(index, 1);
        }
    }

    handle(error, context = {}) {
        
        const normalizedError = error instanceof Error 
            ? error 
            : new Error(String(error));

        const errorInfo = {
            message: normalizedError.message,
            stack: normalizedError.stack,
            name: normalizedError.name,
            timestamp: new Date().toISOString(),
            ...context
        };

        this._logError(errorInfo);

        this._notifyHandlers(errorInfo);

        this._emitEvent(errorInfo);
    }

    _logError(errorInfo) {
        const logMessage = `[ErrorHandler] ${errorInfo.message}`;
        
        if (errorInfo.stack) {
            console.error(logMessage, {
                ...errorInfo,
                stack: errorInfo.stack.split('\n')
            });
        } else {
            console.error(logMessage, errorInfo);
        }
    }

    _notifyHandlers(errorInfo) {
        this._handlers.forEach(handler => {
            try {
                handler(errorInfo);
            } catch (handlerError) {
                
                console.error('[ErrorHandler] Erro ao executar handler:', handlerError);
            }
        });
    }

    _emitEvent(errorInfo) {
        try {
            this._eventBus.emit(Events.APP_ERROR, errorInfo);
        } catch (e) {
            console.warn('[ErrorHandler] Falha ao emitir APP_ERROR', e);
        }
    }

    destroy() {
        if (!this._isInitialized) {
            return;
        }

        if (this._onErrorListener) {
            window.removeEventListener('error', this._onErrorListener);
            this._onErrorListener = null;
        }

        if (this._onUnhandledRejectionListener) {
            window.removeEventListener('unhandledrejection', this._onUnhandledRejectionListener);
            this._onUnhandledRejectionListener = null;
        }

        this._handlerUnsubscribers.forEach(fn => {
            try { fn(); } catch (e) { console.warn('[ErrorHandler] Falha ao desregistrar handler', e); }
        });

        this._handlers = [];
        this._handlerUnsubscribers = [];
        this._isInitialized = false;
    }

}


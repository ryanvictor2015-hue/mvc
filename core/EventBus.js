
let _instance = null;

export class EventBus {
    constructor() {
        if (_instance) {
            throw new Error('EventBus já instanciado. Use EventBus.getInstance()');
        }

        this._listeners = new Map();
        _instance = this;
    }

    static getInstance() {
        return _instance || new EventBus();
    }

    static resetInstance() {
        // útil para testes
        if (_instance) {
            _instance.clearAll();
        }
        _instance = null;
    }

    on(eventName, callback) {
        if (!this._listeners.has(eventName)) {
            this._listeners.set(eventName, []);
        }
        
        this._listeners.get(eventName).push(callback);

        return () => this.off(eventName, callback);
    }

    off(eventName, callback) {
        const listeners = this._listeners.get(eventName);
        if (!listeners) return;

        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    emit(eventName, data) {
        const listeners = this._listeners.get(eventName);
        if (!listeners) return;

        [...listeners].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`EventBus: Erro ao executar listener para "${eventName}"`, error);
            }
        });
    }

    clearAll() {
        this._listeners.clear();
    }

    destroy() {
        this.clearAll();
        _instance = null;
    }

}


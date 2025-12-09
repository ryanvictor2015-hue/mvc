

export default class BaseModel {
    
    constructor(initialState = {}, modelName = 'model', eventBus = null) {
        this._state = { ...initialState };
        this._modelName = modelName;
        this._observers = [];
        this._eventBus = eventBus; 
    }

    getState() {
        return { ...this._state };
    }

    setState(partialState) {
        const previousState = { ...this._state };
        this._state = { ...this._state, ...partialState };
        
        this._notifyObservers(this._state, previousState);
        this._emitChange(this._state, previousState);
    }

    resetState(newState) {
        const previousState = { ...this._state };
        this._state = { ...newState };
        
        this._notifyObservers(this._state, previousState);
        this._emitChange(this._state, previousState);
    }

    subscribe(observer) {
        this._observers.push(observer);

        return () => {
            const index = this._observers.indexOf(observer);
            if (index !== -1) {
                this._observers.splice(index, 1);
            }
        };
    }

    _notifyObservers(newState, previousState) {
        this._observers.forEach(observer => {
            try {
                observer(newState, previousState);
            } catch (error) {
                console.error(`${this._modelName}: Erro ao notificar observador`, error);
            }
        });
    }

    _emitChange(newState, previousState) {
        if (this._eventBus) {
            this._eventBus.emit(`${this._modelName}:change`, {
                newState,
                previousState,
                modelName: this._modelName
            });
        }
    }

    clearObservers() {
        this._observers = [];
    }

}


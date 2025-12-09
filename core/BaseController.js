
export default class BaseController {
    
    constructor({ model, view, eventBus = null }) {
        this._model = model;
        this._view = view;
        this._eventBus = eventBus;
        this._unsubscribers = [];
        this._isInitialized = false;
    }

    get model() {
        return this._model;
    }

    get view() {
        return this._view;
    }

    init() {
        if (this._isInitialized) {
            return;
        }

        this._subscribeToModel();
        this._setupViewCallbacks();
        this._initialRender();
        this._isInitialized = true;
        
        this.onInit();
    }

    onInit() {
        
    }

    _subscribeToModel() {
        if (this._model) {
            const unsubscribe = this._model.subscribe((newState, previousState) => {
                this._onModelChange(newState, previousState);
            });
            this._unsubscribers.push(unsubscribe);
        }
    }

    _onModelChange(newState, previousState) {
        this._view.update(newState);
        this.onModelChange(newState, previousState);
    }

    onModelChange(newState, previousState) {
        
    }

    _setupViewCallbacks() {
        
    }

    _initialRender() {
        if (this._model && this._view) {
            this._view.update(this._model.getState());
        }
    }

    subscribeToEvent(eventName, handler) {
        if (!this._eventBus) {
            return;
        }
        const boundHandler = handler.bind(this);
        const unsubscribe = this._eventBus.on(eventName, boundHandler);
        this._unsubscribers.push(unsubscribe);
    }

    emitEvent(eventName, data) {
        if (!this._eventBus) {
            return;
        }
        this._eventBus.emit(eventName, data);
    }

    destroy() {
        this.onDestroy();

        this._unsubscribers.forEach(unsubscribe => unsubscribe());
        this._unsubscribers = [];

        if (this._view) {
            this._view.destroy();
        }

        if (this._model) {
            this._model.clearObservers();
        }
        
        this._isInitialized = false;
    }

    onDestroy() {
        
    }

}


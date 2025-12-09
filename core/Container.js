export class Container {
    constructor() {
        this._services = new Map();
        this._factories = new Map();
        this._singletons = new Map();
    }

    registerInstance(name, instance) {
        this._services.set(name, instance);
    }

    registerSingleton(name, factory) {
        this._factories.set(name, factory);
        this._singletons.set(name, true);
    }

    registerFactory(name, factory) {
        this._factories.set(name, factory);
        this._singletons.set(name, false);
    }

    resolve(name, ...args) {
        
        if (this._singletons.get(name) !== false && this._services.has(name)) {
            return this._services.get(name);
        }

        const factory = this._factories.get(name);
        if (!factory) {
            throw new Error(`Container: Serviço "${name}" não registrado`);
        }

        const instance = factory(this, ...args);

        if (this._singletons.get(name) !== false) {
            this._services.set(name, instance);
        }

        return instance;
    }

}


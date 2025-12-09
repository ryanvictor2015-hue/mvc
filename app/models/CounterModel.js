
import BaseModel from '../../core/BaseModel.js';
import { Events } from '../../core/enums/index.js';
import { Counter } from '../../domain/entities/index.js';

export default class CounterModel extends BaseModel {
    
    constructor({ eventBus = null, initialState = {} } = {}) {
        
        const counter = new Counter(initialState);

        const modelState = counter.toJSON();
        modelState.isAtMin = counter.isAtMin();
        modelState.isAtMax = counter.isAtMax();

        super(modelState, 'counter', eventBus);
        
        this._eventBus = eventBus;
        this._counter = counter;
    }

    increment() {
        this._counter = this._counter.increment();
        this._syncState();
    }

    decrement() {
        this._counter = this._counter.decrement();
        this._syncState();
    }

    reset(value = 0) {
        try {
            this._counter = this._counter.reset(value);
            this._syncState();
        } catch (error) {
            console.error('[CounterModel] Erro ao resetar:', error);
        }
    }

    setStep(step) {
        try {
            this._counter = this._counter.withStep(step);
            this._syncState();
        } catch (error) {
            console.error('[CounterModel] Erro ao definir step:', error.message);
            
            this._eventBus.emit(Events.COUNTER_STEP_ERROR, { 
                step, 
                error: error.message 
            });
        }
    }

    _syncState() {
        const state = this._counter.toJSON();
        
        state.isAtMin = this._counter.isAtMin();
        state.isAtMax = this._counter.isAtMax();
        
        this.setState(state);
    }

    get value() {
        return this._counter.value;
    }

    get counter() {
        return this._counter;
    }

}


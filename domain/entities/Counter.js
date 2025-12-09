
import { CounterErrorMessages, CounterLimits } from '../../core/enums/index.js';

export class CounterError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CounterError';
    }
}

export class Counter {
    
    constructor({ 
        value = 0, 
        step = 1, 
        min = CounterLimits.VALUE_MIN, 
        max = CounterLimits.VALUE_MAX 
    } = {}) {
        
        this._step = this._validateStep(step);
        this._min = min;
        this._max = max;
        this._value = this._clamp(value);

        Object.freeze(this);
    }

    get value() { 
        return this._value; 
    }

    get step() { 
        return this._step; 
    }

    get min() { 
        return this._min; 
    }

    get max() { 
        return this._max; 
    }

    increment() {
        const newValue = this._clamp(this._value + this._step);
        return new Counter({
            value: newValue,
            step: this._step,
            min: this._min,
            max: this._max
        });
    }

    decrement() {
        const newValue = this._clamp(this._value - this._step);
        return new Counter({
            value: newValue,
            step: this._step,
            min: this._min,
            max: this._max
        });
    }

    reset(newValue = 0) {
        return new Counter({
            value: newValue,
            step: this._step,
            min: this._min,
            max: this._max
        });
    }

    withStep(newStep) {
        return new Counter({
            value: this._value,
            step: newStep,
            min: this._min,
            max: this._max
        });
    }

    isAtMin() {
        return this._value <= this._min;
    }

    isAtMax() {
        return this._value >= this._max;
    }

    _validateStep(step) {
        if (typeof step !== 'number' || isNaN(step)) {
            throw new CounterError(CounterErrorMessages.INVALID_STEP_TYPE);
        }
        
        if (step < CounterLimits.STEP_MIN) {
            throw new CounterError(CounterErrorMessages.STEP_TOO_LOW);
        }
        
        if (step > CounterLimits.STEP_MAX) {
            throw new CounterError(CounterErrorMessages.STEP_TOO_HIGH);
        }
        
        return Math.floor(step); 
    }

    _clamp(value) {
        return Math.max(this._min, Math.min(this._max, value));
    }

    toJSON() {
        return {
            value: this._value,
            step: this._step,
            min: this._min,
            max: this._max
        };
    }
}


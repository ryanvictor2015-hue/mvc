
import BaseController from '../../core/BaseController.js';

export default class CounterController extends BaseController {
    
    constructor(options) {
        super(options);
    }

    _setupViewCallbacks() {
        
        this._view.onIncrement = () => {
            this._model.increment();
        };

        this._view.onDecrement = () => {
            this._model.decrement();
        };

        this._view.onReset = () => {
            this._model.reset();
        };

        this._view.onStepChange = (step) => {
            this._model.setStep(step);
        };
    }
}


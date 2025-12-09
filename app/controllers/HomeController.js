
import BaseController from '../../core/BaseController.js';

export default class HomeController extends BaseController {
    constructor(options) {
        
        super({ ...options, model: null });
    }

    _subscribeToModel() {
        
    }

    _initialRender() {
        if (this._view) {
            this._view.update({});
        }
    }
}


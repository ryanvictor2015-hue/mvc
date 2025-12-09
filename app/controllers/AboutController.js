
import BaseController from '../../core/BaseController.js';

export default class AboutController extends BaseController {
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


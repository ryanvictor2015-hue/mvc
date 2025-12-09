
export default class BaseView {
    
    constructor(rootElement) {
        this._root = typeof rootElement === 'string' 
            ? document.querySelector(rootElement) 
            : rootElement;
        
        if (!this._root) {
            throw new Error('BaseView: rootElement não encontrado no DOM');
        }

        this._eventHandlers = [];
        this._isRendered = false;
    }

    get root() {
        return this._root;
    }

    render(state) {
        throw new Error('BaseView.render() deve ser implementado pela subclasse');
    }

    update(state) {
        this._unbindEvents();
        this.render(state);
        this._isRendered = true;
        this.bindEvents();
    }

    bindEvents() {
        
    }

    addEventHandler(element, eventType, handler) {
        const el = typeof element === 'string' 
            ? this._root.querySelector(element) 
            : element;
        
        if (!el) {
            return;
        }

        el.addEventListener(eventType, handler);
        this._eventHandlers.push({ element: el, eventType, handler });
    }

    _unbindEvents() {
        this._eventHandlers.forEach(({ element, eventType, handler }) => {
            element.removeEventListener(eventType, handler);
        });
        this._eventHandlers = [];
    }


    clear() {
        this._root.innerHTML = '';
    }

    destroy() {
        this._unbindEvents();
        this.clear();
        this._isRendered = false;
    }

}



import BaseView from '../../core/BaseView.js';

export default class CounterView extends BaseView {
    constructor(rootElement) {
        super(rootElement);

        this.onIncrement = null;
        this.onDecrement = null;
        this.onReset = null;
        this.onStepChange = null;
        this._currentValue = null;
    }

    update(state) {
        const previousValue = this._currentValue ?? 0;
        const newValue = state.value ?? 0;
        
        if (this._isRendered && previousValue !== newValue) {
            const valueElement = this._root.querySelector('.counter-value');
            if (valueElement) {
                valueElement.textContent = newValue;
                
                valueElement.className = `counter-value ${newValue < 0 ? 'negative' : newValue > 0 ? 'positive' : ''}`;
                
                const incrementBtn = this._root.querySelector('#btn-increment');
                const decrementBtn = this._root.querySelector('#btn-decrement');
                if (incrementBtn) incrementBtn.disabled = state.isAtMax || false;
                if (decrementBtn) decrementBtn.disabled = state.isAtMin || false;
                
                const stepInput = this._root.querySelector('#step-input');
                if (stepInput && stepInput.value !== String(state.step)) {
                    stepInput.value = state.step;
                }
                
                const stepInfo = this._root.querySelector('.counter-info strong');
                if (stepInfo && state.step) {
                    stepInfo.textContent = state.step;
                }
                
                this._currentValue = newValue;
                return;
            }
        }
        
        super.update(state);
        this._currentValue = newValue;
    }

    render(state) {
        const value = state.value ?? 0;
        const { step = 1, min = -100, max = 100, isAtMin = false, isAtMax = false } = state;
        
        this._root.innerHTML = `
                <div class="counter-container" tabindex="0">
                <header class="counter-header">
                    <h1>Contador</h1>
                    <p class="counter-subtitle">Exemplo de MVC com Observer Pattern</p>
                </header>
                
                <div class="counter-display">
                    <span class="counter-value ${value < 0 ? 'negative' : value > 0 ? 'positive' : ''}">${value}</span>
                </div>
                
                <div class="counter-controls">
                    <button 
                        class="btn btn-decrement" 
                        id="btn-decrement"
                        ${isAtMin ? 'disabled' : ''}
                        aria-label="Decrementar"
                    >
                        <span class="btn-icon">−</span>
                    </button>
                    
                    <button 
                        class="btn btn-reset" 
                        id="btn-reset"
                        aria-label="Resetar"
                    >
                        <span class="btn-icon">↺</span>
                    </button>
                    
                    <button 
                        class="btn btn-increment" 
                        id="btn-increment"
                        ${isAtMax ? 'disabled' : ''}
                        aria-label="Incrementar"
                    >
                        <span class="btn-icon">+</span>
                    </button>
                </div>
                
                <div class="counter-settings">
                    <label for="step-input">
                        Passo:
                        <input 
                            type="number" 
                            id="step-input" 
                            value="${step}" 
                            min="1" 
                            max="100"
                            class="step-input"
                        />
                    </label>
                </div>
                
                <div class="counter-info">
                    <small>
                        Cada clique altera o valor em <strong>${step}</strong>
                    </small>
                </div>
            </div>
        `;
    }

    bindEvents() {
        
        this.addEventHandler('#btn-increment', 'click', (e) => {
            e.preventDefault();
            if (this.onIncrement) {
                this.onIncrement();
            }
        });

        this.addEventHandler('#btn-decrement', 'click', (e) => {
            e.preventDefault();
            if (this.onDecrement) {
                this.onDecrement();
            }
        });

        this.addEventHandler('#btn-reset', 'click', (e) => {
            e.preventDefault();
            if (this.onReset) {
                this.onReset();
            }
        });

        this.addEventHandler('#step-input', 'change', (e) => {
            const value = parseInt(e.target.value, 10);
            if (this.onStepChange && !isNaN(value) && value > 0) {
                this.onStepChange(value);
            }
        });

        const container = this._root.querySelector('.counter-container');
        if (container) {
            this.addEventHandler(container, 'keydown', (e) => {
                
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                
                switch (e.key) {
                    case 'ArrowUp':
                    case '+':
                        e.preventDefault();
                        if (this.onIncrement) this.onIncrement();
                        break;
                    case 'ArrowDown':
                    case '-':
                        e.preventDefault();
                        if (this.onDecrement) this.onDecrement();
                        break;
                    case 'r':
                    case 'R':
                        e.preventDefault();
                        if (this.onReset) this.onReset();
                        break;
                }
            });
        }
    }
}


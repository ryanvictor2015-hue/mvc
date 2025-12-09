

import AboutController from './controllers/AboutController.js';
import CounterController from './controllers/CounterController.js';
import HomeController from './controllers/HomeController.js';
import TodoController from './controllers/TodoController.js';

import AboutView from './views/AboutView.js';
import CounterView from './views/CounterView.js';
import HomeView from './views/HomeView.js';
import TodoView from './views/TodoView.js';

import { Routes, TodoFilter } from '../core/enums/index.js';
import { escapeHtml } from '../core/utils/index.js';

export const routes = {
    [Routes.HOME]: {
        controller: HomeController,
        view: HomeView,
        model: null
    },
    
    [Routes.COUNTER]: {
        controller: CounterController,
        view: CounterView,
        model: 'counterModel', 
        modelState: {
            value: 0,
            step: 1,
            min: -100,
            max: 100
        }
    },
    
    [Routes.TODOS]: {
        controller: TodoController,
        view: TodoView,
        model: 'todoModel', 
        modelState: {
            todos: [],
            filter: TodoFilter.ALL
        }
    },
    
    [Routes.ABOUT]: {
        controller: AboutController,
        view: AboutView,
        model: null
    }
};

export const notFoundHandler = (path, rootElement) => {
    const safePath = escapeHtml(path);
    rootElement.innerHTML = `
        <div class="not-found-container">
            <h1>404</h1>
            <h2>Página não encontrada</h2>
            <p>O caminho <code>${safePath}</code> não existe.</p>
            <nav class="not-found-nav">
                <a href="#${Routes.HOME}" class="btn-nav">← Ir para Home</a>
            </nav>
        </div>
    `;
};


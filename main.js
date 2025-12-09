import CounterModel from './app/models/CounterModel.js';
import TodoModel from './app/models/TodoModel.js';
import { notFoundHandler, routes } from './app/routes.js';
import { TodoService } from './app/services/index.js';
import { Container } from './core/Container.js';
import { DocumentState, Events } from './core/enums/index.js';
import { ErrorHandler } from './core/ErrorHandler.js';
import { EventBus } from './core/EventBus.js';
import { Router } from './core/Router.js';
import { LocalStorageRepository } from './infrastructure/repositories/index.js';

function initApp() {
    const eventBus = EventBus.getInstance();
    const container = new Container();
    const errorHandler = new ErrorHandler(eventBus);
    
    setupContainer(container, eventBus);
    
    const router = Router.getInstance({ eventBus, container, rootElement: '#app', errorHandler });
    router.registerAll(routes).setNotFoundHandler(notFoundHandler).init().start();
    
    errorHandler.init();
    
    setupDebug({ eventBus, container, router, errorHandler });
    
    eventBus.emit(Events.APP_READY);
    
    return { eventBus, container, router, errorHandler };
}

function setupContainer(container, eventBus) {
    container.registerInstance('eventBus', eventBus);
    
    container.registerSingleton('todoRepository', () => 
        new LocalStorageRepository('mvc-todos')
    );
    
    container.registerSingleton('todoService', (container) => 
        new TodoService(container.resolve('todoRepository'))
    );
    
    container.registerFactory('counterModel', (container, initialState = {}) => 
        new CounterModel({ eventBus: container.resolve('eventBus'), initialState })
    );
    
    container.registerFactory('todoModel', (container, initialState = {}) => 
        new TodoModel({ 
            service: container.resolve('todoService'), 
            eventBus: container.resolve('eventBus'), 
            initialState 
        })
    );
}

function setupDebug({ eventBus, container, router, errorHandler }) {
    if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
        window.__app = { eventBus, container, router, errorHandler };
        
        window.app = {
            navigate: (path, params) => router.navigate(path, params),
            emit: (event, data) => eventBus.emit(event, data),
            on: (event, handler) => eventBus.on(event, handler),
            router,
            eventBus
        };
        
        eventBus.on(Events.ROUTER_NOT_FOUND, ({ path }) => 
            console.warn(`Rota não encontrada: ${path}`)
        );
        
        eventBus.on(Events.APP_ERROR, (errorInfo) => 
            console.error('Erro na aplicação:', errorInfo)
        );
    }
}

if (document.readyState === DocumentState.LOADING) {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

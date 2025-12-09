import { Events } from './enums/index.js';
import { createController, createModel, createView } from './router/Factory.js';
import { parseHash } from './router/HashParser.js';
import { runMiddleware } from './router/MiddlewarePipeline.js';
import { renderDefaultNotFound } from './router/NotFoundRenderer.js';
import { compileRoute, createRouteMatchers, isDynamicPath } from './router/RouteMatchers.js';

let _routerInstance = null;

export class Router {
    
    constructor({ eventBus, container, rootElement, errorHandler = null }) {
        if (_routerInstance) {
            throw new Error('Router já instanciado. Use Router.getInstance()');
        }
        if (!eventBus) {
            throw new Error('Router: eventBus é obrigatório');
        }
        if (!container) {
            throw new Error('Router: container é obrigatório');
        }
        
        this._eventBus = eventBus;
        this._container = container;
        this._routes = new Map();
        this._currentController = null;
        this._currentRoute = null;
        this._cleanup = [];
        this._pendingNavigation = null;
        this._middlewareTimeoutMs = 5000;
        this._routeMatchers = createRouteMatchers(this._routes);
        this._errorHandler = errorHandler;
        
        const root = typeof rootElement === 'string'
            ? document.querySelector(rootElement)
            : rootElement;
        
        if (!root) {
            const selector = typeof rootElement === 'string' ? rootElement : 'HTMLElement';
            throw new Error(`[Router] Root element "${selector}" não encontrado no DOM`);
        }
        
        this._rootElement = root;
        this._notFoundHandler = null;
        this._isInitialized = false;

        _routerInstance = this;
    }

    static getInstance(options) {
        if (_routerInstance) {
            if (options) {
                throw new Error('Router já criado; não passe opções após a primeira inicialização');
            }
            return _routerInstance;
        }
        if (!options) {
            throw new Error('Router.getInstance(): opções são obrigatórias na primeira chamada');
        }
        return new Router(options);
    }

    init() {
        if (this._isInitialized) {
            return this;
        }

        this._hashChangeHandler = () => this._handleRouteChange();
        window.addEventListener('hashchange', this._hashChangeHandler);
        this._cleanup.push(() => window.removeEventListener('hashchange', this._hashChangeHandler));

        const navigateUnsub = this._eventBus.on(Events.ROUTER_NAVIGATE, ({ path, params }) => {
            this.navigate(path, params);
        });
        this._cleanup.push(navigateUnsub);

        this._isInitialized = true;
        return this;
    }

    destroy() {
        this._cleanup.forEach(fn => {
            try { fn(); } catch (e) { console.warn('[Router] Erro ao limpar listener', e); }
        });
        this._cleanup = [];
        if (this._currentController) {
            this._currentController.destroy();
        }
        this._currentController = null;
        this._currentRoute = null;
        this._pendingNavigation = null;
        // Permite recriar em ambientes de teste ou teardown
        _routerInstance = null;
    }

    register(path, config) {
        const isDynamic = isDynamicPath(path);
        const compiled = isDynamic ? compileRoute(path) : null;
        this._routes.set(path, {
            path,
            controller: config.controller,
            view: config.view,
            model: config.model,
            modelState: config.modelState || {},
            middleware: config.middleware || [],
            isDynamic,
            compiled
        });
        return this;
    }

    registerAll(routesConfig) {
        Object.entries(routesConfig).forEach(([path, config]) => {
            this.register(path, config);
        });
        return this;
    }

    setNotFoundHandler(handler) {
        this._notFoundHandler = handler;
        return this;
    }

    navigate(path, params = {}) {
        let hash = `#${path}`;

        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
            hash += `?${queryString}`;
        }
        
        window.location.hash = hash;
    }

    start() {
        if (!this._isInitialized) {
            throw new Error('Router não inicializado. Chame init() primeiro.');
        }

        if (!window.location.hash) {
            window.location.hash = '#/';
        }
        
        this._handleRouteChange();
    }

    async _handleRouteChange() {
        const navigationToken = Symbol('navigation');
        this._pendingNavigation = navigationToken;

        const { path, queryParams } = parseHash(window.location.hash);

        const matchedRoute = this._matchRoute(path);
        
        if (!matchedRoute) {
            if (this._pendingNavigation !== navigationToken) {
                return;
            }
            this._handleNotFound(path);
            this._pendingNavigation = null;
            return;
        }

        const { routeConfig, routeParams } = matchedRoute;

        const allParams = { ...routeParams, ...queryParams };

        await this._transitionTo(routeConfig, allParams, navigationToken);
    }

    _matchRoute(path) {
        return this._routeMatchers.match(path);
    }

    async _transitionTo(routeConfig, params, navigationToken) {
        try {
            this._eventBus.emit(Events.ROUTER_BEFORE_CHANGE, {
                from: this._currentRoute,
                to: routeConfig.path,
                params
            });

            const middlewareResult = await runMiddleware(
                routeConfig.middleware,
                { router: this, params, route: routeConfig },
                {
                    timeoutMs: this._middlewareTimeoutMs,
                    navigate: this.navigate.bind(this),
                    emitError: (error, ctx) => this._emitMiddlewareError(error, ctx)
                }
            );

            if (this._pendingNavigation !== navigationToken) {
                return;
            }

            if (!middlewareResult || middlewareResult.ok === false) {
                return;
            }

            // Só destrói o controller atual após middleware autorizar a navegação
            this._destroyCurrentController();

            const model = createModel(this._container, routeConfig, params);
            const view = createView(routeConfig, this._rootElement);
            const controller = createController(routeConfig, model, view, params, this, this._eventBus);

            controller.init();

            this._currentController = controller;
            this._currentRoute = routeConfig.path;

            this._eventBus.emit(Events.ROUTER_AFTER_CHANGE, {
                route: routeConfig.path,
                params,
                controller
            });
        } catch (error) {
            this._handleTransitionError(error, routeConfig, params);
        } finally {
            if (this._pendingNavigation === navigationToken) {
                this._pendingNavigation = null;
            }
        }
    }

    _handleTransitionError(error, routeConfig, params) {
        console.error('[Router] Erro durante transição de rota', error);
        try {
            this._errorHandler?.handle(error, {
                route: routeConfig?.path,
                params,
                type: 'navigation',
                timestamp: new Date().toISOString()
            });
        } catch (handlerError) {
            console.warn('[Router] Falha ao delegar erro para ErrorHandler', handlerError);
        }

        try {
            this._eventBus.emit(Events.APP_ERROR, {
                message: error?.message || 'Erro durante transição de rota',
                stack: error?.stack,
                route: routeConfig?.path,
                params,
                timestamp: new Date().toISOString()
            });
        } catch (emitError) {
            console.warn('[Router] Falha ao emitir APP_ERROR', emitError);
        }
    }

    _emitMiddlewareError(error, context = {}) {
        console.error('[Router] Erro em middleware:', error, context);
        try {
            this._eventBus.emit(Events.APP_ERROR, {
                message: error?.message || 'Erro em middleware do Router',
                stack: error?.stack,
                route: context.route,
                params: context.params,
                timestamp: new Date().toISOString()
            });
        } catch (emitError) {
            console.warn('[Router] Falha ao emitir APP_ERROR', emitError);
        }
    }

    _destroyCurrentController() {
        if (this._currentController) {
            this._currentController.destroy();
            this._currentController = null;
        }
    }

    _handleNotFound(path) {
        this._destroyCurrentController();

        if (this._notFoundHandler) {
            this._notFoundHandler(path, this._rootElement);
        } else {
            renderDefaultNotFound(this._rootElement, path);
        }

        this._eventBus.emit(Events.ROUTER_NOT_FOUND, { path });
    }

    get currentRoute() {
        return this._currentRoute;
    }

    get currentController() {
        return this._currentController;
    }

    get routes() {
        return Array.from(this._routes.keys());
    }

}


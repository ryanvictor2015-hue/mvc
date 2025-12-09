export function createModel(container, routeConfig, params) {
    if (!routeConfig.model) {
        return null;
    }

    if (typeof routeConfig.model === 'string') {
        return container.resolve(routeConfig.model, routeConfig.modelState || {});
    }

    if (typeof routeConfig.model === 'function') {
        return createModelFromFunction(routeConfig.model, routeConfig.modelState, params);
    }

    return routeConfig.model;
}

function createModelFromFunction(ModelClass, modelState, params) {
    const isClass = ModelClass.prototype && ModelClass.prototype.constructor;
    if (isClass) {
        return new ModelClass(modelState, params);
    }
    return ModelClass(modelState || {}, params);
}

export function createView(routeConfig, rootElement) {
    return new routeConfig.view(rootElement);
}

export function createController(routeConfig, model, view, params, router, eventBus) {
    return new routeConfig.controller({
        model,
        view,
        params,
        router,
        eventBus
    });
}


export function createRouteMatchers(routesMap) {
    return {
        match(path) {
            return matchExactRoute(routesMap, path) || matchDynamicRoute(routesMap, path);
        }
    };
}

export function isDynamicPath(routePath) {
    return routePath.includes(':') || routePath.includes('*');
}

export function compileRoute(routePath) {
    // /todos/:id -> ^/todos/(?<id>[^/]+)$ ; wildcard * -> .*
    const pattern = routePath
        .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
        .replace(/\\\*/g, '.*')
        .replace(/\\:([A-Za-z0-9_]+)/g, '(?<$1>[^/]+)');
    return new RegExp(`^${pattern}$`);
}

function matchExactRoute(routesMap, path) {
    if (!routesMap.has(path)) {
        return null;
    }
    const routeConfig = routesMap.get(path);
    if (routeConfig.isDynamic) {
        return null;
    }
    return { routeConfig, routeParams: {} };
}

function matchDynamicRoute(routesMap, path) {
    for (const [, routeConfig] of routesMap) {
        if (!routeConfig.isDynamic || !routeConfig.compiled) continue;
        const match = routeConfig.compiled.exec(path);
        if (match) {
            return { routeConfig, routeParams: match.groups || {} };
        }
    }
    return null;
}


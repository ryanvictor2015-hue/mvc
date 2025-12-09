const DEFAULT_TIMEOUT_MS = 5000;

export async function runMiddleware(middlewareList = [], context = {}, options = {}) {
    const {
        timeoutMs = DEFAULT_TIMEOUT_MS,
        navigate = () => {},
        emitError = () => {}
    } = options;

    const actions = {
        redirect: (result) => {
            navigate(result.redirect, result.params || {});
            return { ok: false, redirected: true };
        },
        block: (result) => ({ ok: false, reason: result?.reason })
    };

    for (const fn of middlewareList) {
        if (typeof fn !== 'function') continue;

        let result;
        try {
            result = await withTimeout(
                Promise.resolve(fn({ ...context })),
                timeoutMs
            );
        } catch (error) {
            emitError(error, context);
            return { ok: false };
        }

        const kind = classifyResult(result);
        if (kind === 'continue') {
            continue;
        }

        const handler = actions[kind];
        return handler ? handler(result) : { ok: false };
    }

    return { ok: true };
}

function classifyResult(result) {
    if (result === false) return 'block';
    if (result?.redirect) return 'redirect';
    if (result?.block) return 'block';
    return 'continue';
}

function withTimeout(promise, ms) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Middleware timeout after ${ms}ms`)), ms);
    });

    return Promise.race([
        promise.finally(() => clearTimeout(timeoutId)),
        timeoutPromise
    ]);
}


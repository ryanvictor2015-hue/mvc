export function parseHash(hashString) {
    const hash = (hashString || '').slice(1) || '/';
    const [pathPart, queryPart] = hash.split('?');

    const queryParams = {};
    if (queryPart) {
        new URLSearchParams(queryPart).forEach((value, key) => {
            queryParams[key] = value;
        });
    }

    return {
        path: pathPart || '/',
        queryParams
    };
}


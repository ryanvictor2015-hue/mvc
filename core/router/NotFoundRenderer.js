export function renderDefaultNotFound(rootElement, path) {
    rootElement.innerHTML = `
        <div class="not-found">
            <h1>404</h1>
            <p>Página não encontrada: ${path}</p>
            <a href="#/">Voltar para Home</a>
        </div>
    `;
}



import BaseView from '../../core/BaseView.js';

export default class HomeView extends BaseView {
    constructor(rootElement) {
        super(rootElement);
    }

    render() {
        this._root.innerHTML = `
            <div class="home-container">
                <header class="home-header">
                    <h1>MiniMVC Framework</h1>
                    <p class="home-tagline">
                        Um mini framework MVC em JavaScript puro
                    </p>
                </header>
                
                <section class="home-features">
                    <h2>Características</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <h3>Arquitetura MVC</h3>
                            <p>Separação clara entre Model, View e Controller</p>
                        </div>
                        <div class="feature-card">
                            <h3>Observer Pattern</h3>
                            <p>Atualização reativa quando o estado muda</p>
                        </div>
                        <div class="feature-card">
                            <h3>Router SPA</h3>
                            <p>Navegação sem reload de página</p>
                        </div>
                        <div class="feature-card">
                            <h3>EventBus</h3>
                            <p>Comunicação desacoplada entre componentes</p>
                        </div>
                    </div>
                </section>
                
                <section class="home-demos">
                    <h2>Exemplos</h2>
                    <p>Explore os exemplos para ver o framework em ação:</p>
                    <nav class="demos-nav">
                        <a href="#/counter" class="demo-link">
                            <span class="demo-title">Contador</span>
                            <span class="demo-desc">Observer + State Management</span>
                        </a>
                        <a href="#/todos" class="demo-link">
                            <span class="demo-title">Lista de Tarefas</span>
                            <span class="demo-desc">CRUD + Persistência</span>
                        </a>
                        <a href="#/about" class="demo-link">
                            <span class="demo-title">Sobre</span>
                            <span class="demo-desc">Arquitetura e Padrões</span>
                        </a>
                    </nav>
                </section>
                
                <section class="home-code">
                    <h2>Como Usar</h2>
                    <pre class="code-block"><code>
import { routes } from './app/routes.js';

import { Router } from './core/index.js';

Router
    .init('#app')
    .registerAll(routes)
    .start();</code></pre>
                </section>
            </div>
        `;
    }

    bindEvents() {
        
    }
}


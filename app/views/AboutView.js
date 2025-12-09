
import BaseView from '../../core/BaseView.js';

export default class AboutView extends BaseView {
    constructor(rootElement) {
        super(rootElement);
    }

    render() {
        this._root.innerHTML = `
            <div class="about-container">
                <header class="about-header">
                    <h1>Sobre o Framework</h1>
                    <p class="about-tagline">
                        Arquitetura, Padrões e Princípios
                    </p>
                </header>
                
                <section class="about-section">
                    <h2>Arquitetura MVC</h2>
                    <div class="architecture-diagram">
                        <div class="arch-component arch-view">
                            <strong>View</strong>
                            <p>Renderiza UI e captura eventos</p>
                        </div>
                        <div class="arch-arrow">↔</div>
                        <div class="arch-component arch-controller">
                            <strong>Controller</strong>
                            <p>Coordena Model e View</p>
                        </div>
                        <div class="arch-arrow">↔</div>
                        <div class="arch-component arch-model">
                            <strong>Model</strong>
                            <p>Gerencia estado e lógica</p>
                        </div>
                    </div>
                </section>
                
                <section class="about-section">
                    <h2>Padrões de Projeto (GoF) usados aqui</h2>
                    <div class="patterns-list">
                        <article class="pattern-card"><h3>Singleton</h3></article>
                        <article class="pattern-card"><h3>Factory Method</h3></article>
                        <article class="pattern-card"><h3>Template Method</h3></article>
                        <article class="pattern-card"><h3>Observer</h3></article>
                        <article class="pattern-card"><h3>Chain of Responsibility</h3></article>
                    </div>
                </section>
                
                <section class="about-section">
                    <h2>Princípios SOLID</h2>
                    <ul class="solid-list">
                        <li>
                            <strong>S</strong>ingle Responsibility: Cada classe tem uma única responsabilidade
                        </li>
                        <li>
                            <strong>O</strong>pen/Closed: Classes base são abertas para extensão, fechadas para modificação
                        </li>
                        <li>
                            <strong>L</strong>iskov Substitution: Subclasses podem substituir suas classes base
                        </li>
                        <li>
                            <strong>I</strong>nterface Segregation: Interfaces específicas (métodos de callback)
                        </li>
                        <li>
                            <strong>D</strong>ependency Inversion: Dependências são injetadas, não criadas internamente
                        </li>
                    </ul>
                </section>
                
                <section class="about-section">
                    <h2>Estrutura de Pastas</h2>
                    <pre class="folder-structure">
src/
├── core/                  # Framework base
│   ├── EventBus.js       # Pub/Sub Singleton
│   ├── Router.js         # SPA Router
│   ├── BaseModel.js      # Model com Observer
│   ├── BaseView.js       # View base
│   ├── BaseController.js # Controller base
│   └── index.js          # Exportações
│
├── app/                   # Aplicação de exemplo
│   ├── models/           # Models específicos
│   ├── views/            # Views específicas
│   ├── controllers/      # Controllers específicos
│   └── routes.js         # Configuração de rotas
│
├── main.js               # Entry point
└── index.html            # HTML base
                    </pre>
                </section>
                
                <nav class="about-nav">
                    <a href="#/" class="btn-nav">← Voltar para Home</a>
                </nav>
            </div>
        `;
    }

    bindEvents() {
        
    }
}


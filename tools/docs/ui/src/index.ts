import './index.css';
import { DocEntry } from '../../src/types';

type EditorType = 'vscode' | 'cursor' | 'idea' | 'webstorm' | 'pycharm' | 'sublime' | 'neovim';

interface EditorConfig {
    name: string;
    protocol: (path: string, line: number) => string;
    isCommand?: boolean;
}

const EDITORS: Record<EditorType, EditorConfig> = {
    vscode: {
        name: 'VS Code',
        protocol: (path, line) => `vscode://file/${path}:${line}`
    },
    cursor: {
        name: 'Cursor',
        protocol: (path, line) => `cursor://file/${path}:${line}`
    },
    idea: {
        name: 'IntelliJ IDEA',
        protocol: (path, line) => `idea://open?file=${path}&line=${line}`
    },
    webstorm: {
        name: 'WebStorm',
        protocol: (path, line) => `webstorm://open?file=${path}&line=${line}`
    },
    pycharm: {
        name: 'PyCharm',
        protocol: (path, line) => `pycharm://open?file=${path}&line=${line}`
    },
    sublime: {
        name: 'Sublime Text',
        protocol: (path, line) => `subl://open?url=file://${path}&line=${line}`
    },
    neovim: {
        name: 'Neovim',
        isCommand: true,
        protocol: (path, line) => `nvim +${line} ${path}`
    }
};

class DocumentationUI {
    private entries: DocEntry[] = [];
    private filteredEntries: DocEntry[] = [];
    private currentFilter: 'all' | 'documented' | 'undocumented' = 'all';
    private searchQuery = '';
    private isSidebarOpen = false;
    private preferredEditor: EditorType = 'vscode';

    constructor() {
        const saved = localStorage.getItem('exba-preferred-editor') as EditorType;
        if (saved && EDITORS[saved]) this.preferredEditor = saved;
        this.init();
    }

    async init() {
        const root = document.getElementById('root');
        if (!root) return;

        root.innerHTML = `
            <header class="mobile-header">
                <button class="menu-toggle" id="menu-toggle">☰</button>
                <div class="mobile-title">EXBA API</div>
            </header>
            <div class="layout-body">
                <aside id="sidebar">
                    <div class="search-box">
                        <input type="text" id="search" placeholder="Search API items...">
                    </div>
                    <nav id="nav"></nav>
                </aside>
                <main id="main">
                    <h1>EXBA API Reference</h1>
                    <div class="filter-bar">
                        <div class="filter-group">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="documented">Documented</button>
                            <button class="filter-btn" data-filter="undocumented">Undocumented</button>
                        </div>
                        <div class="editor-switcher">
                            <span class="editor-label">Editor:</span>
                            <select id="editor-select" class="editor-select">
                                ${Object.entries(EDITORS).map(([id, config]) => `
                                    <option value="${id}" ${id === this.preferredEditor ? 'selected' : ''}>${config.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="filter-count" id="entry-count">Loading entries...</div>
                    </div>
                    <div id="content"></div>
                </main>
            </div>
        `;

        try {
            const response = await fetch('./docs.json');
            this.entries = await response.json();
            this.filteredEntries = [...this.entries];
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to load documentation data:', error);
            const content = document.getElementById('content');
            if (content) content.innerHTML = '<p class="error">Error loading documentation data. Please run "bun run docs:gen" first.</p>';
        }
    }

    private setupEventListeners() {
        const searchInput = document.getElementById('search') as HTMLInputElement;
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
            this.applyFilters();
        });

        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter') as any;
                this.applyFilters();
            });
        });

        const editorSelect = document.getElementById('editor-select') as HTMLSelectElement;
        editorSelect.addEventListener('change', (e) => {
            this.preferredEditor = (e.target as HTMLSelectElement).value as EditorType;
            localStorage.setItem('exba-preferred-editor', this.preferredEditor);
            this.render(); // Re-render to update the "Open" links
        });

        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        
        menuToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isSidebarOpen = !this.isSidebarOpen;
            sidebar?.classList.toggle('open', this.isSidebarOpen);
            menuToggle.textContent = this.isSidebarOpen ? '✕' : '☰';
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (this.isSidebarOpen && sidebar && !sidebar.contains(e.target as Node)) {
                this.isSidebarOpen = false;
                sidebar.classList.remove('open');
                if (menuToggle) menuToggle.textContent = '☰';
            }
        });

        // Handle navigation clicks on mobile
        const nav = document.getElementById('nav');
        nav?.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).classList.contains('nav-item')) {
                if (window.innerWidth <= 992) {
                    this.isSidebarOpen = false;
                    sidebar?.classList.remove('open');
                    if (menuToggle) menuToggle.textContent = '☰';
                }
            }
        });

        // Delegate "Copy Command" for Neovim
        const content = document.getElementById('content');
        content?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const openBtn = target.closest('.open-btn') as HTMLElement;
            if (openBtn && openBtn.dataset.type === 'neovim') {
                const cmd = openBtn.dataset.cmd || '';
                navigator.clipboard.writeText(cmd).then(() => {
                    const originalText = openBtn.innerHTML;
                    openBtn.innerHTML = '<span>Copied!</span>';
                    setTimeout(() => { openBtn.innerHTML = originalText; }, 1500);
                });
            }
        });
    }

    private applyFilters() {
        this.filteredEntries = this.entries.filter(e => {
            const nameMatch = e.name.toLowerCase().includes(this.searchQuery);
            const parentMatch = e.parent && e.parent.toLowerCase().includes(this.searchQuery);
            const matchesSearch = nameMatch || parentMatch;
            
            const hasDoc = e.description && !e.description.includes('No documentation provided');
            let matchesFilter = true;
            if (this.currentFilter === 'documented') matchesFilter = hasDoc;
            else if (this.currentFilter === 'undocumented') matchesFilter = !hasDoc;

            return matchesSearch && matchesFilter;
        });

        this.render();
    }

    private parseMarkdownLite(text: string): string {
        if (!text) return '<em>No documentation provided.</em>';
        
        let processed = text.replace(/```(?:(\w+)\n)?([\s\S]*?)```/g, (_match, lang, code) => {
            return `<div class="code-block-wrapper">
                <span class="code-lang">${lang || 'code'}</span>
                <pre class="code-block"><code class="language-${lang || 'none'}">${this.escapeHtml(code.trim())}</code></pre>
              </div>`;
        });
        processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
        return processed;
    }

    private escapeHtml(str: string): string {
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]!));
    }

    private render() {
        const nav = document.getElementById('nav');
        const content = document.getElementById('content');
        const count = document.getElementById('entry-count');

        if (!nav || !content || !count) return;

        count.innerText = `Showing ${this.filteredEntries.length} of ${this.entries.length} entries`;

        nav.innerHTML = this.filteredEntries.map(e => {
            const uniqueId = this.getUniqueId(e);
            return `<a href="#${uniqueId}" class="nav-item">${e.parent ? e.parent + '.' : ''}${e.name}</a>`;
        }).join('');

        content.innerHTML = this.filteredEntries.length > 0 
            ? this.filteredEntries.map(e => this.renderEntry(e)).join('')
            : '<p>No matching documentation entries found.</p>';
    }

    private getUniqueId(e: DocEntry): string {
        return `entry-${btoa(e.file + e.line).replace(/=/g, '')}`;
    }

    private renderEntry(e: DocEntry): string {
        const uniqueId = this.getUniqueId(e);
        const hasDoc = e.description && !e.description.includes('No documentation provided');
        const editor = EDITORS[this.preferredEditor];
        const openLink = editor.protocol(e.file, e.line);
        
        return `
            <div class="entry" id="${uniqueId}" data-has-doc="${hasDoc}">
                <div class="entry-header">
                    <span class="type-badge ${e.type}">${e.type}</span>
                    <span class="lang-badge ${e.language}">${e.language}</span>
                    <span class="name">${e.parent ? `${e.parent} → ` : ''}${e.name}</span>
                    ${e.isPublic ? '<span class="visibility-badge">public</span>' : ''}
                </div>
                <div class="signature">${this.escapeHtml(e.signature)}</div>
                <div class="description">${this.parseMarkdownLite(e.description)}</div>
                ${e.params && e.params.length > 0 ? `
                    <div class="params-section">
                        <h4>Parameters</h4>
                        <table>
                            <thead><tr><th>Name</th><th>Description</th></tr></thead>
                            <tbody>
                                ${e.params.map(p => `<tr><td><code>${p.name}</code></td><td>${p.description}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                ${e.returns ? `
                    <div class="returns-section">
                        <strong>Returns:</strong> <code>${this.escapeHtml(e.returns)}</code>
                    </div>
                ` : ''}
                <div class="meta-row">
                    <div class="meta">File: <code>${e.file}:${e.line}</code></div>
                    ${editor.isCommand ? `
                        <button class="open-btn" data-type="neovim" data-cmd="${openLink}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy nvim command
                        </button>
                    ` : `
                        <a href="${openLink}" class="open-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            Open in ${editor.name}
                        </a>
                    `}
                </div>
            </div>
        `;
    }
}

new DocumentationUI();

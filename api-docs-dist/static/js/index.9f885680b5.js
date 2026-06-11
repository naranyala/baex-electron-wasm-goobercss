(()=>{"use strict";let e={vscode:{name:"VS Code",protocol:(e,t)=>`vscode://file/${e}:${t}`},cursor:{name:"Cursor",protocol:(e,t)=>`cursor://file/${e}:${t}`},idea:{name:"IntelliJ IDEA",protocol:(e,t)=>`idea://open?file=${e}&line=${t}`},webstorm:{name:"WebStorm",protocol:(e,t)=>`webstorm://open?file=${e}&line=${t}`},pycharm:{name:"PyCharm",protocol:(e,t)=>`pycharm://open?file=${e}&line=${t}`},sublime:{name:"Sublime Text",protocol:(e,t)=>`subl://open?url=file://${e}&line=${t}`},neovim:{name:"Neovim",isCommand:!0,protocol:(e,t)=>`nvim +${t} ${e}`}};new class{entries=[];filteredEntries=[];currentFilter="all";searchQuery="";isSidebarOpen=!1;preferredEditor="vscode";constructor(){const t=localStorage.getItem("exba-preferred-editor");t&&e[t]&&(this.preferredEditor=t),this.init()}async init(){let t=document.getElementById("root");if(t){t.innerHTML=`
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
                                ${Object.entries(e).map(e=>{let[t,n]=e;return`
                                    <option value="${t}" ${t===this.preferredEditor?"selected":""}>${n.name}</option>
                                `}).join("")}
                            </select>
                        </div>
                        <div class="filter-count" id="entry-count">Loading entries...</div>
                    </div>
                    <div id="content"></div>
                </main>
            </div>
        `;try{let e=await fetch("./docs.json");this.entries=await e.json(),this.filteredEntries=[...this.entries],this.render(),this.setupEventListeners()}catch(t){console.error("Failed to load documentation data:",t);let e=document.getElementById("content");e&&(e.innerHTML='<p class="error">Error loading documentation data. Please run "bun run docs:gen" first.</p>')}}}setupEventListeners(){document.getElementById("search").addEventListener("input",e=>{this.searchQuery=e.target.value.toLowerCase(),this.applyFilters()});let e=document.querySelectorAll(".filter-btn");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(e=>e.classList.remove("active")),t.classList.add("active"),this.currentFilter=t.getAttribute("data-filter"),this.applyFilters()})}),document.getElementById("editor-select").addEventListener("change",e=>{this.preferredEditor=e.target.value,localStorage.setItem("exba-preferred-editor",this.preferredEditor),this.render()});let t=document.getElementById("menu-toggle"),n=document.getElementById("sidebar");t?.addEventListener("click",e=>{e.stopPropagation(),this.isSidebarOpen=!this.isSidebarOpen,n?.classList.toggle("open",this.isSidebarOpen),t.textContent=this.isSidebarOpen?"✕":"☰"}),document.addEventListener("click",e=>{this.isSidebarOpen&&n&&!n.contains(e.target)&&(this.isSidebarOpen=!1,n.classList.remove("open"),t&&(t.textContent="☰"))});let i=document.getElementById("nav");i?.addEventListener("click",e=>{e.target.classList.contains("nav-item")&&window.innerWidth<=992&&(this.isSidebarOpen=!1,n?.classList.remove("open"),t&&(t.textContent="☰"))});let r=document.getElementById("content");r?.addEventListener("click",e=>{let t=e.target.closest(".open-btn");if(t&&"neovim"===t.dataset.type){let e=t.dataset.cmd||"";navigator.clipboard.writeText(e).then(()=>{let e=t.innerHTML;t.innerHTML="<span>Copied!</span>",setTimeout(()=>{t.innerHTML=e},1500)})}})}applyFilters(){this.filteredEntries=this.entries.filter(e=>{let t=e.name.toLowerCase().includes(this.searchQuery),n=e.parent&&e.parent.toLowerCase().includes(this.searchQuery),i=e.description&&!e.description.includes("No documentation provided"),r=!0;return"documented"===this.currentFilter?r=i:"undocumented"===this.currentFilter&&(r=!i),(t||n)&&r}),this.render()}parseMarkdownLite(e){if(!e)return"<em>No documentation provided.</em>";let t=e.replace(/```(?:(\w+)\n)?([\s\S]*?)```/g,(e,t,n)=>`<div class="code-block-wrapper">
                <span class="code-lang">${t||"code"}</span>
                <pre class="code-block"><code class="language-${t||"none"}">${this.escapeHtml(n.trim())}</code></pre>
              </div>`);return t.replace(/`([^`]+)`/g,"<code>$1</code>")}escapeHtml(e){return e.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}render(){let e=document.getElementById("nav"),t=document.getElementById("content"),n=document.getElementById("entry-count");e&&t&&n&&(n.innerText=`Showing ${this.filteredEntries.length} of ${this.entries.length} entries`,e.innerHTML=this.filteredEntries.map(e=>{let t=this.getUniqueId(e);return`<a href="#${t}" class="nav-item">${e.parent?e.parent+".":""}${e.name}</a>`}).join(""),t.innerHTML=this.filteredEntries.length>0?this.filteredEntries.map(e=>this.renderEntry(e)).join(""):"<p>No matching documentation entries found.</p>")}getUniqueId(e){return`entry-${btoa(e.file+e.line).replace(/=/g,"")}`}renderEntry(t){let n=this.getUniqueId(t),i=t.description&&!t.description.includes("No documentation provided"),r=e[this.preferredEditor],s=r.protocol(t.file,t.line);return`
            <div class="entry" id="${n}" data-has-doc="${i}">
                <div class="entry-header">
                    <span class="type-badge ${t.type}">${t.type}</span>
                    <span class="lang-badge ${t.language}">${t.language}</span>
                    <span class="name">${t.parent?`${t.parent} → `:""}${t.name}</span>
                    ${t.isPublic?'<span class="visibility-badge">public</span>':""}
                </div>
                <div class="signature">${this.escapeHtml(t.signature)}</div>
                <div class="description">${this.parseMarkdownLite(t.description)}</div>
                ${t.params&&t.params.length>0?`
                    <div class="params-section">
                        <h4>Parameters</h4>
                        <table>
                            <thead><tr><th>Name</th><th>Description</th></tr></thead>
                            <tbody>
                                ${t.params.map(e=>`<tr><td><code>${e.name}</code></td><td>${e.description}</td></tr>`).join("")}
                            </tbody>
                        </table>
                    </div>
                `:""}
                ${t.returns?`
                    <div class="returns-section">
                        <strong>Returns:</strong> <code>${this.escapeHtml(t.returns)}</code>
                    </div>
                `:""}
                <div class="meta-row">
                    <div class="meta">File: <code>${t.file}:${t.line}</code></div>
                    ${r.isCommand?`
                        <button class="open-btn" data-type="neovim" data-cmd="${s}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy nvim command
                        </button>
                    `:`
                        <a href="${s}" class="open-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            Open in ${r.name}
                        </a>
                    `}
                </div>
            </div>
        `}}})();
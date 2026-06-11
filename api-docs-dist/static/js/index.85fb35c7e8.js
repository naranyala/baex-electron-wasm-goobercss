(()=>{"use strict";new class{entries=[];filteredEntries=[];currentFilter="all";searchQuery="";constructor(){this.init()}async init(){let e=document.getElementById("root");if(e){e.innerHTML=`
            <aside>
                <div class="search-box">
                    <input type="text" id="search" placeholder="Search API items...">
                </div>
                <nav id="nav"></nav>
            </aside>
            <main>
                <h1>EXBA API Reference</h1>
                <div class="filter-bar">
                    <div class="filter-group">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="documented">Documented</button>
                        <button class="filter-btn" data-filter="undocumented">Undocumented</button>
                    </div>
                    <div class="filter-count" id="entry-count">Loading entries...</div>
                </div>
                <div id="content"></div>
            </main>
        `;try{let e=await fetch("./docs.json");this.entries=await e.json(),this.filteredEntries=[...this.entries],this.render(),this.setupEventListeners()}catch(t){console.error("Failed to load documentation data:",t);let e=document.getElementById("content");e&&(e.innerHTML='<p class="error">Error loading documentation data. Please run "bun run docs:gen" first.</p>')}}}setupEventListeners(){document.getElementById("search").addEventListener("input",e=>{this.searchQuery=e.target.value.toLowerCase(),this.applyFilters()});let e=document.querySelectorAll(".filter-btn");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(e=>e.classList.remove("active")),t.classList.add("active"),this.currentFilter=t.getAttribute("data-filter"),this.applyFilters()})})}applyFilters(){this.filteredEntries=this.entries.filter(e=>{let t=e.name.toLowerCase().includes(this.searchQuery)||e.parent&&e.parent.toLowerCase().includes(this.searchQuery),n=e.description&&!e.description.includes("No documentation provided"),i=!0;return"documented"===this.currentFilter?i=n:"undocumented"===this.currentFilter&&(i=!n),t&&i}),this.render()}parseMarkdownLite(e){if(!e)return"<em>No documentation provided.</em>";let t=e.replace(/```(?:(\w+)\n)?([\s\S]*?)```/g,(e,t,n)=>`<div class="code-block-wrapper">
                <span class="code-lang">${t||"code"}</span>
                <pre class="code-block"><code class="language-${t||"none"}">${this.escapeHtml(n.trim())}</code></pre>
              </div>`);return t.replace(/`([^`]+)`/g,"<code>$1</code>")}escapeHtml(e){return e.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}render(){let e=document.getElementById("nav"),t=document.getElementById("content"),n=document.getElementById("entry-count");e&&t&&n&&(n.innerText=`Showing ${this.filteredEntries.length} of ${this.entries.length} entries`,e.innerHTML=this.filteredEntries.map(e=>{let t=this.getUniqueId(e);return`<a href="#${t}" class="nav-item">${e.parent?e.parent+".":""}${e.name}</a>`}).join(""),t.innerHTML=this.filteredEntries.length>0?this.filteredEntries.map(e=>this.renderEntry(e)).join(""):"<p>No matching documentation entries found.</p>")}getUniqueId(e){return`entry-${btoa(e.file+e.line).replace(/=/g,"")}`}renderEntry(e){let t=this.getUniqueId(e),n=e.description&&!e.description.includes("No documentation provided");return`
            <div class="entry" id="${t}" data-has-doc="${n}">
                <div class="entry-header">
                    <span class="type-badge ${e.type}">${e.type}</span>
                    <span class="lang-badge ${e.language}">${e.language}</span>
                    <span class="name">${e.parent?`${e.parent} → `:""}${e.name}</span>
                    ${e.isPublic?'<span class="visibility-badge">public</span>':""}
                </div>
                <div class="signature">${this.escapeHtml(e.signature)}</div>
                <div class="description">${this.parseMarkdownLite(e.description)}</div>
                ${e.params&&e.params.length>0?`
                    <div class="params-section">
                        <h4>Parameters</h4>
                        <table>
                            <thead><tr><th>Name</th><th>Description</th></tr></thead>
                            <tbody>
                                ${e.params.map(e=>`<tr><td><code>${e.name}</code></td><td>${e.description}</td></tr>`).join("")}
                            </tbody>
                        </table>
                    </div>
                `:""}
                ${e.returns?`
                    <div class="returns-section">
                        <strong>Returns:</strong> <code>${this.escapeHtml(e.returns)}</code>
                    </div>
                `:""}
                <div class="meta">File: <code>${e.file}:${e.line}</code></div>
            </div>
        `}}})();
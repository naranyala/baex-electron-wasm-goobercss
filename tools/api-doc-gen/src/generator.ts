import { DocEntry } from './types';

export class Generator {
  static parseMarkdownLite(text: string): string {
    // Handle code blocks with optional language tag: ```lang\ncode```
    let processed = text.replace(/```(?:(\w+)\n)?([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="code-block-wrapper">
                <span class="code-lang">${lang || 'code'}</span>
                <pre class="code-block"><code class="language-${lang || 'none'}">${code.trim()}</code></pre>
              </div>`;
    });
    // Handle inline code: `code`
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
    return processed;
  }

  static generate(entries: DocEntry[]): string {
    // Deduplicate entries based on file, line, and name to prevent accidental double-parsing
    const seen = new Set();
    const uniqueEntries = entries.filter(e => {
      const key = `${e.file}:${e.line}:${e.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const entriesHtml = uniqueEntries.map((e, idx) => {
      const uniqueId = `entry-${btoa(e.file + e.line).replace(/=/g, '')}`;
      const hasDoc = e.description && e.description !== '<em>No description provided.</em>';
      return `
    <div class="entry" id="${uniqueId}" data-has-doc="${hasDoc}">
      <div class="entry-header">
        <span class="type-badge ${e.type}">${e.type}</span>
        <span class="lang-badge ${e.language}">${e.language}</span>
        <span class="name">${e.parent ? `${e.parent} → ` : ''}${e.name}</span>
        ${e.isPublic ? '<span class="visibility-badge">public</span>' : ''}
      </div>
      <div class="signature">${e.signature}</div>
      <div class="description">${e.description ? Generator.parseMarkdownLite(e.description) : '<em>No description provided.</em>'}</div>
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
          <strong>Returns:</strong> <code>${e.returns}</code>
        </div>
      ` : ''}
      <div class="meta">File: <code>${e.file}:${e.line}</code></div>
    </div>
  `;
    }).join('');

    const navHtml = uniqueEntries.map((e, idx) => {
      const uniqueId = `entry-${btoa(e.file + e.line).replace(/=/g, '')}`;
      return `
    <a href="#${uniqueId}" class="nav-item" data-name="${e.name.toLowerCase()}">${e.parent ? e.parent + '.' : ''}${e.name}</a>
  `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project API Reference</title>
    <style>
        :root {
            --bg-color: #0d1117;
            --sidebar-bg: #161b22;
            --text-color: #c9d1d9;
            --text-muted: #8b949e;
            --border-color: #30363d;
            --primary-color: #58a6ff;
            --accent-color: #30363d;
            --code-bg: #161b22;
            --code-text: #e6edf3;
            --inline-code-color: #ff7b72;
        }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: var(--text-color); display: flex; margin: 0; height: 100vh; background: var(--bg-color); }
        aside { width: 320px; background: var(--sidebar-bg); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; height: 100%; position: sticky; top: 0; }
        .search-box { padding: 24px; border-bottom: 1px solid var(--border-color); }
        #search { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid var(--border-color); border-radius: 6px; font-size: 14px; background: var(--bg-color); color: var(--text-color); outline: none; }
        #search:focus { border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3); }
        nav { overflow-y: auto; flex: 1; padding: 10px 0; }
        .nav-item { display: block; padding: 8px 24px; text-decoration: none; color: var(--text-muted); font-size: 14px; border-left: 3px solid transparent; transition: all 0.2s; }
        .nav-item:hover { background: #21262d; color: var(--text-color); border-left-color: var(--primary-color); }
        main { flex: 1; overflow-y: auto; padding: 60px; background: var(--bg-color); }
        
        .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; padding: 12px 20px; background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 8px; }
        .filter-group { display: flex; gap: 8px; }
        .filter-btn { padding: 6px 12px; font-size: 13px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .filter-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
        .filter-count { font-size: 13px; color: var(--text-muted); font-family: monospace; }

        .entry { margin-bottom: 60px; padding-bottom: 40px; border-bottom: 1px solid var(--border-color); }
        .entry-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .name { font-size: 28px; font-weight: 700; color: #f0f6fc; }
        .type-badge, .lang-badge, .visibility-badge { font-size: 11px; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
        .type-badge { color: white; }
        .function { background: #1f6feb; } .class { background: #238636; } .struct { background: #da3633; } .trait { background: #d29922; color: #000; } .variable { background: #6e7681; } .enum { background: #8957e5; } .interface { background: #0969da; }
        .lang-badge { background: #21262d; color: var(--text-muted); border: 1px solid var(--border-color); }
        .visibility-badge { background: #382300; color: #e3b341; border: 1px solid #6e5a1a; }
        .signature { font-family: "JetBrains Mono", "Fira Code", monospace; background: var(--code-bg); padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; margin-bottom: 16px; border: 1px solid var(--border-color); white-space: pre; color: var(--code-text); }
        .description { margin-bottom: 16px; color: var(--text-color); font-size: 16px; }
        .description code { background: var(--code-bg); padding: 2px 4px; border-radius: 4px; font-family: "JetBrains Mono", monospace; font-size: 14px; color: var(--inline-code-color); border: 1px solid var(--border-color); }
        .description .code-block-wrapper { position: relative; margin: 16px 0; }
        .description .code-lang { position: absolute; top: 0; right: 0; padding: 4px 12px; font-size: 10px; text-transform: uppercase; color: var(--text-muted); background: var(--border-color); border-bottom-left-radius: 8px; z-index: 1; }
        .description .code-block { background: var(--code-bg); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); overflow-x: auto; margin: 0; }
        .description .code-block code { background: transparent; padding: 0; color: var(--code-text); font-size: 14px; display: block; white-space: pre; border: none; font-family: "JetBrains Mono", monospace; }
        .params-section { margin: 20px 0; }
        .params-section h4 { margin-bottom: 10px; color: var(--primary-color); font-size: 16px; }
        .params-section table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .params-section th, .params-section td { text-align: left; padding: 8px; border-bottom: 1px solid var(--border-color); }
        .params-section th { color: var(--text-muted); font-weight: 600; }
        .returns-section { margin: 16px 0; padding: 12px; background: var(--sidebar-bg); border-radius: 6px; border-left: 4px solid var(--primary-color); font-size: 14px; }
        .meta { font-size: 13px; color: var(--text-muted); font-family: monospace; }
        h1 { font-size: 36px; margin-bottom: 40px; font-weight: 800; color: #f0f6fc; }
    </style>
</head>
<body>
    <aside>
        <div class="search-box">
            <input type="text" id="search" placeholder="Search API items..." onkeyup="filterNav()">
        </div>
        <nav id="nav">${navHtml}</nav>
    </aside>
    <main>
        <h1>API Reference</h1>
        
        <div class="filter-bar">
            <div class="filter-group">
                <button class="filter-btn active" onclick="setFilter('all', this)">All</button>
                <button class="filter-btn" onclick="setFilter('documented', this)">Documented</button>
                <button class="filter-btn" onclick="setFilter('undocumented', this)">Undocumented</button>
            </div>
            <div class="filter-count" id="entry-count">Showing ${uniqueEntries.length} of ${uniqueEntries.length} entries</div>
        </div>

        ${entriesHtml || '<p>No documentation entries found.</p>'}
    </main>
    <script>
        function filterNav() {
            const query = document.getElementById('search').value.toLowerCase();
            document.querySelectorAll('.nav-item').forEach(item => {
                item.style.display = item.dataset.name.includes(query) ? 'block' : 'none';
            });
        }

        function setFilter(type, btn) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const entries = document.querySelectorAll('.entry');
            let visibleCount = 0;

            entries.forEach(entry => {
                const hasDoc = entry.dataset.hasDoc === 'true';
                let visible = true;
                if (type === 'documented') visible = hasDoc;
                else if (type === 'undocumented') visible = !hasDoc;
                
                entry.style.display = visible ? 'block' : 'none';
                if (visible) visibleCount++;
            });

            document.getElementById('entry-count').innerText = \`Showing \${visibleCount} of \${entries.length} entries\`;
        }
    </script>
</body>
</html>
  `;
}
}

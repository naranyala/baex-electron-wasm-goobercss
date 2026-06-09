import { css } from 'goober';

const styles = {
  container: css`
    padding: 60px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    color: #c9d1d9;
    animation: fadeIn 0.5s ease-out;
  `,
  header: css`
    text-align: center;
    margin-bottom: 48px;
  `,
  title: css`
    font-size: 32px;
    font-weight: 800;
    color: #f0f6fc;
    margin-bottom: 12px;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #fff 0%, #8b949e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  subtitle: css`
    font-size: 16px;
    color: #8b949e;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.5;
  `,
  treeWrapper: css`
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  `,
  treeRoot: css`
    list-style: none;
    padding-left: 0;
  `,
  treeItem: css`
    margin: 2px 0;
    list-style: none;
    position: relative;
  `,
  nodeHeader: css`
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    user-select: none;
    color: #c9d1d9;
    font-size: 14px;
    &:hover { 
      background: #21262d; 
      color: #fff;
      transform: translateX(4px);
    }
  `,
  toggle: css`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #58a6ff;
    transition: transform 0.2s ease;
    &.open { transform: rotate(90deg); }
  `,
  nodeIcon: css`
    font-size: 16px;
    margin-right: 4px;
  `,
  children: css`
    padding-left: 24px;
    margin-top: 2px;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      left: 18px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: #30363d;
    }
  `
};

interface TreeNode {
  id: string;
  label: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
}

interface TreeState {
  expanded: Record<string, boolean>;
  data: TreeNode[];
}

export const TreeViewView = {
  name: 'tree-view',
  initialState: {
    expanded: { '1': true, '1.1': true },
    data: [
      {
        id: '1', label: 'Project Root', type: 'folder', children: [
          {
            id: '1.1', label: 'src', type: 'folder', children: [
              { id: '1.1.1', label: 'main.ts', type: 'file' },
              { id: '1.1.2', label: 'core', type: 'folder', children: [
                { id: '1.1.2.1', label: 'bridge.ts', type: 'file' },
                { id: '1.1.2.2', label: 'reactivity.ts', type: 'file' },
              ]},
            ]
          },
          {
            id: '1.2', label: 'public', type: 'folder', children: [
              { id: '1.2.1', label: 'index.html', type: 'file' },
              { id: '1.2.2', label: 'favicon.ico', type: 'file' },
            ]
          },
          { id: '1.3', label: 'package.json', type: 'file' },
        ]
      }
    ]
  },
  render: (state) => {
    const renderNode = (node: TreeNode): string => {
      const isExpanded = !!state.expanded[node.id];
      const hasChildren = !!node.children && node.children.length > 0;
      const icon = node.type === 'folder' ? '📁' : '📄';

      return `
        <li class="${styles.treeItem}">
          <div class="${styles.nodeHeader}" onclick="this.getRootNode().host.toggleNode('${node.id}')">
            <span class="${styles.toggle} ${isExpanded ? 'open' : ''}">${hasChildren ? '▹' : ''}</span>
            <span class="${styles.nodeIcon}">${icon}</span>
            ${node.label}
          </div>
          ${isExpanded && hasChildren ? `
            <ul class="${styles.children}">
              ${node.children!.map(renderNode).join('')}
            </ul>
          ` : ''}
        </li>
      `;
    };

    return `
      <style>
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        :host { display: block; }
      </style>
      <div class="${styles.container}">
        <div class="${styles.header}">
          <h2 class="${styles.title}">Project Explorer</h2>
          <p class="${styles.subtitle}">A hierarchical visualization of the system's file structure and modules.</p>
        </div>
        <div class="${styles.treeWrapper}">
          <ul class="${styles.treeRoot}">
            ${state.data.map(renderNode).join('')}
          </ul>
        </div>
      </div>
    `;
  },
  mounted: (el, state) => {
    (el as any).toggleNode = (id: string) => {
      el.setState((s: any) => ({
        expanded: { ...s.expanded, [id]: !s.expanded[id] }
      }));
    };
  }
};

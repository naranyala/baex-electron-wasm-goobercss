import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  container: css`
    padding: 60px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    color: ${theme.subtitleColor};
    animation: fadeIn 0.5s ease-out;
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `,
  header: css`
    text-align: center;
    margin-bottom: 48px;
  `,
  title: css`
    font-size: 32px;
    font-weight: 800;
    color: ${theme.titleColor};
    margin-bottom: 12px;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #fff 0%, #8b949e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  subtitle: css`
    font-size: 16px;
    color: ${theme.subtitleColor};
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.5;
  `,
  treeWrapper: css`
    background: ${theme.backgroundColor};
    border: 1px solid ${theme.borderColor};
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
    color: ${theme.textColor};
    font-size: 14px;
    &:hover { 
      background: ${theme.hoverColor}; 
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
    color: ${theme.accentColor};
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
      background: ${theme.borderColor};
    }
  `
};

interface TreeNode {
  id: string;
  label: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
}

export const TreeViewView = defineComponent({
  name: 'tree-view',
  useShadow: false,
  initialState: {
    expanded: { '1': true, '1.1': true } as Record<string, boolean>,
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
    ] as TreeNode[]
  },
  render: (state) => {
    const renderNode = (node: TreeNode): any => {
      const isExpanded = !!(state as any).expanded[node.id];
      const hasChildren = !!node.children && node.children.length > 0;
      const icon = node.type === 'folder' ? '📁' : '📄';

      return html`
        <li class="${styles.treeItem}">
          <div class="${styles.nodeHeader}" data-action="toggle-node" data-id="${node.id}">
            <span class="${styles.toggle} ${isExpanded ? 'open' : ''}">${hasChildren ? '▹' : ''}</span>
            <span class="${styles.nodeIcon}">${icon}</span>
            ${node.label}
          </div>
          ${isExpanded && hasChildren ? html`
            <ul class="${styles.children}">
              ${node.children!.map(renderNode)}
            </ul>
          ` : ''}
        </li>
      `;
    };

    return html`
      <div class="${styles.container}">
        <div class="${styles.header}">
          <h2 class="${styles.title}">Project Explorer</h2>
          <p class="${styles.subtitle}">A hierarchical visualization of the system's file structure and modules.</p>
        </div>
        <div class="${styles.treeWrapper}">
          <ul class="${styles.treeRoot}">
            ${state.data.map(renderNode)}
          </ul>
        </div>
      </div>
    `;
  },
  events: {
    'click [data-action="toggle-node"]': (_e, { setState, target }) => {
      const id = target.getAttribute('data-id');
      if (!id) return;
      
      setState(s => ({
        expanded: { ...(s as any).expanded, [id]: !(s as any).expanded[id] }
      }));
    }
  }
});

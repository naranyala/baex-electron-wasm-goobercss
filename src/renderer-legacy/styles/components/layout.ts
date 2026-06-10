import { css } from 'goober';
import { tokens } from '../tokens';

export const styles = {
  navBar: css `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3.5rem;
    background: ${tokens.bg};
    border-bottom: 1px solid ${tokens.border};
    display: flex;
    align-items: center;
    padding: 0 1.25rem;
    gap: 0.75rem;
    z-index: 100;
    -webkit-app-region: drag;
  `,
  appContainer: css `
    min-height: 100vh;
    background: ${tokens.bg};
    color: ${tokens.text};
    padding-top: 3.5rem;
  `,
  contentWrapper: css `
    width: 100%;
    max-width: 60rem;
    margin: 0 auto;
    padding: 3rem 2rem;
  `,
  statusBar: css `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1.75rem;
    background: ${tokens.bg};
    border-top: 1px solid ${tokens.border};
    color: ${tokens.textDim};
    font-size: 0.6875rem;
    display: flex;
    align-items: center;
    padding: 0 1.25rem;
    z-index: 100;
    cursor: pointer;
    transition: background 0.15s ease;
    &:hover { background: ${tokens.surface}; }
  `,
  statusDot: css `
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: #22c55e;
    margin-right: 0.5rem;
    flex-shrink: 0;
  `,
  statusDivider: css `
    width: 1px;
    height: 0.875rem;
    background: ${tokens.border};
    margin: 0 0.75rem;
  `,
};

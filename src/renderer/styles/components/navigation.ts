import { css } from 'goober';
import { tokens } from '../tokens';

export const brandHome = css `
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${tokens.text};
  letter-spacing: -0.01em;
  padding: 0.35rem 0.75rem 0.35rem 0;
  border-right: 1px solid ${tokens.border};
  user-select: none;
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: all 0.15s ease;
  span { background: ${tokens.accentGradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  &:hover { opacity: 0.8; }
`;

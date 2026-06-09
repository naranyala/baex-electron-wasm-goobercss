import { css } from 'goober';
export const theme = {
    bg: '#0f0f11',
    surface: '#18181b',
    elevated: '#1f1f23',
    border: '#2a2a30',
    borderFocus: '#52525b',
    text: '#f4f4f5',
    textMuted: '#a1a1aa',
    textDim: '#6b6b7b',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    accentGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    radius: '0.625rem',
    radiusLg: '0.875rem',
};
export const navBar = css `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3.5rem;
  background: ${theme.bg};
  border-bottom: 1px solid ${theme.border};
  display: flex;
  align-items: center;
  z-index: 100;
  -webkit-app-region: drag;
`;
export const brandHome = css `
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.text};
  letter-spacing: -0.01em;
  padding: 0 16px;
  height: 100%;
  user-select: none;
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: all 0.15s ease;
  span { background: ${theme.accentGradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  &:hover { opacity: 0.8; }
`;
export const appContainer = css `
  min-height: 100vh;
  background: ${theme.bg};
  color: ${theme.text};
  padding-top: 3.5rem;
`;
export const contentWrapper = css `
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
`;
export const searchBar = css `
  position: relative;
  width: 100%;
  max-width: 24rem;
  margin: 0 auto 2.5rem;
  &::before {
    content: '';
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1rem;
    height: 1rem;
    background: ${theme.textDim};
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E") center/contain no-repeat;
    mask-size: contain;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E") center/contain no-repeat;
    -webkit-mask-size: contain;
    pointer-events: none;
  }
`;
export const searchInput = css `
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.5rem;
  font-size: 0.875rem;
  border-radius: ${theme.radiusLg};
  border: 1px solid ${theme.border};
  background: ${theme.surface};
  color: ${theme.text};
  outline: none;
  transition: all 0.2s ease;
  &::placeholder { color: ${theme.textDim}; }
  &:focus { border-color: ${theme.accent}; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); }
`;
export const sectionHeader = css `
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${theme.textDim};
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, ${theme.border}, transparent);
  }
`;
export const sectionContainer = css `
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radiusLg};
  overflow: hidden;
`;
export const menuGrid = css `
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem;
`;
export const menuItem = css `
  aspect-ratio: 1;
  padding: 1rem;
  background: ${theme.elevated};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${theme.textMuted};
  transition: all 0.15s ease;
  &:hover {
    border-color: ${theme.accent};
    color: ${theme.text};
    background: rgba(99, 102, 241, 0.06);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }
`;
export const statusBar = css `
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.75rem;
  background: ${theme.bg};
  border-top: 1px solid ${theme.border};
  color: ${theme.textDim};
  font-size: 0.6875rem;
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  z-index: 100;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: ${theme.surface}; }
`;
export const statusDot = css `
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: #22c55e;
  margin-right: 0.5rem;
  flex-shrink: 0;
`;
export const statusDivider = css `
  width: 1px;
  height: 0.875rem;
  background: ${theme.border};
  margin: 0 0.75rem;
`;
export const modalBackdrop = css `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.15s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;
export const modalContent = css `
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radiusLg};
  width: 90%;
  max-width: 44rem;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  color: ${theme.text};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.2s ease;
  @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;
export const crudButton = css `
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 0.375rem;
  border: 1px solid ${theme.border};
  background: ${theme.elevated};
  color: ${theme.textMuted};
  transition: all 0.12s ease;
  &:hover { background: ${theme.border}; color: ${theme.text}; }
  &:active { transform: scale(0.97); }
`;
export const addButton = css `
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  cursor: pointer;
  border-radius: ${theme.radius};
  border: none;
  background: ${theme.accentGradient};
  color: white;
  font-weight: 500;
  transition: all 0.15s ease;
  &:hover { box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35); transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;
export const splitPanel = css `
  display: flex;
  gap: 1rem;
  height: calc(100vh - 10rem);
`;
export const tableContainer = css `
  flex: 1;
  overflow: auto;
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius};
  background: ${theme.bg};
`;
export const formPanel = css `
  width: 24rem;
  padding: 1.5rem;
  background: ${theme.elevated};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;
export const formField = css `
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  label { font-size: 0.75rem; color: ${theme.textMuted}; font-weight: 500; }
  input {
    padding: 0.5rem 0.75rem;
    background: ${theme.bg};
    border: 1px solid ${theme.border};
    color: ${theme.text};
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    outline: none;
    transition: border-color 0.15s ease;
    &:focus { border-color: ${theme.accent}; }
  }
`;
export const formActions = css `
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

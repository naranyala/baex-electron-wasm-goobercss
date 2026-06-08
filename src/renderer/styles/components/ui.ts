import { css } from 'goober';
import { tokens } from '../tokens';

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
    background: ${tokens.textDim};
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
  border-radius: ${tokens.radiusLg};
  border: 1px solid ${tokens.border};
  background: ${tokens.surface};
  color: ${tokens.text};
  outline: none;
  transition: all 0.2s ease;
  &::placeholder { color: ${tokens.textDim}; }
  &:focus { border-color: ${tokens.accent}; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); }
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
  color: ${tokens.textDim};
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, ${tokens.border}, transparent);
  }
`;

export const sectionContainer = css `
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusLg};
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
  background: ${tokens.elevated};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${tokens.textMuted};
  transition: all 0.15s ease;
  &:hover {
    border-color: ${tokens.accent};
    color: ${tokens.text};
    background: rgba(99, 102, 241, 0.06);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }
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
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusLg};
  width: 90%;
  max-width: 44rem;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  color: ${tokens.text};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.2s ease;
  @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

export const crudButton = css `
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 0.375rem;
  border: 1px solid ${tokens.border};
  background: ${tokens.elevated};
  color: ${tokens.textMuted};
  transition: all 0.12s ease;
  &:hover { background: ${tokens.border}; color: ${tokens.text}; }
  &:active { transform: scale(0.97); }
`;

export const addButton = css `
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  cursor: pointer;
  border-radius: ${tokens.radius};
  border: none;
  background: ${tokens.accentGradient};
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
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  background: ${tokens.bg};
`;

export const formPanel = css `
  width: 24rem;
  padding: 1.5rem;
  background: ${tokens.elevated};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;

export const formField = css `
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  label { font-size: 0.75rem; color: ${tokens.textMuted}; font-weight: 500; }
  input {
    padding: 0.5rem 0.75rem;
    background: ${tokens.bg};
    border: 1px solid ${tokens.border};
    color: ${tokens.text};
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    outline: none;
    transition: border-color 0.15s ease;
    &:focus { border-color: ${tokens.accent}; }
  }
`;

export const formActions = css `
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

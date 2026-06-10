import { css } from 'goober';

// ─── Design Tokens ─────────────────────────────────────────────
export const t = {
  zinc50: '#fafafa',
  zinc100: '#f4f4f5',
  zinc200: '#e4e4e7',
  zinc300: '#d4d4d8',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  zinc600: '#52525b',
  zinc700: '#3f3f46',
  zinc800: '#27272a',
  zinc800a: 'rgba(39,39,42,0.5)',
  zinc900: '#18181b',
  zinc900a: 'rgba(24,24,27,0.92)',
  zinc950: '#09090b',
  indigo300: '#a5b4fc',
  indigo400: '#818cf8',
  indigo500: '#6366f1',
  indigo600: '#4f46e5',
  indigo600a: 'rgba(79,70,229,0.2)',
  indigo500a: 'rgba(99,102,241,0.15)',
  emerald400: '#34d399',
  emerald600: '#059669',
  red600: '#dc2626',
  white: '#fff',
};

export const theme = {
  background: 'var(--exba-background)',
  foreground: 'var(--exba-foreground)',
  primary: 'var(--exba-primary)',
  secondary: 'var(--exba-secondary)',
  accent: 'var(--exba-accent)',
  border: 'var(--exba-border)',
  muted: 'var(--exba-muted)',
};

export const ease = '0.15s ease';

// ─── Base ──────────────────────────────────────────────────────
const appBody = css`
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  padding-top: 3rem;
  background: ${theme.background};
  color: ${theme.foreground};
  font-family: Inter, system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: dark;
`;

const appContainer = css`
  width: 100%;
  margin: 0;
  padding: 0;
`;
// ─── Layout ────────────────────────────────────────────────────
const layoutShell = css`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${theme.background};
  color: ${theme.foreground};
`;

const menuContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  box-sizing: border-box;
`;

const categoryTitle = css`
  width: 100%;
  max-width: 720px;
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.foreground};
  margin: 2rem auto 1rem auto;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${theme.border};
  text-align: left;
`;

const sidebar = css`
  display: none;
`;

const sidebarHeader = css`
  display: none;
`;

const sidebarSearch = css`
  width: 100%;
  max-width: 720px;
  margin: 0 auto 2rem auto;
  display: flex;
  justify-content: center;
`;

const menuGrid = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  width: 100%;
  max-width: 720px;
  margin: 0 auto 1.5rem auto;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const mainContent = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 0;
  padding-bottom: 2rem;
  overflow-y: auto;
`;

const viewContainer = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const mainScroll = css`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

// ─── Menu Items ────────────────────────────────────────────────
const menuItem = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all ${ease};
  border: 1px solid ${theme.border};
  background: ${theme.muted};
  &:hover {
    background: ${theme.secondary};
    transform: translateY(-2px);
    border-color: ${theme.primary};
  }
`;

const menuItemIcon = css`
  font-size: 1.25rem;
  opacity: 0.7;
  transition: opacity ${ease};
  ${menuItem}:hover & {
    opacity: 1;
  }
`;

const menuItemLabel = css`
  font-size: 0.8125rem;
  color: ${theme.secondary};
  transition: color ${ease};
  ${menuItem}:hover & {
    color: ${theme.foreground};
  }
`;

// ─── Search Input ──────────────────────────────────────────────
const searchInput = css`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid ${theme.border};
  background: ${theme.background};
  color: ${theme.foreground};
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color ${ease};
  &::placeholder {
    color: ${theme.secondary};
  }
  &:focus {
    border-color: ${theme.primary};
  }
`;

// ─── Content Area ──────────────────────────────────────────────
const viewHeading = css`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: ${theme.foreground};
`;

const executionLog = css`
  margin-top: 1rem;
  font-size: 0.875rem;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  color: ${theme.accent};
  opacity: 0.5;
  transition: opacity ${ease};
  min-height: 1.5rem;
`;

const executionLogActive = css`
  opacity: 1;
`;

// ─── Collapsible Sections ──────────────────────────────────────
const sectionCard = css`
  border: 1px solid ${theme.border};
  border-radius: 1rem;
  overflow: hidden;
  background: ${theme.muted};
`;

const sectionHeader = css`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background ${ease};
  &:hover {
    background: ${theme.secondary};
  }
`;

const sectionTitle = css`
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const sectionArrow = css`
  transition: transform 0.2s ease;
  color: ${theme.secondary};
  font-size: 0.75rem;
`;

const sectionBody = css`
  padding: 1.5rem;
  border-top: 1px solid ${theme.border};
`;

const sectionBodyInner = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// ─── Buttons ───────────────────────────────────────────────────
const btn = css`
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-family: inherit;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: ${t.white};
  transition: background ${ease};
`;

const btnIndigo = css`
  background: ${theme.primary};
  &:hover { background: ${theme.primary}; }
`;

const btnEmerald = css`
  background: ${t.emerald600};
  &:hover { background: ${t.emerald400}; }
`;

const btnRed = css`
  background: ${t.red600};
  &:hover { background: #ef4444; }
`;

const btnRow = css`
  display: flex;
  gap: 0.5rem;
`;

// ─── Greeting Panel ────────────────────────────────────────────
const greetingPanel = css`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: ${theme.muted};
  border-bottom: 1px solid ${theme.border};
`;

const greetingBox = css`
  font-size: 0.875rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: ${theme.secondary};
`;

const stateCounter = css`
  font-size: 0.75rem;
  color: ${theme.accent};
`;

// ─── Search (centered variant for view.ts) ─────────────────────
const searchInputLg = css`
  width: 100%;
  max-width: 28rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 0.75rem;
  border: 2px solid ${theme.border};
  background: ${theme.background};
  color: ${theme.foreground};
  font-family: inherit;
  outline: none;
  transition: border-color ${ease};
  &::placeholder {
    color: ${theme.secondary};
  }
  &:focus {
    border-color: ${theme.primary};
  }
`;

const searchCenter = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

// ─── Code Examples ─────────────────────────────────────────────
const codeCard = css`
  margin-bottom: 1rem;
  background: ${theme.muted};
  border-radius: 0.75rem;
  border: 1px solid ${theme.border};
  overflow: hidden;
`;

const codeHeader = css`
  padding: 0.5rem 1rem;
  background: ${theme.border};
  font-size: 0.75rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: ${theme.secondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const codeBody = css`
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: ${theme.accent};
  background: ${theme.background};
`;

// ─── Utilities ─────────────────────────────────────────────────
const hidden = css`
  display: none;
`;

const rotate180 = css`
  transform: rotate(180deg);
`;

// ─── Result Output ─────────────────────────────────────────────
const resultText = css`
  margin-bottom: 0.5rem;
`;

const resultCode = css`
  padding: 0.5rem;
  background: ${theme.background};
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: ${theme.accent};
  font-family: 'SF Mono', 'Fira Code', monospace;
  overflow-x: auto;
`;

export const styles = {
  appBody,
  appContainer,
  layoutShell,
  menuContainer,
  sidebar,
  sidebarHeader,
  sidebarSearch,
  menuGrid,
  mainContent,
  viewContainer,
  mainScroll,
  menuItem,
  menuItemIcon,
  menuItemLabel,
  searchInput,
  viewHeading,
  executionLog,
  executionLogActive,
  sectionCard,
  sectionHeader,
  sectionTitle,
  sectionArrow,
  sectionBody,
  sectionBodyInner,
  btn,
  btnIndigo,
  btnEmerald,
  btnRed,
  btnRow,
  greetingPanel,
  greetingBox,
  stateCounter,
  searchInputLg,
  searchCenter,
  codeCard,
  codeHeader,
  codeBody,
  hidden,
  rotate180,
  resultText,
  resultCode,
  categoryTitle,
};

import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  container: css`
    padding: 60px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 750px;
    margin: 0 auto;
    color: ${theme.subtitleColor};
  `,
  card: css`
    background: #161b22;
    border: 1px solid ${theme.borderColor};
    border-radius: 12px;
    padding: 24px;
    margin-top: 24px;
  `,
  button: css`
    background: ${theme.accentColor};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    margin-right: 10px;
  `,
  input: css`
    background: #0d1117;
    border: 1px solid ${theme.borderColor};
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    width: 100%;
    margin-bottom: 16px;
  `
};

export const NotificationView = defineComponent({
  name: 'notification-view',
  useShadow: false,
  initialState: {
    permission: Notification.permission,
    title: 'Hello from EXBA!',
    body: 'This is a system notification demo.'
  },
  render: (state) => html`
    <div class="${styles.container}">
      <h1>Notification API</h1>
      <p>Display system notifications to the user.</p>
      
      <div class="${styles.card}">
        <p>Permission Status: <strong>${state.permission}</strong></p>
        
        ${state.permission !== 'granted' ? `
          <button class="${styles.button}" data-action="request-permission">Request Permission</button>
        ` : ''}
        
        <div style="margin-top: 20px;">
          <label>Notification Title</label>
          <input type="text" class="${styles.input}" value="${state.title}" data-bind="title" data-action="bind-input" />
          
          <label>Notification Body</label>
          <input type="text" class="${styles.input}" value="${state.body}" data-bind="body" data-action="bind-input" />
          
          <button class="${styles.button}" data-action="show-notification" ${state.permission !== 'granted' ? 'disabled' : ''}>
            Show Notification
          </button>
        </div>
      </div>
    </div>
  `,
  events: {
    'input [data-action="bind-input"]': (e, { setState }) => {
      const target = e.target as HTMLInputElement;
      const key = target.getAttribute('data-bind') as string;
      setState(() => ({ [key]: target.value } as any));
    },
    'click [data-action="request-permission"]': async (_e, { setState }) => {
      const permission = await Notification.requestPermission();
      setState(() => ({ permission }));
    },
    'click [data-action="show-notification"]': (_e, { state }) => {
      if (state.permission === 'granted') {
        new Notification(state.title, {
          body: state.body,
          icon: '/vite.svg'
        });
      }
    }
  }
});

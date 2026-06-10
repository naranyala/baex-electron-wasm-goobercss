import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  container: css`
    padding: 60px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 650px;
    margin: 0 auto;
    color: ${theme.subtitleColor};
  `,
  header: css`
    text-align: center;
    margin-bottom: 48px;
  `,
  title: css`
    font-size: 36px;
    font-weight: 800;
    color: ${theme.textColor};
    margin-bottom: 12px;
    letter-spacing: -0.04em;
    background: ${theme.accentGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  subtitle: css`
    font-size: 16px;
    color: ${theme.subtitleColor};
    max-width: 480px;
    margin: 0 auto;
    line-height: 1.6;
  `,
  progressContainer: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 60px;
    position: relative;
    max-width: 440px;
    margin-left: auto;
    margin-right: auto;
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: ${theme.borderColor};
      z-index: 0;
      transform: translateY(-50%);
    }
  `,
  step: css`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${theme.surface};
    border: 2px solid ${theme.borderColor};
    color: ${theme.subtitleColor};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    z-index: 1;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    &.active {
      border-color: ${theme.accentColor};
      color: ${theme.accentColor};
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
      transform: scale(1.15);
      background: ${theme.bg};
    }
    &.completed {
      background: ${theme.accentColor};
      border-color: ${theme.accentColor};
      color: #fff;
    }
  `,
  card: css`
    background: ${theme.surface};
    backdrop-filter: blur(12px);
    border: 1px solid ${theme.borderColor};
    border-radius: ${theme.radiusLg};
    padding: 48px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
    position: relative;
  `,
  stepHeader: css`
    margin-bottom: 24px;
    text-align: center;
  `,
  stepTitle: css`
    font-size: 20px;
    color: ${theme.textColor};
    margin-bottom: 8px;
  `,
  stepDesc: css`
    font-size: 14px;
    color: ${theme.subtitleColor};
  `,
  field: css`
    margin-bottom: 28px;
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: ${theme.subtitleColor};
      margin-bottom: 10px;
      transition: color 0.2s;
    }
    input, select, textarea {
      width: 100%;
      padding: 14px 18px;
      background: ${theme.bg};
      border: 1px solid ${theme.borderColor};
      border-radius: ${theme.radius};
      color: ${theme.textColor};
      font-size: 15px;
      outline: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
      &:focus {
        border-color: ${theme.accentColor};
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        background: ${theme.surface};
      }
    }
  `,
  footer: css`
    display: flex;
    justify-content: space-between;
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid ${theme.borderColor};
  `,
  btn: css`
    padding: 14px 28px;
    border-radius: ${theme.radius};
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(1);
      transform: none !important;
      box-shadow: none !important;
    }
  `,
  btnPrimary: css`
    background: ${theme.accentGradient};
    color: #fff;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }
    &:active { transform: translateY(0); }
  `,
  btnSecondary: css`
    background: transparent;
    color: ${theme.subtitleColor};
    border: 1px solid ${theme.borderColor};
    &:hover {
      background: ${theme.elevated};
      color: ${theme.textColor};
      border-color: ${theme.borderFocus};
    }
  `,
  reviewCard: css`
    background: ${theme.bg};
    padding: 24px;
    border-radius: ${theme.radius};
    border: 1px solid ${theme.borderColor};
    font-size: 14px;
    line-height: 1.8;
  `,
  reviewRow: css`
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    border-bottom: 1px solid ${theme.elevated};
    padding-bottom: 8px;
  `,
  reviewLabel: css`
    color: ${theme.subtitleColor};
  `,
  reviewValue: css`
    color: ${theme.textColor};
    font-weight: 500;
  `,
  reviewDesc: css`
    margin-top: 16px;
    .reviewLabel { display: block; margin-bottom: 6px; }
    .reviewValue { font-style: italic; }
  `
};

export const FormWizardView = defineComponent({
  name: 'form-wizard-view',
  useShadow: false,
  initialState: {
    step: 0,
    formData: {
      name: '',
      email: '',
      project: '',
      priority: 'Medium',
      description: '',
    },
    isSubmitting: false
  },
  render: (state) => {
    const steps = ['Account', 'Project', 'Review'];
    
    const stepContent = [
      html`
        <div class="${styles.stepHeader}">
          <h3 class="${styles.stepTitle}">Personal Details</h3>
          <p class="${styles.stepDesc}">Let's start with some basic information.</p>
        </div>
        <div class="${styles.field}">
          <label>Full Name</label>
          <input type="text" value="${state.formData.name}" data-action="update-field" data-key="name" placeholder="e.g. Alice Johnson">
        </div>
        <div class="${styles.field}">
          <label>Email Address</label>
          <input type="email" value="${state.formData.email}" data-action="update-field" data-key="email" placeholder="alice@example.com">
        </div>
      `,
      html`
        <div class="${styles.stepHeader}">
          <h3 class="${styles.stepTitle}">Project Setup</h3>
          <p class="${styles.stepDesc}">Tell us more about what you're building.</p>
        </div>
        <div class="${styles.field}">
          <label>Project Name</label>
          <input type="text" value="${state.formData.project}" data-action="update-field" data-key="project" placeholder="e.g. Quantum Leap">
        </div>
        <div class="${styles.field}">
          <label>Priority</label>
          <select data-action="update-field" data-key="priority">
            <option value="Low" ${state.formData.priority === 'Low' ? 'selected' : ''}>Low</option>
            <option value="Medium" ${state.formData.priority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="High" ${state.formData.priority === 'High' ? 'selected' : ''}>High</option>
          </select>
        </div>
        <div class="${styles.field}">
          <label>Description</label>
          <textarea rows="3" data-action="update-field" data-key="description" placeholder="Tell us more about your project...">${state.formData.description}</textarea>
        </div>
      `,
      html`
        <div class="${styles.stepHeader}">
          <h3 class="${styles.stepTitle}">Confirm Details</h3>
          <p class="${styles.stepDesc}">Please verify your information before submitting.</p>
        </div>
        <div class="${styles.reviewCard}">
          <div class="${styles.reviewRow}">
            <span class="${styles.reviewLabel}">Name</span>
            <span class="${styles.reviewValue}">${state.formData.name || 'Not provided'}</span>
          </div>
          <div class="${styles.reviewRow}">
            <span class="${styles.reviewLabel}">Email</span>
            <span class="${styles.reviewValue}">${state.formData.email || 'Not provided'}</span>
          </div>
          <div class="${styles.reviewRow}">
            <span class="${styles.reviewLabel}">Project</span>
            <span class="${styles.reviewValue}">${state.formData.project || 'Not provided'}</span>
          </div>
          <div class="${styles.reviewRow}">
            <span class="${styles.reviewLabel}">Priority</span>
            <span class="${styles.reviewValue}">${state.formData.priority}</span>
          </div>
          <div class="${styles.reviewDesc}">
            <span class="${styles.reviewLabel}">Description</span>
            <span class="${styles.reviewValue}">${state.formData.description || 'No description provided.'}</span>
          </div>
        </div>
      `
    ];

    return html`
      <div class="${styles.container}">
        <div class="${styles.header}">
          <h2 class="${styles.title}">Setup Workspace</h2>
          <p class="${styles.subtitle}">Customize your experience in a few simple steps.</p>
        </div>
        <div class="${styles.progressContainer}">
          ${steps.map((label, idx) => html`
            <div class="${styles.step} ${state.step === idx ? 'active' : ''} ${state.step > idx ? 'completed' : ''}" title="${label}">
              ${state.step > idx ? '✓' : idx + 1}
            </div>
          `)}
        </div>
        <div class="${styles.card}">
          ${stepContent[state.step]}
          <div class="${styles.footer}">
            <button class="${styles.btn} ${styles.btnSecondary}" data-action="prev-step" ${state.step === 0 ? 'disabled' : ''}>
              Back
            </button>
            <button class="${styles.btn} ${styles.btnPrimary}" data-action="next-step" ${state.isSubmitting ? 'disabled' : ''}>
              ${state.isSubmitting ? 'Submitting...' : (state.step === steps.length - 1 ? 'Complete' : 'Continue')}
            </button>
          </div>
        </div>
      </div>
    `;
  },
  events: {
    'input [data-action="update-field"]': (_, { setState, target }) => {
      const el = target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const key = el.dataset.key;
      if (key) {
        setState(s => ({ formData: { ...s.formData, [key]: el.value } }));
      }
    },
    'click [data-action="prev-step"]': (_e, { state, setState }) => {
      if (state.step > 0) {
        setState(s => ({ step: s.step - 1 }));
      }
    },
    'click [data-action="next-step"]': async (_e, { state, setState }) => {
      if (state.step < 2) {
        setState(s => ({ step: s.step + 1 }));
      } else {
        setState(() => ({ isSubmitting: true }));
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert('Your workspace has been successfully created!');
        setState(() => ({
          isSubmitting: false,
          step: 0
        }));
      }
    }
  }
});

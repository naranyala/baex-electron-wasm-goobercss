import { css } from 'goober';

const styles = {
  container: css`
    padding: 60px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 650px;
    margin: 0 auto;
    color: #c9d1d9;
    animation: fadeIn 0.6s ease-out;
  `,
  header: css`
    text-align: center;
    margin-bottom: 48px;
  `,
  title: css`
    font-size: 36px;
    font-weight: 800;
    color: #f0f6fc;
    margin-bottom: 12px;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #fff 0%, #58a6ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  subtitle: css`
    font-size: 16px;
    color: #8b949e;
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
    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: #30363d;
      z-index: 0;
      transform: translateY(-50%);
    }
  `,
  step: css`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #161b22;
    border: 2px solid #30363d;
    color: #8b949e;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    z-index: 1;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    &.active {
      border-color: #58a6ff;
      color: #58a6ff;
      box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.2);
      transform: scale(1.15);
      background: #0d1117;
    }
    &.completed {
      background: #58a6ff;
      border-color: #58a6ff;
      color: #fff;
    }
  `,
  card: css`
    background: rgba(22, 23, 30, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid #30363d;
    border-radius: 32px;
    padding: 48px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
    animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
  `,
  field: css`
    margin-bottom: 28px;
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #8b949e;
      margin-bottom: 10px;
      transition: color 0.2s;
    }
    input, select, textarea {
      width: 100%;
      padding: 14px 18px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 14px;
      color: #f0f6fc;
      font-size: 15px;
      outline: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      &:focus { 
        border-color: #58a6ff; 
        box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.1);
        background: #161b22;
      }
    }
  `,
  footer: css`
    display: flex;
    justify-content: space-between;
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid #30363d;
  `,
  btn: css`
    padding: 14px 28px;
    border-radius: 14px;
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
    background: linear-gradient(135deg, #58a6ff 0%, #3b82f6 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(88, 166, 255, 0.3);
    &:hover { 
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(88, 166, 255, 0.4);
    }
    &:active { transform: translateY(0); }
  `,
  btnSecondary: css`
    background: transparent;
    color: #8b949e;
    border: 1px solid #30363d;
    &:hover { 
      background: #21262d; 
      color: #f0f6fc;
      border-color: #484f58;
    }
  `
};

interface WizardState {
  step: number;
  formData: {
    name: string;
    email: string;
    project: string;
    priority: string;
    description: string;
  };
  isSubmitting: boolean;
}

export const FormWizardView = {
  name: 'form-wizard-view',
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
      `
        <div style="margin-bottom: 24px; text-align: center;">
          <h3 style="font-size: 20px; color: #f0f6fc; margin-bottom: 8px;">Personal Details</h3>
          <p style="font-size: 14px; color: #8b949e;">Let's start with some basic information.</p>
        </div>
        <div class="${styles.field}">
          <label>Full Name</label>
          <input type="text" defaultValue="${state.formData.name}" oninput="this.getRootNode().host.updateField('name', this.value)" placeholder="e.g. Alice Johnson">
        </div>
        <div class="${styles.field}">
          <label>Email Address</label>
          <input type="email" defaultValue="${state.formData.email}" oninput="this.getRootNode().host.updateField('email', this.value)" placeholder="alice@example.com">
        </div>
      `,
      `
        <div style="margin-bottom: 24px; text-align: center;">
          <h3 style="font-size: 20px; color: #f0f6fc; margin-bottom: 8px;">Project Setup</h3>
          <p style="font-size: 14px; color: #8b949e;">Tell us more about what you're building.</p>
        </div>
        <div class="${styles.field}">
          <label>Project Name</label>
          <input type="text" defaultValue="${state.formData.project}" oninput="this.getRootNode().host.updateField('project', this.value)" placeholder="e.g. Quantum Leap">
        </div>
        <div class="${styles.field}">
          <label>Priority</label>
          <select onchange="this.getRootNode().host.updateField('priority', this.value)">
            <option value="Low" ${state.formData.priority === 'Low' ? 'selected' : ''}>Low</option>
            <option value="Medium" ${state.formData.priority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="High" ${state.formData.priority === 'High' ? 'selected' : ''}>High</option>
          </select>
        </div>
        <div class="${styles.field}">
          <label>Description</label>
          <textarea rows="3" defaultValue="${state.formData.description}" oninput="this.getRootNode().host.updateField('description', this.value)" placeholder="Tell us more about your project...">${state.formData.description}</textarea>
        </div>
      `,
      `
        <div style="margin-bottom: 24px; text-align: center;">
          <h3 style="font-size: 20px; color: #f0f6fc; margin-bottom: 8px;">Confirm Details</h3>
          <p style="font-size: 14px; color: #8b949e;">Please verify your information before submitting.</p>
        </div>
        <div style="background: #0d1117; padding: 24px; border-radius: 20px; border: 1px solid #30363d; font-size: 14px; line-height: 1.8;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #21262d; padding-bottom: 8px;">
            <span style="color: #8b949e;">Name</span> <span style="color: #f0f6fc; font-weight: 500;">${state.formData.name || 'Not provided'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #21262d; padding-bottom: 8px;">
            <span style="color: #8b949e;">Email</span> <span style="color: #f0f6fc; font-weight: 500;">${state.formData.email || 'Not provided'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #21262d; padding-bottom: 8px;">
            <span style="color: #8b949e;">Project</span> <span style="color: #f0f6fc; font-weight: 500;">${state.formData.project || 'Not provided'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #21262d; padding-bottom: 8px;">
            <span style="color: #8b949e;">Priority</span> <span style="color: #f0f6fc; font-weight: 500;">${state.formData.priority}</span>
          </div>
          <div style="margin-top: 16px;">
            <span style="color: #8b949e; display: block; margin-bottom: 6px;">Description</span>
            <span style="color: #f0f6fc; font-style: italic;">${state.formData.description || 'No description provided.'}</span>
          </div>
        </div>
      `
    ];

    return `
      <style>
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        :host { display: block; }
      </style>
      <div class="${styles.container}">
        <div class="${styles.header}">
          <h2 class="${styles.title}">Setup Workspace</h2>
          <p class="${styles.subtitle}">Customize your experience in a few simple steps.</p>
        </div>
        <div class="${styles.progressContainer}">
          ${steps.map((label, idx) => `
            <div class="${styles.step} ${state.step === idx ? 'active' : ''} ${state.step > idx ? 'completed' : ''}" title="${label}">
              ${state.step > idx ? '✓' : idx + 1}
            </div>
          `).join('')}
        </div>
        <div class="${styles.card}">
          ${stepContent[state.step]}
          <div class="${styles.footer}">
            <button class="${styles.btn} ${styles.btnSecondary}" onclick="this.getRootNode().host.prevStep()" ${state.step === 0 ? 'disabled' : ''}>
              Back
            </button>
            <button class="${styles.btn} ${styles.btnPrimary}" onclick="this.getRootNode().host.nextStep()" ${state.isSubmitting ? 'disabled' : ''}>
              ${state.isSubmitting ? 'Submitting...' : (state.step === steps.length - 1 ? 'Complete' : 'Continue')}
            </button>
          </div>
        </div>
      </div>
    `;
  },
  mounted: (el, state) => {
    (el as any)._draftData = { ...state.formData };

    (el as any).updateField = (field: string, value: string) => {
      (el as any)._draftData[field] = value;
    };
    (el as any).nextStep = async () => {
      if (state.step < 2) {
        el.setState((s: any) => ({
          step: s.step + 1,
          formData: { ...(el as any)._draftData }
        }));
      } else {
        el.setState(() => ({ isSubmitting: true }));
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert('✨ Your workspace has been successfully created!');
        el.setState(() => ({
          isSubmitting: false,
          step: 0,
          formData: { ...(el as any)._draftData }
        }));
      }
    };
    (el as any).prevStep = () => {
      if (state.step > 0) {
        el.setState((s: any) => ({
          step: s.step - 1,
          formData: { ...(el as any)._draftData }
        }));
      }
    };
  }
};

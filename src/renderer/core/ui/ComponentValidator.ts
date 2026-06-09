import { ComponentDefinition } from '../bridge/types.js';

export interface ValidationIssue {
  level: 'ERROR' | 'WARNING';
  message: string;
  rule: string;
}

export class ComponentValidator {
  /**
   * Validates a component definition against the EXBA Unified Component Contract.
   * @throws Error if a critical rule is violated.
   */
  static validate(definition: ComponentDefinition<any>) {
    const issues: ValidationIssue[] = [];

    // 1. Critical: Required Fields
    if (!definition.name) {
      issues.push({ level: 'ERROR', rule: 'REQUIRED_FIELDS', message: 'Component "name" is missing.' });
    }
    if (definition.initialState === undefined) {
      issues.push({ level: 'ERROR', rule: 'REQUIRED_FIELDS', message: 'Component "initialState" is missing.' });
    }
    if (!definition.render) {
      issues.push({ level: 'ERROR', rule: 'REQUIRED_FIELDS', message: 'Component "render" function is missing.' });
    }

    // 2. Critical: Custom Element Naming
    if (definition.name && !/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(definition.name)) {
      issues.push({ 
        level: 'ERROR', 
        rule: 'NAMING_CONVENTION', 
        message: `Component name "${definition.name}" must be kebab-case and contain at least one hyphen (Custom Element spec).` 
      });
    }

    // 3. Warning: Rendering approach
    // We check if render is a function (it's typed, but we check at runtime)
    if (typeof definition.render !== 'function') {
      issues.push({ level: 'ERROR', rule: 'RENDER_TYPE', message: 'The "render" property must be a function.' });
    }

    // 4. Warning: Event Delegation Pattern
    if (definition.events) {
      for (const selector of Object.keys(definition.events)) {
        if (!selector.includes('[data-action=')) {
          issues.push({ 
            level: 'WARNING', 
            rule: 'EVENT_PATTERN', 
            message: `Event selector "${selector}" does not use [data-action]. Consider using the Unified Event Delegation pattern for better stability.` 
          });
        }
      }
    }

    // 5. Warning: State Management
    if (definition.initialState && Object.keys(definition.initialState).length === 0) {
      issues.push({ 
        level: 'WARNING', 
        rule: 'STATE_EMPTY', 
        message: 'initialState is empty. Ensure you are using rustState for domain data.' 
      });
    }

    if (issues.length > 0) {
      this.report(definition.name || 'UnknownComponent', issues);
    }
  }

  private static report(name: string, issues: ValidationIssue[]) {
    console.group(`%c[EXBA Validator] Component: ${name}`, 'color: #6366f1; font-weight: bold; font-size: 12px;');
    
    issues.forEach(issue => {
      const color = issue.level === 'ERROR' ? 'color: #ef4444;' : 'color: #facc15;';
      const icon = issue.level === 'ERROR' ? '❌' : '⚠️';
      console.log(`%c${icon} [${issue.level}] ${issue.rule}: ${issue.message}`, color);
    });
    
    console.groupEnd();

    // Throw if any ERROR level issues exist
    if (issues.some(i => i.level === 'ERROR')) {
      const critical = issues.filter(i => i.level === 'ERROR').map(i => i.message).join('\\n');
      throw new Error(`[EXBA Critical] Component "${name}" violates the Unified Contract:\\n${critical}`);
    }
  }
}

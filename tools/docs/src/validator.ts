import { DocEntry, ValidationIssue } from './types';

/**
 * Ensures that the documentation entries satisfy the project's strictness rules.
 * Checks for missing descriptions on public items and warns about 
 * extremely short or unhelpful comment blocks.
 */
export class Validator {
  /**
   * Validates an array of documentation entries against quality rules.
   * @param entries The parsed documentation data.
   * @returns An array of validation issues (errors and warnings).
   */
  static validate(entries: DocEntry[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const entry of entries) {
      // Strict Rule: Public items MUST have documentation
      if (entry.isPublic && (!entry.description || entry.description.length < 5)) {
        issues.push({
          file: entry.file,
          line: entry.line,
          name: entry.name,
          message: `Public ${entry.type} '${entry.name}' is missing a proper description.`,
          severity: 'error'
        });
      }
      
      // New Rule: Warn about ANY function/item with empty or extremely short comments
      if (!entry.description || entry.description.length < 5) {
        // If it's already an error (public), we don't need to add a warning
        if (!(entry.isPublic && (!entry.description || entry.description.length < 5))) {
          issues.push({
            file: entry.file,
            line: entry.line,
            name: entry.name,
            message: `${entry.type} '${entry.name}' has an empty or insufficient comment block.`,
            severity: 'warning'
          });
        }
      }

      // Rule: No extremely short descriptions (slightly longer than empty, but still unhelpful)
      if (entry.description && entry.description.length < 15 && entry.description.length >= 5) {
        issues.push({
          file: entry.file,
          line: entry.line,
          name: entry.name,
          message: `Description for '${entry.name}' is too short to be helpful.`,
          severity: 'warning'
        });
      }
    }

    return issues;
  }
}

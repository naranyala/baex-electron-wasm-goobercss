import { HLIRCommand } from './types';

/**
 * Ergonomic Fluent API for building EXBA IR commands.
 */
export const Command = {
  add: (a: number, b: number): HLIRCommand => ({
    type: 'Add',
    payload: { a, b }
  }),
  
  fibonacci: (n: number): HLIRCommand => ({
    type: 'Fibonacci',
    payload: { n }
  }),
  
  factorial: (n: number): HLIRCommand => ({
    type: 'Factorial',
    payload: { n }
  }),
  
  reverse: (text: string): HLIRCommand => ({
    type: 'ReverseString',
    payload: { text }
  }),
  
  isPalindrome: (text: string): HLIRCommand => ({
    type: 'PalindromeCheck',
    payload: { text }
  }),
  
  greet: (name: string): HLIRCommand => ({
    type: 'Greet',
    payload: { name }
  }),
  
  reportAnomaly: (message: string): HLIRCommand => ({
    type: 'ReportAnomaly',
    payload: { message }
  }),
  
  rules: (): HLIRCommand => ({
    type: 'RulesQuery',
    payload: undefined
  }),

  systemFetch: (snapshot: string): HLIRCommand => ({
    type: 'SystemFetch',
    payload: { snapshot }
  })
};

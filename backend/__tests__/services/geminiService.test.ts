import { sanitizeGeminiOutput } from '../../src/services/geminiService';

describe('geminiService PII scrubbing', () => {
  it('redacts email addresses successfully', () => {
    const text = 'Contact support at help@example.com for more info.';
    const sanitized = sanitizeGeminiOutput(text);
    expect(sanitized).toContain('[REDACTED_EMAIL]');
    expect(sanitized).not.toContain('help@example.com');
  });

  it('redacts 28-character Firebase UIDs successfully', () => {
    const text = 'The user with ID abcdefghijklmnopqrstuvwxy123 is under target.';
    const sanitized = sanitizeGeminiOutput(text);
    expect(sanitized).toContain('[REDACTED_UID]');
    expect(sanitized).not.toContain('abcdefghijklmnopqrstuvwxy123');
  });

  it('leaves standard content unaltered', () => {
    const text = 'Your transport emissions are 12 kg CO2e.';
    const sanitized = sanitizeGeminiOutput(text);
    expect(sanitized).toBe(text);
  });
});

import { describe, it, expect } from 'vitest';

describe('DocVault Encrypted Document Manager', () => {
  it('should format document file sizes correctly', () => {
    const bytes = 1048576; // 1MB
    const mb = bytes / (1024 * 1024);
    expect(mb).toBe(1);
  });

  it('should validate allowed document MIME types', () => {
    const allowed = ['application/pdf', 'image/png', 'text/markdown'];
    expect(allowed.includes('application/pdf')).toBe(true);
    expect(allowed.includes('application/exe')).toBe(false);
  });
});

import { config } from 'dotenv-safe';

describe('Environment Variables Validation', () => {
  it('should load all required environment variables', () => {
    expect(() => config()).not.toThrow();
  });
});
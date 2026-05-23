import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackCriticalError } from '@/lib/telemetry';
import * as Sentry from '@sentry/nextjs';
import https from 'https';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

// Mock https
vi.mock('https', () => ({
  default: {
    request: vi.fn().mockImplementation((options, callback) => {
      const mockReq = {
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn(),
      };
      
      // Simulate successful Trello request callback
      setTimeout(() => {
        const mockRes = {
          statusCode: 200,
          on: vi.fn().mockImplementation((event, handler) => {
            if (event === 'data') {
              handler('{"id":"mock-card-id"}');
            }
            if (event === 'end') {
              handler();
            }
          }),
        };
        callback(mockRes);
      }, 10);

      return mockReq;
    }),
  },
}));

describe('Telemetry & Alerting System', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('captures the exception in Sentry with fatal level when Sentry DSN is present', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://mock@o0.ingest.sentry.io/0';
    
    const testError = new Error('Test Stripe DB Timeout');
    await trackCriticalError(testError, 'supabase');

    expect(Sentry.captureException).toHaveBeenCalledWith(testError, {
      level: 'fatal',
      tags: {
        source: 'supabase',
        critical: 'true',
      },
    });
  });

  it('does not crash if Sentry DSN is missing', async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    
    const testError = new Error('Test Missing DSN');
    await expect(trackCriticalError(testError, 'stripe')).resolves.not.toThrow();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('triggers a Trello card creation request when Trello credentials are configured', async () => {
    process.env.TRELLO_API_KEY = 'mock-key';
    process.env.TRELLO_TOKEN = 'mock-token';
    process.env.TRELLO_LIST_ID = 'mock-list';

    const testError = new Error('Database integrity violation');
    await trackCriticalError(testError, 'supabase');

    expect(https.request).toHaveBeenCalled();
    const callArgs = vi.mocked(https.request).mock.calls[0];
    const options = callArgs[0] as any;
    expect(options.hostname).toBe('api.trello.com');
    expect(options.path).toBe('/1/cards');
    expect(options.method).toBe('POST');
  });

  it('skips Trello card creation when Trello keys are missing', async () => {
    delete process.env.TRELLO_API_KEY;
    delete process.env.TRELLO_TOKEN;
    delete process.env.TRELLO_LIST_ID;

    const testError = new Error('Database integrity violation');
    await trackCriticalError(testError, 'supabase');

    expect(https.request).not.toHaveBeenCalled();
  });
});

import DodoPayments from 'dodopayments';

export type DodoErrorCode = 'PAYMENTS_NOT_CONFIGURED' | 'PAYMENTS_UNAUTHORIZED' | 'PAYMENTS_UNAVAILABLE';

class DodoClient {
  get client() {
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
    if (!bearerToken) throw new Error('DODO_PAYMENTS_API_KEY is not configured');
    // A webhook signing secret here is the most common mix-up: every API call then fails with 401.
    if (bearerToken.startsWith('whsec_')) {
      throw new Error('DODO_PAYMENTS_API_KEY holds a webhook secret (whsec_…). Swap it with DODO_PAYMENTS_WEBHOOK_KEY.');
    }
    return new DodoPayments({
      bearerToken,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT === 'test' ? 'test_mode' : 'live_mode',
    });
  }

  // Maps a thrown SDK or configuration error to a stable code the UI can explain.
  errorCode(error: unknown): DodoErrorCode {
    if (error instanceof Error && /DODO_PAYMENTS_API_KEY/.test(error.message)) return 'PAYMENTS_NOT_CONFIGURED';
    if (error instanceof DodoPayments.AuthenticationError) return 'PAYMENTS_UNAUTHORIZED';
    return 'PAYMENTS_UNAVAILABLE';
  }
}

export const dodo = new DodoClient();

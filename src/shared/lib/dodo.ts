import DodoPayments from 'dodopayments';

class DodoClient {
  get client() {
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
    if (!bearerToken) throw new Error('DODO_PAYMENTS_API_KEY is not configured');
    return new DodoPayments({
      bearerToken,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT === 'test' ? 'test_mode' : 'live_mode',
    });
  }
}

export const dodo = new DodoClient();

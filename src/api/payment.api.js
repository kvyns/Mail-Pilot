/**
 * Payment API - Handles Stripe payment sessions
 * Uses separate payment service (nfmv69lv4j.execute-api.eu-west-2.amazonaws.com)
 *
 * Flow:
 * 1. Save unpaid transaction via upload API (POST /transaction/save)
 * 2. Create Stripe checkout session (POST /stripe/session)
 * 3. Redirect user to session.url (Stripe hosted checkout)
 * 4. On return to /confirmation?id={CHECKOUT_SESSION_ID}:
 *    - Retrieve session (POST /stripe/session/retrieve)
 *    - Display success message
 * 5. Webhook (POST /webhook) updates transaction to paid (backend-only)
 */

import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './config';

// Create separate axios instance for payment service
const paymentClient = axios.create({
  baseURL: API_CONFIG.PAYMENT_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// No auth headers required for any payment endpoints (per API spec)

paymentClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[paymentAPI] error response body:', JSON.stringify(error.response?.data, null, 2));
    if (error.response) throw error.response.data;
    throw error;
  }
);

export const paymentAPI = {
  /**
   * Create a Stripe checkout session
   * Spec: { transactionID, accountID, total, package:{title,price,credits,currency,currencySymbol} }
   * No auth header required.
   */
  createSession: (data) => {
    return paymentClient.post(API_ENDPOINTS.STRIPE_SESSION, {
      transactionID: data.transactionID,
      accountID:     data.accountID,
      total:         data.total,
      package:       data.package, // object: { title, price, credits, currency, currencySymbol }
    });
  },

  /**
   * Retrieve a Stripe checkout session after payment return
   * @param {string} checkoutSessionID - The CHECKOUT_SESSION_ID from the URL
   * @returns {Promise} - session details including payment status
   */
  retrieveSession: (checkoutSessionID) => {
    return paymentClient.post(API_ENDPOINTS.STRIPE_SESSION_RETRIEVE, {
      checkoutSessionID,
    });
  },

  /**
   * Stripe webhook endpoint (POST /webhook)
   * NOTE: This is normally called directly by Stripe's servers, not the frontend.
   * Exposed here for completeness / admin/testing use cases.
   * @param {Object} payload - Raw Stripe webhook event payload
   * @returns {Promise}
   */
  webhook: (payload) => {
    return paymentClient.post(API_ENDPOINTS.STRIPE_WEBHOOK, payload);
  },
};

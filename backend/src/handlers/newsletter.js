/**
 * Lambda handler for Newsletter subscriptions
 */

import { putItem, getItem } from '../utils/db.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.js';
import { validateNewsletterSubscription, sanitizeInput } from '../utils/validation.js';
import { sendNewsletterWelcome } from '../utils/email.js';

const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE;

/**
 * POST /newsletter - Handle newsletter subscription
 */
export const handleNewsletter = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Validate input
    const errors = validateNewsletterSubscription(data);
    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    const email = sanitizeInput(data.email).toLowerCase();

    // Check if already subscribed
    const existing = await getItem(NEWSLETTER_TABLE, { email });
    if (existing) {
      if (existing.status === 'active') {
        return successResponse({
          message: 'You are already subscribed to our newsletter!',
        });
      }
    }

    // Create/update subscription
    const subscription = {
      email,
      subscribedAt: Date.now(),
      status: 'active',
      source: data.source || 'website',
      preferences: data.preferences || {},
    };

    await putItem(NEWSLETTER_TABLE, subscription);

    // Send welcome email (async, don't wait)
    sendNewsletterWelcome(email).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return successResponse({
      message: 'Successfully subscribed! Check your email for confirmation.',
      email,
    }, 201);

  } catch (error) {
    console.error('Error handling newsletter subscription:', error);
    return errorResponse('Failed to process subscription. Please try again.', 500, error);
  }
};

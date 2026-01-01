/**
 * Lambda handler for Contact Form submissions
 */

import { v4 as uuidv4 } from 'uuid';
import { putItem } from '../utils/db.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.js';
import { validateContactForm, sanitizeInput } from '../utils/validation.js';
import { sendContactNotification } from '../utils/email.js';

const CONTACTS_TABLE = process.env.CONTACTS_TABLE;

/**
 * POST /contact - Handle contact form submission
 */
export const handleContact = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Validate input
    const errors = validateContactForm(data);
    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Sanitize inputs
    const contactData = {
      id: uuidv4(),
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      phone: data.phone ? sanitizeInput(data.phone) : null,
      company: data.company ? sanitizeInput(data.company) : null,
      message: sanitizeInput(data.message),
      submittedAt: Date.now(),
      status: 'new',
      // TTL: Auto-delete after 90 days (optional)
      ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60),
    };

    // Save to DynamoDB
    await putItem(CONTACTS_TABLE, contactData);

    // Send email notification to admin (async, don't wait)
    sendContactNotification(contactData).catch(err => {
      console.error('Failed to send email notification:', err);
    });

    return successResponse({
      message: 'Thank you for contacting us! We will get back to you soon.',
      submissionId: contactData.id,
    }, 201);

  } catch (error) {
    console.error('Error handling contact submission:', error);
    return errorResponse('Failed to process your request. Please try again.', 500, error);
  }
};

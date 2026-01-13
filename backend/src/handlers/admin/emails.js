/**
 * Lambda handlers for Admin Email Management
 * Uses Resend for sending emails
 */

import { v4 as uuidv4 } from 'uuid';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { getItem, putItem, updateItem, queryTable, scanTable } from '../../utils/db.js';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response.js';
import { sanitizeInput } from '../../utils/validation.js';

const EMAILS_TABLE = process.env.EMAILS_TABLE;
const EMAIL_CONTACTS_TABLE = process.env.EMAIL_CONTACTS_TABLE;
const RESEND_API_KEY_PARAM = process.env.RESEND_API_KEY_PARAM;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'support@philocom.co';
const COMPANY_NAME = 'Philocom';
const COMPANY_WEBSITE = 'https://philocom.co';
const COMPANY_ADDRESS = 'Addis Ababa, Ethiopia';

const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'eu-central-1' });

/**
 * Professional HTML email template - Light gray wrapper with white content
 */
const createEmailTemplate = (content, subject) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Outer wrapper with gray background -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 32px 24px;">
        <!-- Main content card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #e5e7eb;">
              <a href="${COMPANY_WEBSITE}" style="font-size: 24px; font-weight: 700; color: #111827; text-decoration: none;">Philo<span style="color: #0891b2;">com</span></a>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px; color: #374151; font-size: 15px; line-height: 1.7;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #18181b; padding: 32px;">
              <!-- Social Links -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <a href="https://www.facebook.com/share/1NKm444kyR/" style="color: #a1a1aa; text-decoration: none; margin-right: 20px; font-size: 13px;">Facebook</a>
                    <a href="https://twitter.com/philocom_" style="color: #a1a1aa; text-decoration: none; margin-right: 20px; font-size: 13px;">Twitter</a>
                    <a href="https://www.instagram.com/philo__com" style="color: #a1a1aa; text-decoration: none; margin-right: 20px; font-size: 13px;">Instagram</a>
                    <a href="https://linkedin.com/company/philocom" style="color: #a1a1aa; text-decoration: none; font-size: 13px;">LinkedIn</a>
                  </td>
                </tr>
              </table>
              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-bottom: 1px solid #27272a; padding-bottom: 20px;"></td>
                </tr>
              </table>
              <!-- Page Links -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-top: 20px; padding-bottom: 20px;">
                    <a href="${COMPANY_WEBSITE}/about" style="color: #d4d4d8; text-decoration: none; margin-right: 20px; font-size: 12px;">About Us</a>
                    <a href="${COMPANY_WEBSITE}/careers" style="color: #d4d4d8; text-decoration: none; margin-right: 20px; font-size: 12px;">Careers</a>
                    <a href="${COMPANY_WEBSITE}/privacy" style="color: #d4d4d8; text-decoration: none; margin-right: 20px; font-size: 12px;">Privacy Policy</a>
                    <a href="${COMPANY_WEBSITE}/terms" style="color: #d4d4d8; text-decoration: none; font-size: 12px;">Terms of Service</a>
                  </td>
                </tr>
              </table>
              <!-- Address & Copyright -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                      Nile Source Building, 5th Floor, Africa AV / Bole Road, ${COMPANY_ADDRESS}<br>
                      +251 947 447 244
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 11px; color: #52525b;">
                      &copy; ${new Date().getFullYear()} ${COMPANY_NAME} Technology. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

// Cache for Resend API key
let cachedResendApiKey = null;
let cacheExpiry = 0;

/**
 * Get Resend API key from SSM Parameter Store (with caching)
 */
const getResendApiKey = async () => {
  const now = Date.now();
  if (cachedResendApiKey && now < cacheExpiry) {
    return cachedResendApiKey;
  }

  const command = new GetParameterCommand({
    Name: RESEND_API_KEY_PARAM,
    WithDecryption: true,
  });

  const response = await ssmClient.send(command);
  cachedResendApiKey = response.Parameter.Value;
  cacheExpiry = now + (5 * 60 * 1000); // Cache for 5 minutes
  return cachedResendApiKey;
};

/**
 * Send email via Resend API
 */
const sendViaResend = async (emailData) => {
  const apiKey = await getResendApiKey();

  // Wrap content in professional email template
  const htmlContent = createEmailTemplate(emailData.body, emailData.subject);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Philocom <${SENDER_EMAIL}>`,
      to: emailData.to,
      cc: emailData.cc || [],
      subject: emailData.subject,
      html: htmlContent,
      text: emailData.bodyText || stripHtml(emailData.body),
      reply_to: SENDER_EMAIL,
      headers: emailData.inReplyTo ? {
        'In-Reply-To': emailData.inReplyTo,
        'References': emailData.inReplyTo,
      } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${error.message || response.statusText}`);
  }

  return response.json();
};

/**
 * Strip HTML tags for plain text version
 */
const stripHtml = (html) => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

/**
 * Generate thread ID from subject (for grouping conversations)
 */
const generateThreadId = (subject, inReplyTo = null) => {
  if (inReplyTo) {
    return inReplyTo; // Use existing thread
  }
  // Normalize subject for threading
  const normalizedSubject = subject
    .replace(/^(re:|fwd:|fw:)\s*/gi, '')
    .toLowerCase()
    .trim();
  return `thread_${Buffer.from(normalizedSubject).toString('base64').slice(0, 32)}`;
};

// Admin email addresses - only emails from/to these addresses are shown in admin panel
const ADMIN_EMAIL_ADDRESSES = ['info@philocom.co', 'support@philocom.co', 'admin@philocom.co', 'noreply@philocom.co'];

// Employee email domain - emails to @philocom.co addresses may need direct delivery
const EMPLOYEE_EMAIL_DOMAIN = '@philocom.co';

/**
 * GET /admin/emails - Get all emails (inbox view)
 * Query params: direction=inbound|outbound, limit, lastKey
 *
 * For admin panel:
 * - Inbox (inbound): Shows emails where ownerEmail is null (not employee-specific)
 *   or where recipient is one of the admin emails
 * - Sent (outbound): Shows only emails sent FROM admin email addresses
 */
export const getEmails = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const direction = queryParams.direction || 'inbound';
    const limit = parseInt(queryParams.limit) || 50;

    // Use QueryCommand directly for index query
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, QueryCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
    const docClient = DynamoDBDocumentClient.from(client);

    // Query by direction using GSI
    const params = {
      TableName: EMAILS_TABLE,
      IndexName: 'DirectionIndex',
      KeyConditionExpression: 'direction = :direction',
      ExpressionAttributeValues: {
        ':direction': direction,
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit * 3, // Fetch more to account for filtering
    };

    const command = new QueryCommand(params);
    const response = await docClient.send(command);

    let filteredEmails = response.Items || [];

    if (direction === 'inbound') {
      // For inbox: ONLY show emails where ownerEmail is '__admin__'
      // Employee emails have their own ownerEmail and should not appear here
      filteredEmails = filteredEmails.filter(email => {
        return email.ownerEmail === '__admin__';
      });
    } else if (direction === 'outbound') {
      // For sent: ONLY show emails where ownerEmail is '__admin__' or not set (legacy)
      // This excludes employee sent emails which have ownerEmail = employee's email
      filteredEmails = filteredEmails.filter(email => {
        return email.ownerEmail === '__admin__' || !email.ownerEmail;
      });
    }

    // Limit to requested count after filtering
    filteredEmails = filteredEmails.slice(0, limit);

    return successResponse({
      emails: filteredEmails,
      count: filteredEmails.length,
      lastKey: response.LastEvaluatedKey,
    });

  } catch (error) {
    console.error('Error fetching emails:', error);
    return errorResponse('Failed to fetch emails', 500, error);
  }
};

/**
 * GET /admin/emails/{id} - Get single email by ID
 */
export const getEmail = async (event) => {
  try {
    const emailId = event.pathParameters?.id;

    if (!emailId) {
      return validationErrorResponse(['Email ID is required']);
    }

    const email = await getItem(EMAILS_TABLE, { id: emailId });

    if (!email) {
      return errorResponse('Email not found', 404);
    }

    // Mark as read if unread
    if (!email.isRead) {
      await updateItem(EMAILS_TABLE, { id: emailId }, { isRead: true });
      email.isRead = true;
    }

    // Get thread emails if this is part of a thread
    let threadEmails = [];
    if (email.threadId) {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, QueryCommand } = await import('@aws-sdk/lib-dynamodb');

      const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
      const docClient = DynamoDBDocumentClient.from(client);

      const command = new QueryCommand({
        TableName: EMAILS_TABLE,
        IndexName: 'ThreadIndex',
        KeyConditionExpression: 'threadId = :threadId',
        ExpressionAttributeValues: {
          ':threadId': email.threadId,
        },
        ScanIndexForward: true, // Oldest first for thread view
      });

      const response = await docClient.send(command);
      threadEmails = response.Items || [];
    }

    return successResponse({
      email,
      thread: threadEmails,
    });

  } catch (error) {
    console.error('Error fetching email:', error);
    return errorResponse('Failed to fetch email', 500, error);
  }
};

/**
 * POST /admin/emails/send - Send an email via Resend
 */
export const sendEmail = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Validate required fields
    const errors = [];
    if (!data.to || (Array.isArray(data.to) && data.to.length === 0)) {
      errors.push('Recipient (to) is required');
    }
    if (!data.subject) {
      errors.push('Subject is required');
    }
    if (!data.body) {
      errors.push('Email body is required');
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Normalize recipients to array
    const toRecipients = Array.isArray(data.to) ? data.to : [data.to];
    const ccRecipients = data.cc ? (Array.isArray(data.cc) ? data.cc : [data.cc]) : [];

    // Generate thread ID
    const threadId = generateThreadId(data.subject, data.inReplyTo);

    // Prepare email data
    const emailData = {
      to: toRecipients,
      cc: ccRecipients,
      subject: sanitizeInput(data.subject),
      body: data.body, // HTML content
      bodyText: data.bodyText || stripHtml(data.body),
      inReplyTo: data.inReplyTo || null,
    };

    // Send via Resend
    const resendResponse = await sendViaResend(emailData);

    // Store sent email in DynamoDB (store templated HTML for consistency)
    const templatedBody = createEmailTemplate(emailData.body, emailData.subject);
    const sentEmail = {
      id: uuidv4(),
      threadId,
      direction: 'outbound',
      ownerEmail: '__admin__', // Mark as admin email for proper filtering
      from: { email: SENDER_EMAIL, name: 'Philocom' },
      to: toRecipients.map(email => ({ email, name: email.split('@')[0] })),
      cc: ccRecipients.map(email => ({ email, name: email.split('@')[0] })),
      subject: emailData.subject,
      body: templatedBody,
      bodyText: emailData.bodyText,
      status: 'sent',
      isRead: true,
      isStarred: false,
      labels: [],
      messageId: resendResponse.id,
      inReplyTo: data.inReplyTo || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await putItem(EMAILS_TABLE, sentEmail);

    // Update contact's lastContactedAt
    for (const recipient of toRecipients) {
      try {
        await updateItem(EMAIL_CONTACTS_TABLE, { email: recipient }, {
          lastContactedAt: Date.now(),
        });
      } catch (err) {
        // Contact might not exist yet, create it
        await putItem(EMAIL_CONTACTS_TABLE, {
          email: recipient,
          name: recipient.split('@')[0],
          lastContactedAt: Date.now(),
          createdAt: Date.now(),
        });
      }
    }

    return successResponse({
      message: 'Email sent successfully',
      emailId: sentEmail.id,
      resendId: resendResponse.id,
    }, 201);

  } catch (error) {
    console.error('Error sending email:', error);
    return errorResponse('Failed to send email', 500, error);
  }
};

/**
 * PUT /admin/emails/{id} - Update email (mark read, star, label, etc.)
 */
export const updateEmail = async (event) => {
  try {
    const emailId = event.pathParameters?.id;
    const data = JSON.parse(event.body);

    if (!emailId) {
      return validationErrorResponse(['Email ID is required']);
    }

    // Only allow specific fields to be updated
    const allowedFields = ['isRead', 'isStarred', 'labels', 'status'];
    const updates = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return validationErrorResponse(['No valid fields to update']);
    }

    updates.updatedAt = Date.now();

    const updatedEmail = await updateItem(EMAILS_TABLE, { id: emailId }, updates);

    return successResponse({
      message: 'Email updated successfully',
      email: updatedEmail,
    });

  } catch (error) {
    console.error('Error updating email:', error);
    return errorResponse('Failed to update email', 500, error);
  }
};

/**
 * DELETE /admin/emails/{id} - Delete email (soft delete - move to trash)
 */
export const deleteEmail = async (event) => {
  try {
    const emailId = event.pathParameters?.id;

    if (!emailId) {
      return validationErrorResponse(['Email ID is required']);
    }

    // Soft delete - update status to 'deleted'
    const updatedEmail = await updateItem(EMAILS_TABLE, { id: emailId }, {
      status: 'deleted',
      updatedAt: Date.now(),
    });

    return successResponse({
      message: 'Email deleted successfully',
      email: updatedEmail,
    });

  } catch (error) {
    console.error('Error deleting email:', error);
    return errorResponse('Failed to delete email', 500, error);
  }
};

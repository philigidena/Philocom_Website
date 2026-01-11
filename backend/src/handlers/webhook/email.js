/**
 * Lambda handler for receiving emails from Resend Inbound Webhooks
 * Supports both Resend format and legacy Cloudflare format
 */

import { v4 as uuidv4 } from 'uuid';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { createHmac } from 'crypto';
import { putItem, updateItem, getItem } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const EMAILS_TABLE = process.env.EMAILS_TABLE;
const EMAIL_CONTACTS_TABLE = process.env.EMAIL_CONTACTS_TABLE;
const WEBHOOK_SECRET_PARAM = process.env.WEBHOOK_SECRET_PARAM || '/philocom/webhook-secret';

const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'eu-central-1' });

// Cache for webhook secret
let cachedWebhookSecret = null;
let cacheExpiry = 0;

/**
 * Get webhook secret from SSM Parameter Store (with caching)
 */
const getWebhookSecret = async () => {
  const now = Date.now();
  if (cachedWebhookSecret && now < cacheExpiry) {
    return cachedWebhookSecret;
  }

  try {
    const command = new GetParameterCommand({
      Name: WEBHOOK_SECRET_PARAM,
      WithDecryption: true,
    });

    const response = await ssmClient.send(command);
    cachedWebhookSecret = response.Parameter.Value;
    cacheExpiry = now + (5 * 60 * 1000); // Cache for 5 minutes
    return cachedWebhookSecret;
  } catch (error) {
    console.error('Failed to get webhook secret from SSM:', error);
    return null;
  }
};

/**
 * Verify Resend webhook signature
 */
const verifyResendSignature = (payload, signature, secret) => {
  if (!signature || !secret) return false;

  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature || signature === `sha256=${expectedSignature}`;
};

/**
 * Parse email address from string like "Name <email@domain.com>" or "email@domain.com"
 */
const parseEmailAddress = (emailString) => {
  if (!emailString) return { email: '', name: '' };

  const match = emailString.match(/^(?:(.+?)\s*<)?([^<>]+@[^<>]+)>?$/);
  if (match) {
    return {
      name: match[1]?.trim() || match[2].split('@')[0],
      email: match[2].trim().toLowerCase(),
    };
  }
  return { email: emailString.toLowerCase(), name: emailString.split('@')[0] };
};

/**
 * Parse multiple email addresses from comma-separated string
 */
const parseEmailAddresses = (emailString) => {
  if (!emailString) return [];
  return emailString.split(',').map(e => parseEmailAddress(e.trim()));
};

/**
 * Extract email body from raw email (simplified parser)
 * In production, you might want to use a library like mailparser
 */
const parseRawEmail = (rawEmail) => {
  const result = {
    headers: {},
    bodyHtml: '',
    bodyText: '',
    attachments: [],
  };

  try {
    // Split headers and body
    const headerBodySplit = rawEmail.indexOf('\r\n\r\n');
    if (headerBodySplit === -1) {
      result.bodyText = rawEmail;
      return result;
    }

    const headerSection = rawEmail.substring(0, headerBodySplit);
    const bodySection = rawEmail.substring(headerBodySplit + 4);

    // Parse headers
    const headerLines = headerSection.split('\r\n');
    let currentHeader = '';
    for (const line of headerLines) {
      if (line.startsWith(' ') || line.startsWith('\t')) {
        // Continuation of previous header
        currentHeader += ' ' + line.trim();
      } else {
        if (currentHeader) {
          const colonIndex = currentHeader.indexOf(':');
          if (colonIndex > 0) {
            const name = currentHeader.substring(0, colonIndex).toLowerCase();
            const value = currentHeader.substring(colonIndex + 1).trim();
            result.headers[name] = value;
          }
        }
        currentHeader = line;
      }
    }
    // Don't forget the last header
    if (currentHeader) {
      const colonIndex = currentHeader.indexOf(':');
      if (colonIndex > 0) {
        const name = currentHeader.substring(0, colonIndex).toLowerCase();
        const value = currentHeader.substring(colonIndex + 1).trim();
        result.headers[name] = value;
      }
    }

    // Simple body extraction (doesn't handle MIME multipart properly)
    // For production, use a proper email parser
    const contentType = result.headers['content-type'] || '';

    if (contentType.includes('multipart/')) {
      // Extract boundary
      const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/);
      if (boundaryMatch) {
        const boundary = boundaryMatch[1];
        const parts = bodySection.split('--' + boundary);

        for (const part of parts) {
          if (part.includes('text/plain')) {
            const textStart = part.indexOf('\r\n\r\n');
            if (textStart > 0) {
              result.bodyText = part.substring(textStart + 4).trim();
            }
          } else if (part.includes('text/html')) {
            const htmlStart = part.indexOf('\r\n\r\n');
            if (htmlStart > 0) {
              result.bodyHtml = part.substring(htmlStart + 4).trim();
            }
          }
        }
      }
    } else if (contentType.includes('text/html')) {
      result.bodyHtml = bodySection;
    } else {
      result.bodyText = bodySection;
    }

    // If we only have text, create simple HTML version
    if (!result.bodyHtml && result.bodyText) {
      result.bodyHtml = `<pre>${result.bodyText}</pre>`;
    }

    // If we only have HTML, strip for text version
    if (!result.bodyText && result.bodyHtml) {
      result.bodyText = result.bodyHtml
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .trim();
    }

  } catch (err) {
    console.error('Error parsing raw email:', err);
    result.bodyText = rawEmail;
    result.bodyHtml = `<pre>${rawEmail}</pre>`;
  }

  return result;
};

/**
 * Generate thread ID from subject
 */
const generateThreadId = (subject, inReplyTo = null) => {
  if (inReplyTo) {
    return inReplyTo;
  }
  const normalizedSubject = (subject || '')
    .replace(/^(re:|fwd:|fw:)\s*/gi, '')
    .toLowerCase()
    .trim();
  return `thread_${Buffer.from(normalizedSubject).toString('base64').slice(0, 32)}`;
};

/**
 * POST /webhook/email - Handle incoming email from Resend or legacy sources
 */
export const handleIncoming = async (event) => {
  try {
    const body = event.body;
    const webhookSecret = await getWebhookSecret();

    // Check for Resend signature header
    const resendSignature = event.headers['svix-signature'] || event.headers['Svix-Signature'];
    const legacySecret = event.headers['x-webhook-secret'] || event.headers['X-Webhook-Secret'];

    // Verify authentication
    if (resendSignature) {
      // Resend uses Svix for webhooks - verify signature
      if (webhookSecret && !verifyResendSignature(body, resendSignature, webhookSecret)) {
        console.warn('Invalid Resend webhook signature');
        return errorResponse('Unauthorized', 401);
      }
    } else if (legacySecret) {
      // Legacy webhook secret verification
      if (webhookSecret && legacySecret !== webhookSecret) {
        console.warn('Invalid legacy webhook secret');
        return errorResponse('Unauthorized', 401);
      }
    }

    // Parse incoming data
    const data = JSON.parse(body);

    console.log('Received email webhook:', {
      type: data.type,
      from: data.from || data.data?.from,
      to: data.to || data.data?.to,
      subject: data.subject || data.data?.subject,
    });

    // Handle Resend webhook format
    let emailData;
    if (data.type === 'email.received' && data.data) {
      // Resend inbound email format
      emailData = {
        from: data.data.from,
        to: data.data.to,
        cc: data.data.cc,
        subject: data.data.subject,
        html: data.data.html,
        text: data.data.text,
        messageId: data.data.email_id,
        headers: data.data.headers || {},
      };
    } else {
      // Legacy/direct format
      emailData = data;
    }

    // Parse the raw email if provided
    let parsedEmail = {
      headers: emailData.headers || {},
      bodyHtml: '',
      bodyText: '',
      attachments: [],
    };

    if (emailData.rawEmail) {
      parsedEmail = parseRawEmail(emailData.rawEmail);
    } else {
      // Use provided parsed data
      parsedEmail.bodyHtml = emailData.html || emailData.body || '';
      parsedEmail.bodyText = emailData.text || emailData.bodyText || '';
    }

    // Parse sender and recipients
    const fromParsed = parseEmailAddress(emailData.from);
    const toParsed = parseEmailAddresses(Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to);
    const ccParsed = parseEmailAddresses(Array.isArray(emailData.cc) ? emailData.cc.join(', ') : emailData.cc);

    // Get message ID and in-reply-to from headers
    const messageId = parsedEmail.headers['message-id'] || emailData.messageId || uuidv4();
    const inReplyTo = parsedEmail.headers['in-reply-to'] || emailData.inReplyTo || null;
    const subject = parsedEmail.headers['subject'] || emailData.subject || '(No Subject)';

    // Generate thread ID
    const threadId = generateThreadId(subject, inReplyTo);

    // Create email record
    const emailRecord = {
      id: uuidv4(),
      threadId,
      direction: 'inbound',
      from: fromParsed,
      to: toParsed,
      cc: ccParsed,
      subject: subject,
      body: parsedEmail.bodyHtml || `<pre>${parsedEmail.bodyText}</pre>`,
      bodyText: parsedEmail.bodyText,
      attachments: parsedEmail.attachments,
      status: 'received',
      isRead: false,
      isStarred: false,
      labels: [],
      messageId: messageId,
      inReplyTo: inReplyTo,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Store email in DynamoDB
    await putItem(EMAILS_TABLE, emailRecord);

    // Update or create contact record
    const existingContact = await getItem(EMAIL_CONTACTS_TABLE, { email: fromParsed.email });

    if (existingContact) {
      await updateItem(EMAIL_CONTACTS_TABLE, { email: fromParsed.email }, {
        lastContactedAt: Date.now(),
        name: fromParsed.name || existingContact.name,
      });
    } else {
      await putItem(EMAIL_CONTACTS_TABLE, {
        email: fromParsed.email,
        name: fromParsed.name,
        company: null,
        phone: null,
        notes: '',
        tags: ['inbox'],
        lastContactedAt: Date.now(),
        createdAt: Date.now(),
      });
    }

    console.log('Email stored successfully:', emailRecord.id);

    return successResponse({
      message: 'Email received and stored',
      emailId: emailRecord.id,
    }, 201);

  } catch (error) {
    console.error('Error handling incoming email:', error);
    return errorResponse('Failed to process email', 500, error);
  }
};

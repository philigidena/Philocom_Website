/**
 * Lambda handler for receiving emails from Resend Inbound Webhooks
 * Supports both Resend/Svix format and legacy Cloudflare format
 */

import { v4 as uuidv4 } from 'uuid';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { createHmac, timingSafeEqual } from 'crypto';
import { putItem, updateItem, getItem } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const EMAILS_TABLE = process.env.EMAILS_TABLE;
const EMAIL_CONTACTS_TABLE = process.env.EMAIL_CONTACTS_TABLE;
const EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;
const WEBHOOK_SECRET_PARAM = process.env.WEBHOOK_SECRET_PARAM || '/philocom/webhook-secret';
const RESEND_API_KEY_PARAM = process.env.RESEND_API_KEY_PARAM || '/philocom/resend-api-key';

const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Cache for Resend API key
let cachedResendApiKey = null;
let resendKeyCacheExpiry = 0;

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
 * Get Resend API key from SSM Parameter Store (with caching)
 */
const getResendApiKey = async () => {
  const now = Date.now();
  if (cachedResendApiKey && now < resendKeyCacheExpiry) {
    return cachedResendApiKey;
  }

  try {
    const command = new GetParameterCommand({
      Name: RESEND_API_KEY_PARAM,
      WithDecryption: true,
    });

    const response = await ssmClient.send(command);
    cachedResendApiKey = response.Parameter.Value;
    resendKeyCacheExpiry = now + (5 * 60 * 1000); // Cache for 5 minutes
    return cachedResendApiKey;
  } catch (error) {
    console.error('Failed to get Resend API key from SSM:', error);
    return null;
  }
};

/**
 * Fetch full email content from Resend API
 * Webhooks don't include body - must fetch via /emails/receiving/:id endpoint
 */
const fetchEmailContent = async (emailId) => {
  try {
    const apiKey = await getResendApiKey();
    if (!apiKey) {
      console.warn('No Resend API key available');
      return null;
    }

    // Use the receiving endpoint for inbound emails
    const response = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch email from Resend:', response.status, errorText);
      return null;
    }

    const emailData = await response.json();
    console.log('Fetched email content from Resend:', {
      hasHtml: !!emailData.html,
      hasText: !!emailData.text,
      htmlLength: emailData.html?.length || 0,
      textLength: emailData.text?.length || 0,
    });
    return emailData;
  } catch (error) {
    console.error('Error fetching email content from Resend:', error);
    return null;
  }
};

/**
 * Verify Svix webhook signature (used by Resend)
 * Svix signature format: v1,<base64-signature>
 * Headers: svix-id, svix-timestamp, svix-signature
 */
const verifySvixSignature = (payload, headers, secret) => {
  try {
    const svixId = headers['svix-id'] || headers['Svix-Id'];
    const svixTimestamp = headers['svix-timestamp'] || headers['Svix-Timestamp'];
    const svixSignature = headers['svix-signature'] || headers['Svix-Signature'];

    if (!svixId || !svixTimestamp || !svixSignature || !secret) {
      console.log('Missing Svix headers or secret', { svixId: !!svixId, svixTimestamp: !!svixTimestamp, svixSignature: !!svixSignature, secret: !!secret });
      return false;
    }

    // Check timestamp is within 5 minutes
    const timestamp = parseInt(svixTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      console.warn('Svix timestamp too old or in future', { timestamp, now, diff: now - timestamp });
      return false;
    }

    // Construct the signed payload
    const signedPayload = `${svixId}.${svixTimestamp}.${payload}`;

    // Extract the secret key (remove whsec_ prefix if present)
    const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const secretBytes = Buffer.from(secretKey, 'base64');

    // Calculate expected signature
    const expectedSignature = createHmac('sha256', secretBytes)
      .update(signedPayload)
      .digest('base64');

    // Parse the signature header (can have multiple signatures separated by space)
    const signatures = svixSignature.split(' ');

    for (const sig of signatures) {
      const [version, signatureValue] = sig.split(',');
      if (version === 'v1' && signatureValue) {
        // Compare signatures
        try {
          const sigBuffer = Buffer.from(signatureValue, 'base64');
          const expectedBuffer = Buffer.from(expectedSignature, 'base64');
          if (sigBuffer.length === expectedBuffer.length && timingSafeEqual(sigBuffer, expectedBuffer)) {
            return true;
          }
        } catch (e) {
          // Continue to next signature if comparison fails
        }
      }
    }

    console.warn('Svix signature mismatch', { expectedSignature, receivedSignatures: signatures });
    return false;
  } catch (error) {
    console.error('Error verifying Svix signature:', error);
    return false;
  }
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
 * Find employee by assigned email address
 */
const getEmployeeByEmail = async (email) => {
  if (!email || !EMPLOYEES_TABLE) return null;

  try {
    const command = new QueryCommand({
      TableName: EMPLOYEES_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase(),
      },
    });

    const response = await docClient.send(command);
    return response.Items?.[0] || null;
  } catch (error) {
    console.error('Error fetching employee by email:', error);
    return null;
  }
};

/**
 * Find employees matching any of the given email addresses
 */
const findMatchingEmployees = async (emailAddresses) => {
  const employees = [];

  for (const addr of emailAddresses) {
    const email = typeof addr === 'string' ? addr : addr.email;
    if (email) {
      const employee = await getEmployeeByEmail(email);
      if (employee && employee.status === 'active') {
        employees.push(employee);
      }
    }
  }

  return employees;
};

/**
 * Check if an email with this messageId already exists for a specific owner
 * Used to prevent duplicate emails when webhook is called multiple times
 */
const checkDuplicateByMessageId = async (messageId, ownerEmail) => {
  if (!messageId || !ownerEmail) return false;

  try {
    const command = new ScanCommand({
      TableName: EMAILS_TABLE,
      FilterExpression: 'messageId = :messageId AND ownerEmail = :ownerEmail',
      ExpressionAttributeValues: {
        ':messageId': messageId,
        ':ownerEmail': ownerEmail,
      },
      Limit: 1,
      ConsistentRead: true, // Ensure we see recently created items
    });

    const response = await docClient.send(command);
    return response.Items && response.Items.length > 0;
  } catch (error) {
    console.error('Error checking for duplicate email:', error);
    return false;
  }
};

/**
 * Check if an admin copy exists (either with same messageId or internal-prefixed version)
 * This handles the case where employee sends to admin and we create internal-{id} copy
 */
const checkAdminDuplicate = async (messageId, subject, fromEmail) => {
  if (!subject || !fromEmail) return false;

  try {
    // First check for exact messageId match
    if (messageId) {
      const exactMatch = await checkDuplicateByMessageId(messageId, '__admin__');
      if (exactMatch) {
        console.log('Admin duplicate found by exact messageId:', messageId);
        return true;
      }

      // Check for internal-{messageId} prefix (when employee sends to admin via the app)
      const internalMatch = await checkDuplicateByMessageId(`internal-${messageId}`, '__admin__');
      if (internalMatch) {
        console.log('Admin duplicate found by internal- prefix:', messageId);
        return true;
      }
    }

    // Always check by subject and sender within recent timeframe
    // This catches cases where messageIds don't match
    // Use QueryCommand with OwnerEmailIndex for efficiency (Scan with Limit is unreliable)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const command = new QueryCommand({
      TableName: EMAILS_TABLE,
      IndexName: 'OwnerEmailIndex',
      KeyConditionExpression: 'ownerEmail = :owner',
      FilterExpression: '#subj = :subject AND createdAt > :minTime',
      ExpressionAttributeNames: {
        '#subj': 'subject', // subject is a reserved word in DynamoDB
      },
      ExpressionAttributeValues: {
        ':owner': '__admin__',
        ':subject': subject,
        ':minTime': fiveMinutesAgo,
      },
      ScanIndexForward: false, // Most recent first
      Limit: 50, // Check recent admin emails
      ConsistentRead: false, // GSI doesn't support ConsistentRead, but Query is more reliable
    });

    const response = await docClient.send(command);
    console.log('Duplicate check query result:', { itemCount: response.Items?.length || 0, subject, fromEmail });
    if (response.Items && response.Items.length > 0) {
      const hasDuplicate = response.Items.some(item =>
        item.from?.email?.toLowerCase() === fromEmail.toLowerCase()
      );
      if (hasDuplicate) {
        console.log('Admin duplicate found by subject+sender:', { subject, fromEmail });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking for admin duplicate:', error);
    return false;
  }
};

/**
 * POST /webhook/email - Handle incoming email from Resend or legacy sources
 */
export const handleIncoming = async (event) => {
  try {
    const body = event.body;
    const webhookSecret = await getWebhookSecret();

    // Check for Resend/Svix signature headers
    const hasSvixHeaders = event.headers['svix-signature'] || event.headers['Svix-Signature'];
    const legacySecret = event.headers['x-webhook-secret'] || event.headers['X-Webhook-Secret'];

    console.log('Webhook headers:', {
      hasSvixHeaders: !!hasSvixHeaders,
      hasLegacySecret: !!legacySecret,
      hasWebhookSecret: !!webhookSecret,
    });

    // Verify authentication
    if (hasSvixHeaders) {
      // Resend uses Svix for webhooks - verify signature
      if (webhookSecret && !verifySvixSignature(body, event.headers, webhookSecret)) {
        console.warn('Invalid Svix webhook signature');
        return errorResponse('Unauthorized', 401);
      }
      console.log('Svix signature verified successfully');
    } else if (legacySecret) {
      // Legacy webhook secret verification
      if (webhookSecret && legacySecret !== webhookSecret) {
        console.warn('Invalid legacy webhook secret');
        return errorResponse('Unauthorized', 401);
      }
    } else {
      // No authentication provided - log but allow for testing
      console.log('No webhook authentication provided');
    }

    // Parse incoming data
    const data = JSON.parse(body);

    console.log('Received email webhook:', {
      type: data.type,
      from: data.from || data.data?.from,
      to: data.to || data.data?.to,
      subject: data.subject || data.data?.subject,
    });

    // Log full payload structure for debugging
    if (data.data) {
      console.log('Resend payload data keys:', Object.keys(data.data));
      console.log('Resend payload data:', JSON.stringify(data.data, null, 2).slice(0, 2000));
    }

    // Handle Resend webhook format
    let emailData;
    if (data.type === 'email.received' && data.data) {
      // Resend inbound email format
      // Webhook doesn't include body - fetch from Resend API
      const emailId = data.data.email_id;
      let fullEmail = null;

      if (emailId) {
        console.log('Fetching full email content from Resend API for:', emailId);
        fullEmail = await fetchEmailContent(emailId);
      }

      emailData = {
        from: data.data.from,
        to: data.data.to,
        cc: data.data.cc,
        subject: data.data.subject,
        html: fullEmail?.html || data.data.html || data.data.body || '',
        text: fullEmail?.text || data.data.text || '',
        messageId: emailId || data.data.id,
        headers: data.data.headers || {},
      };
      console.log('Parsed email data:', {
        hasHtml: !!emailData.html,
        htmlLength: emailData.html?.length || 0,
        hasText: !!emailData.text,
        textLength: emailData.text?.length || 0,
        fetchedFromApi: !!fullEmail,
      });
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

    // Find matching employees from recipients (to and cc)
    const allRecipients = [...toParsed, ...ccParsed];
    const matchingEmployees = await findMatchingEmployees(allRecipients);

    console.log('Matching employees found:', matchingEmployees.length);

    // Base email record
    const baseEmailRecord = {
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

    // If there are matching employees, create a separate email record for each
    // This ensures each employee has their own copy in their inbox
    // But first check for duplicates (webhook may be called multiple times)
    let employeeCopiesCreated = 0;
    if (matchingEmployees.length > 0) {
      for (const employee of matchingEmployees) {
        // Check if this email already exists for this employee (by messageId)
        const isDuplicate = await checkDuplicateByMessageId(messageId, employee.email.toLowerCase());
        if (isDuplicate) {
          console.log('Skipping duplicate email for employee:', employee.email, messageId);
          continue;
        }

        const employeeEmailRecord = {
          ...baseEmailRecord,
          id: uuidv4(),
          ownerEmail: employee.email.toLowerCase(),
        };

        await putItem(EMAILS_TABLE, employeeEmailRecord);
        console.log('Email stored for employee:', employee.email, employeeEmailRecord.id);
        employeeCopiesCreated++;
      }
    }

    // Check if sender is an employee - if so, skip admin copy creation
    // because the employee send handler already creates the admin inbox copy
    const senderIsEmployee = await getEmployeeByEmail(fromParsed.email);
    let adminEmailId = null;

    if (senderIsEmployee) {
      console.log('Sender is employee, skipping admin copy (employee handler creates it):', fromParsed.email);
    } else {
      // Check if admin copy already exists (webhook may be called multiple times)
      const adminDuplicateExists = await checkAdminDuplicate(messageId, subject, fromParsed.email);

      if (adminDuplicateExists) {
        console.log('Skipping duplicate admin email for messageId:', messageId);
      } else {
        // Create a master record for admin panel
        // Use special marker value (DynamoDB GSI requires a string value)
        const adminEmailRecord = {
          ...baseEmailRecord,
          id: uuidv4(),
          ownerEmail: '__admin__', // Special marker for admin panel emails
        };

        await putItem(EMAILS_TABLE, adminEmailRecord);
        adminEmailId = adminEmailRecord.id;
      }
    }

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

    console.log('Email processing complete:', { adminEmailId, employeeCopiesCreated, messageId });

    return successResponse({
      message: 'Email received and stored',
      emailId: adminEmailId,
      employeeCopies: employeeCopiesCreated,
      deduplicated: adminDuplicateExists,
    }, 201);

  } catch (error) {
    console.error('Error handling incoming email:', error);
    return errorResponse('Failed to process email', 500, error);
  }
};

/**
 * Lambda handlers for Employee Email Management
 * Employees can only see/send emails from their assigned email address
 */

import { v4 as uuidv4 } from 'uuid';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getItem, putItem, updateItem } from '../../utils/db.js';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response.js';
import { sanitizeInput } from '../../utils/validation.js';
import {
  validateEmployeeAccess,
  getEmployeeFromEvent,
  verifyEmailOwnership,
  isEmployeeActive,
} from '../../utils/employeeAuth.js';

const EMAILS_TABLE = process.env.EMAILS_TABLE;
const EMAIL_CONTACTS_TABLE = process.env.EMAIL_CONTACTS_TABLE;
const RESEND_API_KEY_PARAM = process.env.RESEND_API_KEY_PARAM;
const IMAGES_BUCKET_NAME = process.env.IMAGES_BUCKET_NAME;
const COMPANY_NAME = 'Philocom';
const COMPANY_WEBSITE = 'https://philocom.co';
const COMPANY_ADDRESS = 'Addis Ababa, Ethiopia';

// Admin email addresses - emails to these will also be stored in admin inbox
const ADMIN_EMAIL_ADDRESSES = ['info@philocom.co', 'support@philocom.co', 'admin@philocom.co', 'noreply@philocom.co'];

const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

/**
 * Professional HTML email template
 */
const createEmailTemplate = (content, subject, senderName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 32px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #e5e7eb;">
              <a href="${COMPANY_WEBSITE}" style="font-size: 24px; font-weight: 700; color: #111827; text-decoration: none;">Philo<span style="color: #0891b2;">com</span></a>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; color: #374151; font-size: 15px; line-height: 1.7;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #18181b; padding: 32px;">
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
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-bottom: 1px solid #27272a; padding-bottom: 20px;"></td>
                </tr>
              </table>
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
  cacheExpiry = now + (5 * 60 * 1000);
  return cachedResendApiKey;
};

const sendViaResend = async (emailData, senderEmail, senderName) => {
  const apiKey = await getResendApiKey();
  const htmlContent = createEmailTemplate(emailData.body, emailData.subject, senderName);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${senderName} - Philocom <${senderEmail}>`,
      to: emailData.to,
      cc: emailData.cc || [],
      subject: emailData.subject,
      html: htmlContent,
      text: emailData.bodyText || stripHtml(emailData.body),
      reply_to: senderEmail,
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

const generateThreadId = (subject, inReplyTo = null) => {
  if (inReplyTo) {
    return inReplyTo;
  }
  const normalizedSubject = subject
    .replace(/^(re:|fwd:|fw:)\s*/gi, '')
    .toLowerCase()
    .trim();
  return `thread_${Buffer.from(normalizedSubject).toString('base64').slice(0, 32)}`;
};

/**
 * GET /employee/emails - Get employee's emails only
 * Query params: direction=inbound|outbound, limit
 */
export const getEmails = async (event) => {
  try {
    // Validate employee access
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }

    // Get employee info
    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.email) {
      return errorResponse('Employee not found or email not assigned', 403);
    }

    if (!isEmployeeActive(employee)) {
      return errorResponse('Employee account is not active', 403);
    }

    const queryParams = event.queryStringParameters || {};
    const direction = queryParams.direction; // Optional filter
    const limit = parseInt(queryParams.limit) || 50;

    // Query emails by ownerEmail using OwnerEmailIndex
    const params = {
      TableName: EMAILS_TABLE,
      IndexName: 'OwnerEmailIndex',
      KeyConditionExpression: 'ownerEmail = :email',
      ExpressionAttributeValues: {
        ':email': employee.email.toLowerCase(),
      },
      ScanIndexForward: false,
      Limit: limit,
    };

    // Add direction filter if specified
    if (direction) {
      params.FilterExpression = 'direction = :direction';
      params.ExpressionAttributeValues[':direction'] = direction;
    }

    const command = new QueryCommand(params);
    const response = await docClient.send(command);

    return successResponse({
      emails: response.Items || [],
      count: response.Count,
      lastKey: response.LastEvaluatedKey,
    });

  } catch (error) {
    console.error('Error fetching employee emails:', error);
    return errorResponse('Failed to fetch emails', 500, error);
  }
};

/**
 * GET /employee/emails/{id} - Get single email (with ownership check)
 */
export const getEmail = async (event) => {
  try {
    // Validate employee access
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }

    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.email) {
      return errorResponse('Employee not found', 403);
    }

    const emailId = event.pathParameters?.id;
    if (!emailId) {
      return validationErrorResponse(['Email ID is required']);
    }

    const email = await getItem(EMAILS_TABLE, { id: emailId });
    if (!email) {
      return errorResponse('Email not found', 404);
    }

    // Verify ownership
    if (!verifyEmailOwnership(email, employee.email)) {
      return errorResponse('You do not have access to this email', 403);
    }

    // Mark as read if unread
    if (!email.isRead) {
      await updateItem(EMAILS_TABLE, { id: emailId }, { isRead: true });
      email.isRead = true;
    }

    // Get thread emails (only those belonging to this employee)
    let threadEmails = [];
    if (email.threadId) {
      const threadCommand = new QueryCommand({
        TableName: EMAILS_TABLE,
        IndexName: 'ThreadIndex',
        KeyConditionExpression: 'threadId = :threadId',
        FilterExpression: 'ownerEmail = :email',
        ExpressionAttributeValues: {
          ':threadId': email.threadId,
          ':email': employee.email.toLowerCase(),
        },
        ScanIndexForward: true,
      });

      const threadResponse = await docClient.send(threadCommand);
      threadEmails = threadResponse.Items || [];
    }

    return successResponse({
      email,
      thread: threadEmails,
    });

  } catch (error) {
    console.error('Error fetching employee email:', error);
    return errorResponse('Failed to fetch email', 500, error);
  }
};

/**
 * Fetch attachment content from S3 (for sending via Resend)
 */
const fetchAttachmentContent = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: IMAGES_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const buffer = await streamToBuffer(response.Body);

    return {
      buffer,
      contentType: response.ContentType,
      filename: response.Metadata?.['original-filename'] || key.split('/').pop(),
    };
  } catch (error) {
    console.error('Error fetching attachment from S3:', error);
    throw new Error(`Failed to fetch attachment: ${error.message}`);
  }
};

/**
 * Convert stream to buffer
 */
const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

/**
 * POST /employee/emails/send - Send email (from employee's assigned address only)
 */
export const sendEmail = async (event) => {
  try {
    // Validate employee access
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }

    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.email) {
      return errorResponse('Employee not found', 403);
    }

    if (!isEmployeeActive(employee)) {
      return errorResponse('Employee account is not active', 403);
    }

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

    const toRecipients = Array.isArray(data.to) ? data.to : [data.to];
    const ccRecipients = data.cc ? (Array.isArray(data.cc) ? data.cc : [data.cc]) : [];

    // Validate email format for all recipients
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of toRecipients) {
      if (!emailRegex.test(email)) {
        return validationErrorResponse([`Invalid email address: ${email}`]);
      }
    }
    for (const email of ccRecipients) {
      if (!emailRegex.test(email)) {
        return validationErrorResponse([`Invalid CC email address: ${email}`]);
      }
    }

    const threadId = generateThreadId(data.subject, data.inReplyTo);

    // Process attachments if provided
    const attachments = [];
    const attachmentMetadata = [];
    if (data.attachments && Array.isArray(data.attachments) && data.attachments.length > 0) {
      console.log(`Processing ${data.attachments.length} attachments...`);

      for (const att of data.attachments) {
        try {
          // Fetch attachment content from S3
          const attData = await fetchAttachmentContent(att.key);

          // Convert to base64 for Resend API
          const base64Content = attData.buffer.toString('base64');

          attachments.push({
            filename: att.filename || attData.filename,
            content: base64Content,
            contentType: att.contentType || attData.contentType,
          });

          attachmentMetadata.push({
            id: uuidv4(),
            filename: att.filename || attData.filename,
            contentType: att.contentType || attData.contentType,
            size: att.size || attData.buffer.length,
            key: att.key,
            url: `https://${IMAGES_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${att.key}`,
          });
        } catch (error) {
          console.error(`Error processing attachment: ${att.key}`, error);
          throw new Error(`Failed to process attachment ${att.filename}: ${error.message}`);
        }
      }

      console.log(`Successfully processed ${attachments.length} attachments`);
    }

    const emailData = {
      to: toRecipients,
      cc: ccRecipients,
      subject: sanitizeInput(data.subject),
      body: data.body,
      bodyText: data.bodyText || stripHtml(data.body),
      inReplyTo: data.inReplyTo || null,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Send via Resend using employee's assigned email
    const resendResponse = await sendViaResend(emailData, employee.email, employee.name);

    // Store sent email in DynamoDB
    const templatedBody = createEmailTemplate(emailData.body, emailData.subject, employee.name);
    const sentEmail = {
      id: uuidv4(),
      threadId,
      direction: 'outbound',
      ownerEmail: employee.email.toLowerCase(),
      from: { email: employee.email, name: employee.name },
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
      sentBy: employee.id || employee.email,
      attachments: attachmentMetadata.length > 0 ? attachmentMetadata : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await putItem(EMAILS_TABLE, sentEmail);

    // Check if any recipient is an admin email address
    // If so, also create an inbound copy for the admin panel
    // (Resend may not trigger webhook for internal emails)
    const allRecipients = [...toRecipients, ...ccRecipients];
    const adminRecipients = allRecipients.filter(email =>
      ADMIN_EMAIL_ADDRESSES.includes(email.toLowerCase())
    );

    if (adminRecipients.length > 0) {
      // Create inbound copy for admin panel
      // Use special marker value for admin emails (DynamoDB GSI requires a string value)
      const adminInboundEmail = {
        id: uuidv4(),
        threadId,
        direction: 'inbound',
        ownerEmail: '__admin__', // Special marker for admin panel emails
        from: { email: employee.email, name: employee.name },
        to: toRecipients.map(email => ({ email, name: email.split('@')[0] })),
        cc: ccRecipients.map(email => ({ email, name: email.split('@')[0] })),
        subject: emailData.subject,
        body: templatedBody,
        bodyText: emailData.bodyText,
        status: 'received',
        isRead: false,
        isStarred: false,
        labels: ['internal'],
        messageId: `internal-${resendResponse.id}`,
        inReplyTo: data.inReplyTo || null,
        sentBy: employee.id || employee.email,
        attachments: attachmentMetadata.length > 0 ? attachmentMetadata : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await putItem(EMAILS_TABLE, adminInboundEmail);
      console.log('Created inbound copy for admin panel:', adminInboundEmail.id);
    }

    // Update contact's lastContactedAt
    for (const recipient of toRecipients) {
      try {
        await updateItem(EMAIL_CONTACTS_TABLE, { email: recipient }, {
          lastContactedAt: Date.now(),
        });
      } catch (err) {
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
      adminCopy: adminRecipients.length > 0,
    }, 201);

  } catch (error) {
    console.error('Error sending employee email:', error);
    return errorResponse('Failed to send email', 500, error);
  }
};

/**
 * PUT /employee/emails/{id} - Update email (mark read, star)
 */
export const updateEmail = async (event) => {
  try {
    // Validate employee access
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }

    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.email) {
      return errorResponse('Employee not found', 403);
    }

    const emailId = event.pathParameters?.id;
    const data = JSON.parse(event.body);

    if (!emailId) {
      return validationErrorResponse(['Email ID is required']);
    }

    // Get email and verify ownership
    const email = await getItem(EMAILS_TABLE, { id: emailId });
    if (!email) {
      return errorResponse('Email not found', 404);
    }

    if (!verifyEmailOwnership(email, employee.email)) {
      return errorResponse('You do not have access to this email', 403);
    }

    // Only allow specific fields to be updated
    const allowedFields = ['isRead', 'isStarred'];
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
    console.error('Error updating employee email:', error);
    return errorResponse('Failed to update email', 500, error);
  }
};

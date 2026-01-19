/**
 * Lambda handlers for Email Attachment Management
 * Handles attachment uploads to S3 for email composition
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response.js';

const BUCKET_NAME = process.env.IMAGES_BUCKET_NAME;
const REGION = process.env.AWS_REGION || 'eu-central-1';

const s3Client = new S3Client({ region: REGION });

// Allowed file types for email attachments
const ALLOWED_TYPES = {
  // Documents
  'application/pdf': { ext: 'pdf', maxSize: 10 },
  'application/msword': { ext: 'doc', maxSize: 10 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', maxSize: 10 },
  'application/vnd.ms-excel': { ext: 'xls', maxSize: 10 },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', maxSize: 10 },
  'application/vnd.ms-powerpoint': { ext: 'ppt', maxSize: 10 },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', maxSize: 10 },
  'text/plain': { ext: 'txt', maxSize: 5 },
  'text/csv': { ext: 'csv', maxSize: 10 },

  // Images
  'image/jpeg': { ext: 'jpg', maxSize: 5 },
  'image/png': { ext: 'png', maxSize: 5 },
  'image/gif': { ext: 'gif', maxSize: 5 },
  'image/webp': { ext: 'webp', maxSize: 5 },

  // Archives
  'application/zip': { ext: 'zip', maxSize: 25 },
  'application/x-zip-compressed': { ext: 'zip', maxSize: 25 },
};

const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB total per email

/**
 * Validate file type and size
 */
const validateFile = (contentType, size) => {
  const fileConfig = ALLOWED_TYPES[contentType];

  if (!fileConfig) {
    return {
      valid: false,
      error: `File type not allowed. Supported types: PDF, DOCX, XLSX, PPTX, images, CSV, TXT, ZIP`,
    };
  }

  const maxSize = fileConfig.maxSize * 1024 * 1024; // Convert MB to bytes
  if (size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size for ${contentType}: ${fileConfig.maxSize}MB`,
    };
  }

  return { valid: true, fileConfig };
};

/**
 * Sanitize filename - remove special characters and limit length
 */
const sanitizeFilename = (filename) => {
  // Remove path separators and special characters
  let sanitized = filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

  // Limit length
  if (sanitized.length > 100) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 95 - ext.length);
    sanitized = `${name}.${ext}`;
  }

  return sanitized;
};

/**
 * POST /admin/email-attachments/presigned-url
 * Get a presigned URL for direct upload to S3
 * Request body: { filename: string, contentType: string, size: number, emailId?: string }
 */
export const getPresignedUrl = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Validate required fields
    const errors = [];
    if (!data.filename) {
      errors.push('Filename is required');
    }
    if (!data.contentType) {
      errors.push('Content type is required');
    }
    if (!data.size || data.size <= 0) {
      errors.push('Valid file size is required');
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Validate file type and size
    const validation = validateFile(data.contentType, data.size);
    if (!validation.valid) {
      return validationErrorResponse([validation.error]);
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(data.filename);

    // Generate unique key
    const emailId = data.emailId || 'draft';
    const uniqueId = uuidv4();
    const ext = validation.fileConfig.ext;
    const key = `emails/attachments/${emailId}/${uniqueId}_${sanitizedFilename}`;

    // Generate presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: data.contentType,
      ContentLength: data.size,
      Metadata: {
        'original-filename': sanitizedFilename,
        'uploaded-by': 'email-compose',
      },
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

    // Construct the public URL (for download later)
    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    return successResponse({
      presignedUrl,
      publicUrl,
      key,
      expiresIn: 900,
      metadata: {
        id: uniqueId,
        filename: sanitizedFilename,
        contentType: data.contentType,
        size: data.size,
      },
    });

  } catch (error) {
    console.error('Error generating presigned URL for attachment:', error);
    return errorResponse('Failed to generate upload URL', 500, error);
  }
};

/**
 * POST /admin/email-attachments/upload
 * Direct upload (base64 encoded file)
 * Request body: { file: string (base64), filename: string, contentType: string, emailId?: string }
 */
export const uploadAttachment = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Validate required fields
    const errors = [];
    if (!data.file) {
      errors.push('File data is required');
    }
    if (!data.filename) {
      errors.push('Filename is required');
    }
    if (!data.contentType) {
      errors.push('Content type is required');
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Decode base64 file
    const base64Data = data.file.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file type and size
    const validation = validateFile(data.contentType, buffer.length);
    if (!validation.valid) {
      return validationErrorResponse([validation.error]);
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(data.filename);

    // Generate unique key
    const emailId = data.emailId || 'draft';
    const uniqueId = uuidv4();
    const key = `emails/attachments/${emailId}/${uniqueId}_${sanitizedFilename}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: data.contentType,
      Metadata: {
        'original-filename': sanitizedFilename,
        'uploaded-by': 'email-compose',
      },
    });

    await s3Client.send(command);

    // Construct the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    return successResponse({
      message: 'Attachment uploaded successfully',
      url: publicUrl,
      key,
      metadata: {
        id: uniqueId,
        filename: sanitizedFilename,
        contentType: data.contentType,
        size: buffer.length,
      },
    }, 201);

  } catch (error) {
    console.error('Error uploading attachment:', error);
    return errorResponse('Failed to upload attachment', 500, error);
  }
};

/**
 * GET /admin/email-attachments/{key}
 * Get a presigned URL for downloading an attachment
 * Returns a temporary download URL (1 hour expiry)
 */
export const getDownloadUrl = async (event) => {
  try {
    const key = decodeURIComponent(event.pathParameters?.key || '');

    if (!key) {
      return validationErrorResponse(['Attachment key is required']);
    }

    // Verify the key is for email attachments
    if (!key.startsWith('emails/attachments/')) {
      return errorResponse('Invalid attachment key', 400);
    }

    // Generate presigned URL for download
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    // Extract filename from key
    const filename = key.split('/').pop().replace(/^[^_]+_/, ''); // Remove UUID prefix

    return successResponse({
      downloadUrl,
      filename,
      expiresIn: 3600,
    });

  } catch (error) {
    console.error('Error generating download URL:', error);
    return errorResponse('Failed to generate download URL', 500, error);
  }
};

/**
 * DELETE /admin/email-attachments/{key}
 * Delete an attachment from S3
 * Path parameter: key (URL encoded S3 key)
 */
export const deleteAttachment = async (event) => {
  try {
    const key = decodeURIComponent(event.pathParameters?.key || '');

    if (!key) {
      return validationErrorResponse(['Attachment key is required']);
    }

    // Verify the key is for email attachments
    if (!key.startsWith('emails/attachments/')) {
      return errorResponse('Invalid attachment key', 400);
    }

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return successResponse({
      message: 'Attachment deleted successfully',
      key,
    });

  } catch (error) {
    console.error('Error deleting attachment:', error);
    return errorResponse('Failed to delete attachment', 500, error);
  }
};

/**
 * Fetch attachment content from S3 (for sending via Resend)
 * Used internally by email send handler
 */
export const fetchAttachmentContent = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return {
      buffer,
      contentType: response.ContentType,
      size: response.ContentLength,
      filename: response.Metadata?.['original-filename'] || key.split('/').pop(),
    };

  } catch (error) {
    console.error('Error fetching attachment from S3:', error);
    throw new Error(`Failed to fetch attachment: ${error.message}`);
  }
};

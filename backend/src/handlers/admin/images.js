/**
 * Lambda handlers for Admin Image Management
 * Handles image uploads to S3 for blog posts and other content
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response.js';

const BUCKET_NAME = process.env.IMAGES_BUCKET_NAME;
const REGION = process.env.AWS_REGION || 'eu-central-1';

const s3Client = new S3Client({ region: REGION });

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /admin/images/presigned-url - Get a presigned URL for direct upload
 * Request body: { filename: string, contentType: string, folder?: string }
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

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Validate content type
    if (!ALLOWED_TYPES.includes(data.contentType)) {
      return validationErrorResponse([`Invalid content type. Allowed: ${ALLOWED_TYPES.join(', ')}`]);
    }

    // Generate unique key
    const folder = data.folder || 'blog';
    const ext = data.filename.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    // Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: data.contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    // Construct the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    return successResponse({
      presignedUrl,
      publicUrl,
      key,
      expiresIn: 300,
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return errorResponse('Failed to generate upload URL', 500, error);
  }
};

/**
 * POST /admin/images/upload - Direct upload (base64 encoded image)
 * Request body: { image: string (base64), filename: string, contentType: string, folder?: string }
 */
export const uploadImage = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Validate required fields
    const errors = [];
    if (!data.image) {
      errors.push('Image data is required');
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

    // Validate content type
    if (!ALLOWED_TYPES.includes(data.contentType)) {
      return validationErrorResponse([`Invalid content type. Allowed: ${ALLOWED_TYPES.join(', ')}`]);
    }

    // Decode base64 image
    const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return validationErrorResponse([`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`]);
    }

    // Generate unique key
    const folder = data.folder || 'blog';
    const ext = data.filename.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: data.contentType,
      CacheControl: 'max-age=31536000', // 1 year cache
    });

    await s3Client.send(command);

    // Construct the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    return successResponse({
      message: 'Image uploaded successfully',
      url: publicUrl,
      key,
    }, 201);

  } catch (error) {
    console.error('Error uploading image:', error);
    return errorResponse('Failed to upload image', 500, error);
  }
};

/**
 * DELETE /admin/images/{key} - Delete an image from S3
 * Path parameter: key (URL encoded S3 key)
 */
export const deleteImage = async (event) => {
  try {
    const key = decodeURIComponent(event.pathParameters?.key || '');

    if (!key) {
      return validationErrorResponse(['Image key is required']);
    }

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return successResponse({
      message: 'Image deleted successfully',
      key,
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return errorResponse('Failed to delete image', 500, error);
  }
};

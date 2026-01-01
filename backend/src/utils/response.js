/**
 * Utility functions for API Gateway responses
 */

export const corsHeaders = (origin = '*') => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
});

export const successResponse = (data, statusCode = 200) => ({
  statusCode,
  headers: corsHeaders(process.env.CORS_ORIGIN || '*'),
  body: JSON.stringify({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }),
});

export const errorResponse = (message, statusCode = 400, error = null) => ({
  statusCode,
  headers: corsHeaders(process.env.CORS_ORIGIN || '*'),
  body: JSON.stringify({
    success: false,
    error: message,
    details: error?.message || null,
    timestamp: new Date().toISOString(),
  }),
});

export const validationErrorResponse = (errors) => ({
  statusCode: 422,
  headers: corsHeaders(process.env.CORS_ORIGIN || '*'),
  body: JSON.stringify({
    success: false,
    error: 'Validation failed',
    errors,
    timestamp: new Date().toISOString(),
  }),
});

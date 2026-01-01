/**
 * Lambda handler for Testimonials API
 */

import { v4 as uuidv4 } from 'uuid';
import { scanTable, putItem } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const TESTIMONIALS_TABLE = process.env.TESTIMONIALS_TABLE;

/**
 * GET /testimonials - Get all testimonials
 */
export const getTestimonials = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const featured = queryParams.featured === 'true';

    let testimonials = await scanTable(TESTIMONIALS_TABLE);

    // Filter featured if requested
    if (featured) {
      testimonials = testimonials.filter(t => t.featured === 1);
    }

    // Sort by rating or date
    testimonials.sort((a, b) => {
      if (featured) {
        return (b.rating || 0) - (a.rating || 0);
      }
      return b.createdAt - a.createdAt;
    });

    return successResponse({
      testimonials,
      count: testimonials.length,
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return errorResponse('Failed to fetch testimonials', 500, error);
  }
};

/**
 * POST /testimonials - Create a testimonial (Admin only)
 */
export const createTestimonial = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const testimonial = {
      id: uuidv4(),
      ...data,
      featured: data.featured ? 1 : 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await putItem(TESTIMONIALS_TABLE, testimonial);

    return successResponse({ testimonial }, 201);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return errorResponse('Failed to create testimonial', 500, error);
  }
};

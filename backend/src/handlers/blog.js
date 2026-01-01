/**
 * Lambda handler for Blog Posts API
 */

import { v4 as uuidv4 } from 'uuid';
import { scanTable, putItem, getItem, queryTable } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const BLOG_POSTS_TABLE = process.env.BLOG_POSTS_TABLE;

/**
 * GET /blog - Get all blog posts
 */
export const getBlogPosts = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const category = queryParams.category;
    const limit = parseInt(queryParams.limit) || 10;

    let blogPosts;

    if (category) {
      // Query by category using GSI
      blogPosts = await queryTable(
        BLOG_POSTS_TABLE,
        'category = :category',
        { ':category': category }
      );
    } else {
      // Scan all posts
      blogPosts = await scanTable(BLOG_POSTS_TABLE);
    }

    // Filter only published posts
    blogPosts = blogPosts.filter(post => post.status === 'published');

    // Sort by publishedAt descending
    blogPosts.sort((a, b) => b.publishedAt - a.publishedAt);

    // Limit results
    blogPosts = blogPosts.slice(0, limit);

    return successResponse({
      posts: blogPosts,
      count: blogPosts.length,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return errorResponse('Failed to fetch blog posts', 500, error);
  }
};

/**
 * GET /blog/{id} - Get a single blog post
 */
export const getBlogPostById = async (event) => {
  try {
    const { id } = event.pathParameters;

    const post = await getItem(BLOG_POSTS_TABLE, { id });

    if (!post || post.status !== 'published') {
      return errorResponse('Blog post not found', 404);
    }

    return successResponse({ post });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return errorResponse('Failed to fetch blog post', 500, error);
  }
};

/**
 * POST /blog - Create a blog post (Admin only)
 */
export const createBlogPost = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const post = {
      id: uuidv4(),
      ...data,
      publishedAt: data.status === 'published' ? Date.now() : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await putItem(BLOG_POSTS_TABLE, post);

    return successResponse({ post }, 201);
  } catch (error) {
    console.error('Error creating blog post:', error);
    return errorResponse('Failed to create blog post', 500, error);
  }
};

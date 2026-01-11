/**
 * Admin Blog CRUD Handler
 * Manages blog posts from admin panel
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const BLOG_POSTS_TABLE = process.env.BLOG_POSTS_TABLE;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

/**
 * GET /admin/blog - List all blog posts (including drafts)
 */
export const getPosts = async (event) => {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: BLOG_POSTS_TABLE,
      })
    );

    // Sort by createdAt descending
    const posts = (result.Items || []).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: posts,
        count: posts.length,
      }),
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch blog posts',
      }),
    };
  }
};

/**
 * GET /admin/blog/{id} - Get single blog post
 */
export const getPost = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Post ID is required',
        }),
      };
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: BLOG_POSTS_TABLE,
        Key: { id },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Blog post not found',
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result.Item,
      }),
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch blog post',
      }),
    };
  }
};

/**
 * POST /admin/blog - Create new blog post
 */
export const createPost = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const { title, content, excerpt, category, tags, image, author, status } = body;

    if (!title || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Title and content are required',
        }),
      };
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const post = {
      id: randomUUID(),
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 160) + '...',
      category: category || 'General',
      tags: tags || [],
      image: image || '',
      author: author || 'Admin',
      status: status || 'draft',
      views: 0,
      publishedAt: status === 'published' ? Date.now() : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: BLOG_POSTS_TABLE,
        Item: post,
      })
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data: post,
        message: 'Blog post created successfully',
      }),
    };
  } catch (error) {
    console.error('Error creating blog post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create blog post',
      }),
    };
  }
};

/**
 * PUT /admin/blog/{id} - Update blog post
 */
export const updatePost = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Post ID is required',
        }),
      };
    }

    // Check if post exists
    const existing = await docClient.send(
      new GetCommand({
        TableName: BLOG_POSTS_TABLE,
        Key: { id },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Blog post not found',
        }),
      };
    }

    const { title, content, excerpt, category, tags, image, author, status } = body;

    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (title !== undefined) {
      updateExpressions.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = title;

      // Update slug if title changes
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      updateExpressions.push('#slug = :slug');
      expressionAttributeNames['#slug'] = 'slug';
      expressionAttributeValues[':slug'] = slug;
    }
    if (content !== undefined) {
      updateExpressions.push('#content = :content');
      expressionAttributeNames['#content'] = 'content';
      expressionAttributeValues[':content'] = content;
    }
    if (excerpt !== undefined) {
      updateExpressions.push('#excerpt = :excerpt');
      expressionAttributeNames['#excerpt'] = 'excerpt';
      expressionAttributeValues[':excerpt'] = excerpt;
    }
    if (category !== undefined) {
      updateExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = category;
    }
    if (tags !== undefined) {
      updateExpressions.push('#tags = :tags');
      expressionAttributeNames['#tags'] = 'tags';
      expressionAttributeValues[':tags'] = tags;
    }
    if (image !== undefined) {
      updateExpressions.push('#image = :image');
      expressionAttributeNames['#image'] = 'image';
      expressionAttributeValues[':image'] = image;
    }
    if (author !== undefined) {
      updateExpressions.push('#author = :author');
      expressionAttributeNames['#author'] = 'author';
      expressionAttributeValues[':author'] = author;
    }
    if (status !== undefined) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;

      // Set publishedAt when publishing
      if (status === 'published' && !existing.Item.publishedAt) {
        updateExpressions.push('#publishedAt = :publishedAt');
        expressionAttributeNames['#publishedAt'] = 'publishedAt';
        expressionAttributeValues[':publishedAt'] = Date.now();
      }
    }

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = Date.now();

    const result = await docClient.send(
      new UpdateCommand({
        TableName: BLOG_POSTS_TABLE,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result.Attributes,
        message: 'Blog post updated successfully',
      }),
    };
  } catch (error) {
    console.error('Error updating blog post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to update blog post',
      }),
    };
  }
};

/**
 * DELETE /admin/blog/{id} - Delete blog post
 */
export const deletePost = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Post ID is required',
        }),
      };
    }

    // Check if post exists
    const existing = await docClient.send(
      new GetCommand({
        TableName: BLOG_POSTS_TABLE,
        Key: { id },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Blog post not found',
        }),
      };
    }

    await docClient.send(
      new DeleteCommand({
        TableName: BLOG_POSTS_TABLE,
        Key: { id },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Blog post deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to delete blog post',
      }),
    };
  }
};

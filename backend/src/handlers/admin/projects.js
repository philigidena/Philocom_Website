/**
 * Admin Projects CRUD Handler
 * Manages portfolio projects from admin panel
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

const PROJECTS_TABLE = process.env.PROJECTS_TABLE;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

/**
 * GET /admin/projects - List all projects (including drafts)
 */
export const getProjects = async (event) => {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: PROJECTS_TABLE,
      })
    );

    // Sort by createdAt descending
    const projects = (result.Items || []).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: projects,
        count: projects.length,
      }),
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch projects',
      }),
    };
  }
};

/**
 * GET /admin/projects/{id} - Get single project
 */
export const getProject = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Project ID is required',
        }),
      };
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: PROJECTS_TABLE,
        Key: { id },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Project not found',
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
    console.error('Error fetching project:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch project',
      }),
    };
  }
};

/**
 * POST /admin/projects - Create new project
 */
export const createProject = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const { title, description, category, technologies, link, image, featured, status } = body;

    if (!title || !description) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Title and description are required',
        }),
      };
    }

    const project = {
      id: randomUUID(),
      title,
      description,
      category: category || 'Web Development',
      technologies: technologies || [],
      link: link || '',
      image: image || '',
      featured: featured || false,
      status: status || 'published',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: PROJECTS_TABLE,
        Item: project,
      })
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data: project,
        message: 'Project created successfully',
      }),
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create project',
      }),
    };
  }
};

/**
 * PUT /admin/projects/{id} - Update project
 */
export const updateProject = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Project ID is required',
        }),
      };
    }

    // Check if project exists
    const existing = await docClient.send(
      new GetCommand({
        TableName: PROJECTS_TABLE,
        Key: { id },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Project not found',
        }),
      };
    }

    const { title, description, category, technologies, link, image, featured, status } = body;

    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (title !== undefined) {
      updateExpressions.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = title;
    }
    if (description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = description;
    }
    if (category !== undefined) {
      updateExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = category;
    }
    if (technologies !== undefined) {
      updateExpressions.push('#technologies = :technologies');
      expressionAttributeNames['#technologies'] = 'technologies';
      expressionAttributeValues[':technologies'] = technologies;
    }
    if (link !== undefined) {
      updateExpressions.push('#link = :link');
      expressionAttributeNames['#link'] = 'link';
      expressionAttributeValues[':link'] = link;
    }
    if (image !== undefined) {
      updateExpressions.push('#image = :image');
      expressionAttributeNames['#image'] = 'image';
      expressionAttributeValues[':image'] = image;
    }
    if (featured !== undefined) {
      updateExpressions.push('#featured = :featured');
      expressionAttributeNames['#featured'] = 'featured';
      expressionAttributeValues[':featured'] = featured;
    }
    if (status !== undefined) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = Date.now();

    const result = await docClient.send(
      new UpdateCommand({
        TableName: PROJECTS_TABLE,
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
        message: 'Project updated successfully',
      }),
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to update project',
      }),
    };
  }
};

/**
 * DELETE /admin/projects/{id} - Delete project
 */
export const deleteProject = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Project ID is required',
        }),
      };
    }

    // Check if project exists
    const existing = await docClient.send(
      new GetCommand({
        TableName: PROJECTS_TABLE,
        Key: { id },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Project not found',
        }),
      };
    }

    await docClient.send(
      new DeleteCommand({
        TableName: PROJECTS_TABLE,
        Key: { id },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Project deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to delete project',
      }),
    };
  }
};

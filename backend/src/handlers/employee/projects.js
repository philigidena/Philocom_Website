/**
 * Lambda handlers for Employee Project Management (Read-Only)
 * Employees can view projects but cannot modify them
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response.js';
import {
  validateEmployeeAccess,
  getEmployeeFromEvent,
  isEmployeeActive,
} from '../../utils/employeeAuth.js';

const PROJECTS_TABLE = process.env.PROJECTS_TABLE;

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

/**
 * GET /employee/projects - Get all projects (read-only)
 * Query params: limit
 */
export const getProjects = async (event) => {
  try {
    // Validate employee access
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }

    const employee = await getEmployeeFromEvent(event);
    if (!employee) {
      return errorResponse('Employee not found', 403);
    }

    if (!isEmployeeActive(employee)) {
      return errorResponse('Employee account is not active', 403);
    }

    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 100;

    // Scan projects table
    const command = new ScanCommand({
      TableName: PROJECTS_TABLE,
      Limit: limit,
    });

    const response = await docClient.send(command);

    // Sort by createdAt descending
    const projects = (response.Items || []).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );

    return successResponse({
      projects,
      count: projects.length,
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return errorResponse('Failed to fetch projects', 500, error);
  }
};

/**
 * GET /employee/projects/{id} - Get single project (read-only)
 */
export const getProject = async (event) => {
  try {
    // Validate employee access
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }

    const employee = await getEmployeeFromEvent(event);
    if (!employee) {
      return errorResponse('Employee not found', 403);
    }

    const projectId = event.pathParameters?.id;
    if (!projectId) {
      return validationErrorResponse(['Project ID is required']);
    }

    const command = new GetCommand({
      TableName: PROJECTS_TABLE,
      Key: { id: projectId },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return errorResponse('Project not found', 404);
    }

    return successResponse({
      project: response.Item,
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return errorResponse('Failed to fetch project', 500, error);
  }
};

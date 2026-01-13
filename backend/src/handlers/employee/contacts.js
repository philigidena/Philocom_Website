/**
 * Lambda handlers for Employee Contact Management (Read-Only)
 * Employees can view contacts but cannot modify them
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { successResponse, errorResponse } from '../../utils/response.js';
import {
  validateEmployeeAccess,
  getEmployeeFromEvent,
  isEmployeeActive,
} from '../../utils/employeeAuth.js';

const CONTACTS_TABLE = process.env.CONTACTS_TABLE;

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

/**
 * GET /employee/contacts - Get all contacts (read-only)
 * Query params: limit
 */
export const getContacts = async (event) => {
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

    // Scan contacts table
    const command = new ScanCommand({
      TableName: CONTACTS_TABLE,
      Limit: limit,
    });

    const response = await docClient.send(command);

    // Sort by submittedAt descending
    const contacts = (response.Items || []).sort(
      (a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)
    );

    return successResponse({
      contacts,
      count: contacts.length,
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return errorResponse('Failed to fetch contacts', 500, error);
  }
};

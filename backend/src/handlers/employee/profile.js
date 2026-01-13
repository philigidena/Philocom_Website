/**
 * Lambda handlers for Employee Profile Management
 * Employees can view and update their own profile
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { updateItem } from '../../utils/db.js';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response.js';
import {
  validateEmployeeAccess,
  getEmployeeFromEvent,
  isEmployeeActive,
} from '../../utils/employeeAuth.js';

const EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;
const EMAILS_TABLE = process.env.EMAILS_TABLE;

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

/**
 * GET /employee/profile - Get employee's own profile with stats
 */
export const getProfile = async (event) => {
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

    // Get email stats for dashboard
    let inboundCount = 0;
    let outboundCount = 0;
    let unreadCount = 0;

    try {
      // Count inbound emails
      const inboundCommand = new QueryCommand({
        TableName: EMAILS_TABLE,
        IndexName: 'OwnerEmailIndex',
        KeyConditionExpression: 'ownerEmail = :email',
        FilterExpression: 'direction = :direction',
        ExpressionAttributeValues: {
          ':email': employee.email.toLowerCase(),
          ':direction': 'inbound',
        },
        Select: 'COUNT',
      });

      const inboundResponse = await docClient.send(inboundCommand);
      inboundCount = inboundResponse.Count || 0;

      // Count outbound emails
      const outboundCommand = new QueryCommand({
        TableName: EMAILS_TABLE,
        IndexName: 'OwnerEmailIndex',
        KeyConditionExpression: 'ownerEmail = :email',
        FilterExpression: 'direction = :direction',
        ExpressionAttributeValues: {
          ':email': employee.email.toLowerCase(),
          ':direction': 'outbound',
        },
        Select: 'COUNT',
      });

      const outboundResponse = await docClient.send(outboundCommand);
      outboundCount = outboundResponse.Count || 0;

      // Count unread emails
      const unreadCommand = new QueryCommand({
        TableName: EMAILS_TABLE,
        IndexName: 'OwnerEmailIndex',
        KeyConditionExpression: 'ownerEmail = :email',
        FilterExpression: 'isRead = :isRead',
        ExpressionAttributeValues: {
          ':email': employee.email.toLowerCase(),
          ':isRead': false,
        },
        Select: 'COUNT',
      });

      const unreadResponse = await docClient.send(unreadCommand);
      unreadCount = unreadResponse.Count || 0;

    } catch (statsError) {
      console.error('Error fetching email stats:', statsError);
      // Continue without stats if there's an error
    }

    return successResponse({
      profile: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        loginEmail: employee.loginEmail,
        department: employee.department,
        status: employee.status,
        createdAt: employee.createdAt,
      },
      stats: {
        inboundEmails: inboundCount,
        outboundEmails: outboundCount,
        totalEmails: inboundCount + outboundCount,
        unreadEmails: unreadCount,
      },
    });

  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return errorResponse('Failed to fetch profile', 500, error);
  }
};

/**
 * PUT /employee/profile - Update employee's own profile
 * Only allows updating limited fields (e.g., name)
 */
export const updateProfile = async (event) => {
  try {
    // Validate employee access
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }

    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.id) {
      return errorResponse('Employee not found', 403);
    }

    if (!isEmployeeActive(employee)) {
      return errorResponse('Employee account is not active', 403);
    }

    const data = JSON.parse(event.body);

    // Only allow updating specific fields
    const allowedFields = ['name'];
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

    const updatedEmployee = await updateItem(EMPLOYEES_TABLE, { id: employee.id }, updates);

    return successResponse({
      message: 'Profile updated successfully',
      profile: {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        department: updatedEmployee.department,
        status: updatedEmployee.status,
      },
    });

  } catch (error) {
    console.error('Error updating employee profile:', error);
    return errorResponse('Failed to update profile', 500, error);
  }
};

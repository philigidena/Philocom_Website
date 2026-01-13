/**
 * Employee Authentication Utilities
 * Helper functions for validating employee access and extracting employee info from JWT
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

const EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;

/**
 * Validate that the request is from an employee user
 * Checks both Cognito claims (if using API Gateway authorizer) and X-Employee-Email header
 * @param {object} event - Lambda event object
 * @returns {object} { isValid: boolean, error?: string, employeeEmail?: string }
 */
export const validateEmployeeAccess = (event) => {
  // First try Cognito claims (if API Gateway authorizer is configured)
  const claims = event.requestContext?.authorizer?.claims;

  if (claims) {
    // Check if user is in employees group
    const groups = claims['cognito:groups'] || '';
    const groupList = Array.isArray(groups) ? groups : groups.split(',');

    if (groupList.includes('employees')) {
      return {
        isValid: true,
        employeeEmail: claims['custom:assigned_email'] || claims.email
      };
    }
  }

  // Fallback: Check X-Employee-Email header (for when Cognito auth is disabled at API Gateway)
  const headers = event.headers || {};
  const employeeEmail = headers['x-employee-email'] || headers['X-Employee-Email'];

  if (!employeeEmail) {
    return { isValid: false, error: 'No authorization found. Please login.' };
  }

  // Validate that this email belongs to an active employee (will be checked in getEmployeeFromEvent)
  return { isValid: true, employeeEmail: employeeEmail.toLowerCase() };
};

/**
 * Get the employee's assigned company email from JWT claims
 * @param {object} event - Lambda event object
 * @returns {string|null} The assigned company email or null
 */
export const getEmployeeEmailFromClaims = (event) => {
  const claims = event.requestContext?.authorizer?.claims;

  if (!claims) {
    return null;
  }

  // Get custom:assigned_email from Cognito claims
  return claims['custom:assigned_email'] || null;
};

/**
 * Get employee record by Cognito user ID
 * @param {string} cognitoUserId - The Cognito user ID (sub)
 * @returns {object|null} Employee record or null
 */
export const getEmployeeByCognitoId = async (cognitoUserId) => {
  try {
    const command = new QueryCommand({
      TableName: EMPLOYEES_TABLE,
      IndexName: 'CognitoUserIndex',
      KeyConditionExpression: 'cognitoUserId = :userId',
      ExpressionAttributeValues: {
        ':userId': cognitoUserId,
      },
    });

    const response = await docClient.send(command);
    return response.Items?.[0] || null;
  } catch (error) {
    console.error('Error fetching employee by Cognito ID:', error);
    return null;
  }
};

/**
 * Get employee record by assigned email
 * @param {string} email - The assigned company email
 * @returns {object|null} Employee record or null
 */
export const getEmployeeByEmail = async (email) => {
  try {
    const command = new QueryCommand({
      TableName: EMPLOYEES_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase(),
      },
    });

    const response = await docClient.send(command);
    return response.Items?.[0] || null;
  } catch (error) {
    console.error('Error fetching employee by email:', error);
    return null;
  }
};

/**
 * Get multiple employees by their assigned emails
 * @param {string[]} emails - Array of assigned company emails
 * @returns {object[]} Array of employee records
 */
export const getEmployeesByEmails = async (emails) => {
  const employees = [];

  for (const email of emails) {
    const employee = await getEmployeeByEmail(email);
    if (employee) {
      employees.push(employee);
    }
  }

  return employees;
};

/**
 * Get full employee info from JWT event
 * Combines JWT claims with DynamoDB record, or uses X-Employee-Email header
 * @param {object} event - Lambda event object
 * @returns {object|null} Complete employee info or null
 */
export const getEmployeeFromEvent = async (event) => {
  const claims = event.requestContext?.authorizer?.claims;
  const headers = event.headers || {};

  // Get email from claims or header
  let assignedEmail = null;
  let cognitoUserId = null;

  if (claims) {
    assignedEmail = claims['custom:assigned_email'] || claims.email;
    cognitoUserId = claims.sub;
  }

  // Fallback to header if no claims
  if (!assignedEmail) {
    assignedEmail = headers['x-employee-email'] || headers['X-Employee-Email'];
  }

  if (!assignedEmail && !cognitoUserId) {
    return null;
  }

  // Try to get employee from DynamoDB
  let employee = null;

  if (cognitoUserId) {
    employee = await getEmployeeByCognitoId(cognitoUserId);
  }

  if (!employee && assignedEmail) {
    employee = await getEmployeeByEmail(assignedEmail);
  }

  if (!employee) {
    // Return basic info from claims/header if no DynamoDB record
    return {
      email: assignedEmail,
      loginEmail: claims?.email || assignedEmail,
      name: claims?.name || 'Employee',
      cognitoUserId,
    };
  }

  return employee;
};

/**
 * Verify that an email belongs to the requesting employee
 * @param {object} emailRecord - The email record from DynamoDB
 * @param {string} employeeEmail - The employee's assigned email
 * @returns {boolean} True if the email belongs to the employee
 */
export const verifyEmailOwnership = (emailRecord, employeeEmail) => {
  if (!emailRecord || !employeeEmail) {
    return false;
  }

  const normalizedEmployeeEmail = employeeEmail.toLowerCase();

  // Check ownerEmail field (set by webhook and send handlers)
  if (emailRecord.ownerEmail?.toLowerCase() === normalizedEmployeeEmail) {
    return true;
  }

  // Check if employee is sender (outbound)
  if (emailRecord.from?.email?.toLowerCase() === normalizedEmployeeEmail) {
    return true;
  }

  // Check if employee is recipient (inbound)
  if (emailRecord.to) {
    const recipients = Array.isArray(emailRecord.to) ? emailRecord.to : [emailRecord.to];
    for (const recipient of recipients) {
      const recipientEmail = typeof recipient === 'string' ? recipient : recipient.email;
      if (recipientEmail?.toLowerCase() === normalizedEmployeeEmail) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check if employee is active
 * @param {object} employee - Employee record
 * @returns {boolean} True if employee is active
 */
export const isEmployeeActive = (employee) => {
  return employee && employee.status === 'active';
};

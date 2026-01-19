/**
 * Lambda handlers for Admin Employee Management
 * Handles CRUD operations for employee accounts
 */

import { v4 as uuidv4 } from 'uuid';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminAddUserToGroupCommand,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { getItem, putItem, updateItem, deleteItem, scanTable } from '../../utils/db.js';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response.js';
import { sanitizeInput } from '../../utils/validation.js';

const EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'eu-central-1',
});

/**
 * GET /admin/employees - Get all employees
 * Query params: status, limit
 */
export const getEmployees = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const status = queryParams.status;

    let employees;

    if (status) {
      // Query by status using GSI
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, QueryCommand } = await import('@aws-sdk/lib-dynamodb');

      const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
      const docClient = DynamoDBDocumentClient.from(client);

      const command = new QueryCommand({
        TableName: EMPLOYEES_TABLE,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
        ScanIndexForward: false, // Most recent first
      });

      const response = await docClient.send(command);
      employees = response.Items || [];
    } else {
      // Get all employees
      employees = await scanTable(EMPLOYEES_TABLE);
      // Sort by createdAt descending
      employees.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return successResponse({
      employees,
      count: employees.length,
    });

  } catch (error) {
    console.error('Error fetching employees:', error);
    return errorResponse('Failed to fetch employees', 500, error);
  }
};

/**
 * GET /admin/employees/{id} - Get single employee by ID
 */
export const getEmployee = async (event) => {
  try {
    const employeeId = event.pathParameters?.id;

    if (!employeeId) {
      return validationErrorResponse(['Employee ID is required']);
    }

    const employee = await getItem(EMPLOYEES_TABLE, { id: employeeId });

    if (!employee) {
      return errorResponse('Employee not found', 404);
    }

    return successResponse({ employee });

  } catch (error) {
    console.error('Error fetching employee:', error);
    return errorResponse('Failed to fetch employee', 500, error);
  }
};

/**
 * POST /admin/employees - Create a new employee
 * Creates both DynamoDB record and Cognito user
 */
export const createEmployee = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Validate required fields
    const errors = [];
    if (!data.name) {
      errors.push('Name is required');
    }
    // Personal email is optional
    if (!data.assignedEmail) {
      errors.push('Assigned company email is required');
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Check if assigned email is already in use
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, QueryCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
    const docClient = DynamoDBDocumentClient.from(client);

    const existingCheck = new QueryCommand({
      TableName: EMPLOYEES_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': data.assignedEmail.toLowerCase(),
      },
    });

    const existingResult = await docClient.send(existingCheck);
    if (existingResult.Items && existingResult.Items.length > 0) {
      return validationErrorResponse(['This company email is already assigned to another employee']);
    }

    // Create Cognito user - use company email as username for login
    let cognitoUserId;
    try {
      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: data.assignedEmail.toLowerCase(), // Login with company email
        UserAttributes: [
          { Name: 'email', Value: data.assignedEmail.toLowerCase() }, // Company email for Cognito
          { Name: 'email_verified', Value: 'true' },
          { Name: 'name', Value: sanitizeInput(data.name) },
          { Name: 'custom:personal_email', Value: data.email ? data.email.toLowerCase() : '' }, // Store personal email as backup
        ],
        TemporaryPassword: data.temporaryPassword || generateTemporaryPassword(),
        MessageAction: data.suppressEmail ? 'SUPPRESS' : undefined,
      });

      const cognitoResponse = await cognitoClient.send(createUserCommand);
      cognitoUserId = cognitoResponse.User.Username;

      // Add user to employees group
      const addToGroupCommand = new AdminAddUserToGroupCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: cognitoUserId,
        GroupName: 'employees',
      });

      await cognitoClient.send(addToGroupCommand);

    } catch (cognitoError) {
      console.error('Cognito error:', cognitoError);
      if (cognitoError.name === 'UsernameExistsException') {
        return validationErrorResponse(['A user with this email already exists']);
      }
      throw cognitoError;
    }

    // Create employee record in DynamoDB
    const employee = {
      id: uuidv4(),
      email: data.assignedEmail.toLowerCase(), // Company email (used for login)
      personalEmail: data.email ? data.email.toLowerCase() : null, // Personal email (optional, for contact)
      cognitoUserId,
      name: sanitizeInput(data.name),
      department: data.department ? sanitizeInput(data.department) : null,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: event.requestContext?.authorizer?.claims?.email || 'admin',
    };

    await putItem(EMPLOYEES_TABLE, employee);

    return successResponse({
      message: 'Employee created successfully',
      employee,
    }, 201);

  } catch (error) {
    console.error('Error creating employee:', error);
    return errorResponse('Failed to create employee', 500, error);
  }
};

/**
 * PUT /admin/employees/{id} - Update an employee
 */
export const updateEmployee = async (event) => {
  try {
    const employeeId = event.pathParameters?.id;
    const data = JSON.parse(event.body);

    if (!employeeId) {
      return validationErrorResponse(['Employee ID is required']);
    }

    // Get existing employee
    const existingEmployee = await getItem(EMPLOYEES_TABLE, { id: employeeId });
    if (!existingEmployee) {
      return errorResponse('Employee not found', 404);
    }

    // Build updates
    const updates = {
      updatedAt: Date.now(),
    };

    if (data.name) {
      updates.name = sanitizeInput(data.name);
    }
    if (data.department !== undefined) {
      updates.department = data.department ? sanitizeInput(data.department) : null;
    }
    if (data.status && ['active', 'inactive', 'suspended'].includes(data.status)) {
      updates.status = data.status;

      // Update Cognito user status
      if (existingEmployee.cognitoUserId) {
        if (data.status === 'active') {
          await cognitoClient.send(new AdminEnableUserCommand({
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: existingEmployee.cognitoUserId,
          }));
        } else {
          await cognitoClient.send(new AdminDisableUserCommand({
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: existingEmployee.cognitoUserId,
          }));
        }
      }
    }

    // Update assigned email if changed
    if (data.assignedEmail && data.assignedEmail.toLowerCase() !== existingEmployee.email) {
      // Check if new email is available
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, QueryCommand } = await import('@aws-sdk/lib-dynamodb');

      const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
      const docClient = DynamoDBDocumentClient.from(client);

      const existingCheck = new QueryCommand({
        TableName: EMPLOYEES_TABLE,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': data.assignedEmail.toLowerCase(),
        },
      });

      const existingResult = await docClient.send(existingCheck);
      if (existingResult.Items && existingResult.Items.length > 0) {
        return validationErrorResponse(['This company email is already assigned to another employee']);
      }

      updates.email = data.assignedEmail.toLowerCase();

      // Update Cognito custom attribute
      if (existingEmployee.cognitoUserId) {
        await cognitoClient.send(new AdminUpdateUserAttributesCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: existingEmployee.cognitoUserId,
          UserAttributes: [
            { Name: 'custom:assigned_email', Value: data.assignedEmail.toLowerCase() },
          ],
        }));
      }
    }

    // Update Cognito name if changed
    if (data.name && existingEmployee.cognitoUserId) {
      await cognitoClient.send(new AdminUpdateUserAttributesCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: existingEmployee.cognitoUserId,
        UserAttributes: [
          { Name: 'name', Value: sanitizeInput(data.name) },
        ],
      }));
    }

    const updatedEmployee = await updateItem(EMPLOYEES_TABLE, { id: employeeId }, updates);

    return successResponse({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    return errorResponse('Failed to update employee', 500, error);
  }
};

/**
 * DELETE /admin/employees/{id} - Delete/deactivate an employee
 */
export const deleteEmployee = async (event) => {
  try {
    const employeeId = event.pathParameters?.id;
    const queryParams = event.queryStringParameters || {};
    const hardDelete = queryParams.hard === 'true';

    if (!employeeId) {
      return validationErrorResponse(['Employee ID is required']);
    }

    // Get existing employee
    const existingEmployee = await getItem(EMPLOYEES_TABLE, { id: employeeId });
    if (!existingEmployee) {
      return errorResponse('Employee not found', 404);
    }

    if (hardDelete) {
      // Hard delete - remove from Cognito and DynamoDB
      if (existingEmployee.cognitoUserId) {
        try {
          await cognitoClient.send(new AdminDeleteUserCommand({
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: existingEmployee.cognitoUserId,
          }));
        } catch (cognitoError) {
          console.error('Error deleting Cognito user:', cognitoError);
          // Continue with DynamoDB deletion even if Cognito fails
        }
      }

      await deleteItem(EMPLOYEES_TABLE, { id: employeeId });

      return successResponse({
        message: 'Employee permanently deleted',
      });
    } else {
      // Soft delete - just deactivate
      if (existingEmployee.cognitoUserId) {
        await cognitoClient.send(new AdminDisableUserCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: existingEmployee.cognitoUserId,
        }));
      }

      const updatedEmployee = await updateItem(EMPLOYEES_TABLE, { id: employeeId }, {
        status: 'inactive',
        updatedAt: Date.now(),
      });

      return successResponse({
        message: 'Employee deactivated successfully',
        employee: updatedEmployee,
      });
    }

  } catch (error) {
    console.error('Error deleting employee:', error);
    return errorResponse('Failed to delete employee', 500, error);
  }
};

/**
 * Generate a temporary password for new employees
 */
function generateTemporaryPassword() {
  const length = 12;
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const all = lowercase + uppercase + numbers;

  let password = '';
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  // Fill the rest
  for (let i = 3; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

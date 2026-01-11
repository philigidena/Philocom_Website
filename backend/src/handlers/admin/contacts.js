/**
 * Admin Contacts Handler
 * View and manage contact form submissions
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CONTACTS_TABLE = process.env.CONTACTS_TABLE;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
};

/**
 * GET /admin/contacts - List all contact submissions
 */
export const getContacts = async (event) => {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: CONTACTS_TABLE,
      })
    );

    // Sort by submittedAt descending
    const contacts = (result.Items || []).sort(
      (a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: contacts,
        count: contacts.length,
      }),
    };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch contacts',
      }),
    };
  }
};

/**
 * GET /admin/contacts/{id} - Get single contact submission
 */
export const getContact = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Contact ID is required',
        }),
      };
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: CONTACTS_TABLE,
        Key: { id },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Contact not found',
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
    console.error('Error fetching contact:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch contact',
      }),
    };
  }
};

/**
 * PUT /admin/contacts/{id} - Update contact status
 */
export const updateContact = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Contact ID is required',
        }),
      };
    }

    // Check if contact exists
    const existing = await docClient.send(
      new GetCommand({
        TableName: CONTACTS_TABLE,
        Key: { id },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Contact not found',
        }),
      };
    }

    const { status, notes } = body;

    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (status !== undefined) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }
    if (notes !== undefined) {
      updateExpressions.push('#notes = :notes');
      expressionAttributeNames['#notes'] = 'notes';
      expressionAttributeValues[':notes'] = notes;
    }

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = Date.now();

    if (updateExpressions.length === 1) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No fields to update',
        }),
      };
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: CONTACTS_TABLE,
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
        message: 'Contact updated successfully',
      }),
    };
  } catch (error) {
    console.error('Error updating contact:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to update contact',
      }),
    };
  }
};

/**
 * DELETE /admin/contacts/{id} - Delete contact submission
 */
export const deleteContact = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Contact ID is required',
        }),
      };
    }

    // Check if contact exists
    const existing = await docClient.send(
      new GetCommand({
        TableName: CONTACTS_TABLE,
        Key: { id },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Contact not found',
        }),
      };
    }

    await docClient.send(
      new DeleteCommand({
        TableName: CONTACTS_TABLE,
        Key: { id },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Contact deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Error deleting contact:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to delete contact',
      }),
    };
  }
};

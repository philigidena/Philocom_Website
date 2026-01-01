/**
 * DynamoDB utility functions
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

export const getItem = async (tableName, key) => {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });

  const response = await docClient.send(command);
  return response.Item;
};

export const putItem = async (tableName, item) => {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await docClient.send(command);
  return item;
};

export const updateItem = async (tableName, key, updates) => {
  const updateExpression = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updates).forEach((field, index) => {
    const attributeName = `#field${index}`;
    const attributeValue = `:value${index}`;

    updateExpression.push(`${attributeName} = ${attributeValue}`);
    expressionAttributeNames[attributeName] = field;
    expressionAttributeValues[attributeValue] = updates[field];
  });

  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return response.Attributes;
};

export const deleteItem = async (tableName, key) => {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });

  await docClient.send(command);
};

export const scanTable = async (tableName, filters = {}) => {
  const command = new ScanCommand({
    TableName: tableName,
    ...filters,
  });

  const response = await docClient.send(command);
  return response.Items || [];
};

export const queryTable = async (tableName, keyConditionExpression, expressionAttributeValues) => {
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  const response = await docClient.send(command);
  return response.Items || [];
};

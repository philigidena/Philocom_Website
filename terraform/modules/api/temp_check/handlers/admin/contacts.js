var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handlers/admin/contacts.js
var contacts_exports = {};
__export(contacts_exports, {
  deleteContact: () => deleteContact,
  getContact: () => getContact,
  getContacts: () => getContacts,
  updateContact: () => updateContact
});
module.exports = __toCommonJS(contacts_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var CONTACTS_TABLE = process.env.CONTACTS_TABLE;
var CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
var headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS"
};
var getContacts = async (event) => {
  try {
    const result = await docClient.send(
      new import_lib_dynamodb.ScanCommand({
        TableName: CONTACTS_TABLE
      })
    );
    const contacts = (result.Items || []).sort(
      (a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: contacts,
        count: contacts.length
      })
    };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch contacts"
      })
    };
  }
};
var getContact = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Contact ID is required"
        })
      };
    }
    const result = await docClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: CONTACTS_TABLE,
        Key: { id }
      })
    );
    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Contact not found"
        })
      };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result.Item
      })
    };
  } catch (error) {
    console.error("Error fetching contact:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch contact"
      })
    };
  }
};
var updateContact = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || "{}");
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Contact ID is required"
        })
      };
    }
    const existing = await docClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: CONTACTS_TABLE,
        Key: { id }
      })
    );
    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Contact not found"
        })
      };
    }
    const { status, notes } = body;
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    if (status !== void 0) {
      updateExpressions.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = status;
    }
    if (notes !== void 0) {
      updateExpressions.push("#notes = :notes");
      expressionAttributeNames["#notes"] = "notes";
      expressionAttributeValues[":notes"] = notes;
    }
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = Date.now();
    if (updateExpressions.length === 1) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "No fields to update"
        })
      };
    }
    const result = await docClient.send(
      new import_lib_dynamodb.UpdateCommand({
        TableName: CONTACTS_TABLE,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW"
      })
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result.Attributes,
        message: "Contact updated successfully"
      })
    };
  } catch (error) {
    console.error("Error updating contact:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to update contact"
      })
    };
  }
};
var deleteContact = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Contact ID is required"
        })
      };
    }
    const existing = await docClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: CONTACTS_TABLE,
        Key: { id }
      })
    );
    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Contact not found"
        })
      };
    }
    await docClient.send(
      new import_lib_dynamodb.DeleteCommand({
        TableName: CONTACTS_TABLE,
        Key: { id }
      })
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Contact deleted successfully"
      })
    };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to delete contact"
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteContact,
  getContact,
  getContacts,
  updateContact
});

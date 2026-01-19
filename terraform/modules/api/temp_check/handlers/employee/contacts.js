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

// src/handlers/employee/contacts.js
var contacts_exports = {};
__export(contacts_exports, {
  getContacts: () => getContacts
});
module.exports = __toCommonJS(contacts_exports);
var import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");

// src/utils/response.js
var ALLOWED_ORIGINS = [
  "https://philocom.co",
  "https://www.philocom.co",
  "http://localhost:5173",
  "http://localhost:3000"
];
var getAllowedOrigin = (requestOrigin) => {
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  return process.env.CORS_ORIGIN || "https://philocom.co";
};
var corsHeaders = (origin = "*") => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json"
});
var successResponse = (data, statusCode = 200, event = null) => {
  const origin = event?.headers?.origin || event?.headers?.Origin;
  return {
    statusCode,
    headers: corsHeaders(getAllowedOrigin(origin)),
    body: JSON.stringify({
      success: true,
      data,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    })
  };
};
var errorResponse = (message, statusCode = 400, error = null, event = null) => {
  const origin = event?.headers?.origin || event?.headers?.Origin;
  return {
    statusCode,
    headers: corsHeaders(getAllowedOrigin(origin)),
    body: JSON.stringify({
      success: false,
      error: message,
      details: error?.message || null,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    })
  };
};

// src/utils/employeeAuth.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;
var validateEmployeeAccess = (event) => {
  const claims = event.requestContext?.authorizer?.claims;
  if (claims) {
    const groups = claims["cognito:groups"] || "";
    const groupList = Array.isArray(groups) ? groups : groups.split(",");
    if (groupList.includes("employees")) {
      return {
        isValid: true,
        employeeEmail: claims["custom:assigned_email"] || claims.email
      };
    }
  }
  const headers = event.headers || {};
  const employeeEmail = headers["x-employee-email"] || headers["X-Employee-Email"];
  if (!employeeEmail) {
    return { isValid: false, error: "No authorization found. Please login." };
  }
  return { isValid: true, employeeEmail: employeeEmail.toLowerCase() };
};
var getEmployeeByCognitoId = async (cognitoUserId) => {
  try {
    const command = new import_lib_dynamodb.QueryCommand({
      TableName: EMPLOYEES_TABLE,
      IndexName: "CognitoUserIndex",
      KeyConditionExpression: "cognitoUserId = :userId",
      ExpressionAttributeValues: {
        ":userId": cognitoUserId
      }
    });
    const response = await docClient.send(command);
    return response.Items?.[0] || null;
  } catch (error) {
    console.error("Error fetching employee by Cognito ID:", error);
    return null;
  }
};
var getEmployeeByEmail = async (email) => {
  try {
    const command = new import_lib_dynamodb.QueryCommand({
      TableName: EMPLOYEES_TABLE,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email.toLowerCase()
      }
    });
    const response = await docClient.send(command);
    return response.Items?.[0] || null;
  } catch (error) {
    console.error("Error fetching employee by email:", error);
    return null;
  }
};
var getEmployeeFromEvent = async (event) => {
  const claims = event.requestContext?.authorizer?.claims;
  const headers = event.headers || {};
  let assignedEmail = null;
  let cognitoUserId = null;
  if (claims) {
    assignedEmail = claims["custom:assigned_email"] || claims.email;
    cognitoUserId = claims.sub;
  }
  if (!assignedEmail) {
    assignedEmail = headers["x-employee-email"] || headers["X-Employee-Email"];
  }
  if (!assignedEmail && !cognitoUserId) {
    return null;
  }
  let employee = null;
  if (cognitoUserId) {
    employee = await getEmployeeByCognitoId(cognitoUserId);
  }
  if (!employee && assignedEmail) {
    employee = await getEmployeeByEmail(assignedEmail);
  }
  if (!employee) {
    return {
      email: assignedEmail,
      loginEmail: claims?.email || assignedEmail,
      name: claims?.name || "Employee",
      cognitoUserId
    };
  }
  return employee;
};
var isEmployeeActive = (employee) => {
  return employee && employee.status === "active";
};

// src/handlers/employee/contacts.js
var CONTACTS_TABLE = process.env.CONTACTS_TABLE;
var dynamoClient = new import_client_dynamodb2.DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
var docClient2 = import_lib_dynamodb2.DynamoDBDocumentClient.from(dynamoClient);
var getContacts = async (event) => {
  try {
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }
    const employee = await getEmployeeFromEvent(event);
    if (!employee) {
      return errorResponse("Employee not found", 403);
    }
    if (!isEmployeeActive(employee)) {
      return errorResponse("Employee account is not active", 403);
    }
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 100;
    const command = new import_lib_dynamodb2.ScanCommand({
      TableName: CONTACTS_TABLE,
      Limit: limit
    });
    const response = await docClient2.send(command);
    const contacts = (response.Items || []).sort(
      (a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)
    );
    return successResponse({
      contacts,
      count: contacts.length
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return errorResponse("Failed to fetch contacts", 500, error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getContacts
});

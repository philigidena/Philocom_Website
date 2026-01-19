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

// src/handlers/employee/profile.js
var profile_exports = {};
__export(profile_exports, {
  getProfile: () => getProfile,
  updateProfile: () => updateProfile
});
module.exports = __toCommonJS(profile_exports);
var import_client_dynamodb3 = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb3 = require("@aws-sdk/lib-dynamodb");

// src/utils/db.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var updateItem = async (tableName, key, updates) => {
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
  const command = new import_lib_dynamodb.UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: `SET ${updateExpression.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  });
  const response = await docClient.send(command);
  return response.Attributes;
};

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
var validationErrorResponse = (errors, event = null) => {
  const origin = event?.headers?.origin || event?.headers?.Origin;
  return {
    statusCode: 422,
    headers: corsHeaders(getAllowedOrigin(origin)),
    body: JSON.stringify({
      success: false,
      error: "Validation failed",
      errors,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    })
  };
};

// src/utils/employeeAuth.js
var import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");
var client2 = new import_client_dynamodb2.DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
var docClient2 = import_lib_dynamodb2.DynamoDBDocumentClient.from(client2);
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
    const command = new import_lib_dynamodb2.QueryCommand({
      TableName: EMPLOYEES_TABLE,
      IndexName: "CognitoUserIndex",
      KeyConditionExpression: "cognitoUserId = :userId",
      ExpressionAttributeValues: {
        ":userId": cognitoUserId
      }
    });
    const response = await docClient2.send(command);
    return response.Items?.[0] || null;
  } catch (error) {
    console.error("Error fetching employee by Cognito ID:", error);
    return null;
  }
};
var getEmployeeByEmail = async (email) => {
  try {
    const command = new import_lib_dynamodb2.QueryCommand({
      TableName: EMPLOYEES_TABLE,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email.toLowerCase()
      }
    });
    const response = await docClient2.send(command);
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

// src/handlers/employee/profile.js
var EMPLOYEES_TABLE2 = process.env.EMPLOYEES_TABLE;
var EMAILS_TABLE = process.env.EMAILS_TABLE;
var dynamoClient = new import_client_dynamodb3.DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
var docClient3 = import_lib_dynamodb3.DynamoDBDocumentClient.from(dynamoClient);
var getProfile = async (event) => {
  try {
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }
    const employee = await getEmployeeFromEvent(event);
    if (!employee) {
      return errorResponse("Employee not found", 403);
    }
    let inboundCount = 0;
    let outboundCount = 0;
    let unreadCount = 0;
    try {
      const inboundCommand = new import_lib_dynamodb3.QueryCommand({
        TableName: EMAILS_TABLE,
        IndexName: "OwnerEmailIndex",
        KeyConditionExpression: "ownerEmail = :email",
        FilterExpression: "direction = :direction",
        ExpressionAttributeValues: {
          ":email": employee.email.toLowerCase(),
          ":direction": "inbound"
        },
        Select: "COUNT"
      });
      const inboundResponse = await docClient3.send(inboundCommand);
      inboundCount = inboundResponse.Count || 0;
      const outboundCommand = new import_lib_dynamodb3.QueryCommand({
        TableName: EMAILS_TABLE,
        IndexName: "OwnerEmailIndex",
        KeyConditionExpression: "ownerEmail = :email",
        FilterExpression: "direction = :direction",
        ExpressionAttributeValues: {
          ":email": employee.email.toLowerCase(),
          ":direction": "outbound"
        },
        Select: "COUNT"
      });
      const outboundResponse = await docClient3.send(outboundCommand);
      outboundCount = outboundResponse.Count || 0;
      const unreadCommand = new import_lib_dynamodb3.QueryCommand({
        TableName: EMAILS_TABLE,
        IndexName: "OwnerEmailIndex",
        KeyConditionExpression: "ownerEmail = :email",
        FilterExpression: "isRead = :isRead",
        ExpressionAttributeValues: {
          ":email": employee.email.toLowerCase(),
          ":isRead": false
        },
        Select: "COUNT"
      });
      const unreadResponse = await docClient3.send(unreadCommand);
      unreadCount = unreadResponse.Count || 0;
    } catch (statsError) {
      console.error("Error fetching email stats:", statsError);
    }
    return successResponse({
      profile: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        loginEmail: employee.loginEmail,
        department: employee.department,
        status: employee.status,
        createdAt: employee.createdAt
      },
      stats: {
        inboundEmails: inboundCount,
        outboundEmails: outboundCount,
        totalEmails: inboundCount + outboundCount,
        unreadEmails: unreadCount
      }
    });
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    return errorResponse("Failed to fetch profile", 500, error);
  }
};
var updateProfile = async (event) => {
  try {
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }
    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.id) {
      return errorResponse("Employee not found", 403);
    }
    if (!isEmployeeActive(employee)) {
      return errorResponse("Employee account is not active", 403);
    }
    const data = JSON.parse(event.body);
    const allowedFields = ["name"];
    const updates = {};
    for (const field of allowedFields) {
      if (data[field] !== void 0) {
        updates[field] = data[field];
      }
    }
    if (Object.keys(updates).length === 0) {
      return validationErrorResponse(["No valid fields to update"]);
    }
    updates.updatedAt = Date.now();
    const updatedEmployee = await updateItem(EMPLOYEES_TABLE2, { id: employee.id }, updates);
    return successResponse({
      message: "Profile updated successfully",
      profile: {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        department: updatedEmployee.department,
        status: updatedEmployee.status
      }
    });
  } catch (error) {
    console.error("Error updating employee profile:", error);
    return errorResponse("Failed to update profile", 500, error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getProfile,
  updateProfile
});

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handlers/admin/employees.js
var employees_exports = {};
__export(employees_exports, {
  createEmployee: () => createEmployee,
  deleteEmployee: () => deleteEmployee,
  getEmployee: () => getEmployee,
  getEmployees: () => getEmployees,
  updateEmployee: () => updateEmployee
});
module.exports = __toCommonJS(employees_exports);

// node_modules/uuid/dist/esm-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/esm-node/rng.js
var import_node_crypto = __toESM(require("node:crypto"));
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_node_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// node_modules/uuid/dist/esm-node/native.js
var import_node_crypto2 = __toESM(require("node:crypto"));
var native_default = {
  randomUUID: import_node_crypto2.default.randomUUID
};

// node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/handlers/admin/employees.js
var import_client_cognito_identity_provider = require("@aws-sdk/client-cognito-identity-provider");

// src/utils/db.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var getItem = async (tableName, key) => {
  const command = new import_lib_dynamodb.GetCommand({
    TableName: tableName,
    Key: key
  });
  const response = await docClient.send(command);
  return response.Item;
};
var putItem = async (tableName, item) => {
  const command = new import_lib_dynamodb.PutCommand({
    TableName: tableName,
    Item: item
  });
  await docClient.send(command);
  return item;
};
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
var deleteItem = async (tableName, key) => {
  const command = new import_lib_dynamodb.DeleteCommand({
    TableName: tableName,
    Key: key
  });
  await docClient.send(command);
};
var scanTable = async (tableName, filters = {}) => {
  const command = new import_lib_dynamodb.ScanCommand({
    TableName: tableName,
    ...filters
  });
  const response = await docClient.send(command);
  return response.Items || [];
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

// src/utils/validation.js
var sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.replace(/<script[^>]*>.*?<\/script>/gi, "").replace(/<[^>]+>/g, "").trim();
};

// src/handlers/admin/employees.js
var EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;
var COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
var cognitoClient = new import_client_cognito_identity_provider.CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "eu-central-1"
});
var getEmployees = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const status = queryParams.status;
    let employees;
    if (status) {
      const { DynamoDBClient: DynamoDBClient2 } = await import("@aws-sdk/client-dynamodb");
      const { DynamoDBDocumentClient: DynamoDBDocumentClient2, QueryCommand: QueryCommand2 } = await import("@aws-sdk/lib-dynamodb");
      const client2 = new DynamoDBClient2({ region: process.env.AWS_REGION || "eu-central-1" });
      const docClient2 = DynamoDBDocumentClient2.from(client2);
      const command = new QueryCommand2({
        TableName: EMPLOYEES_TABLE,
        IndexName: "StatusIndex",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":status": status
        },
        ScanIndexForward: false
        // Most recent first
      });
      const response = await docClient2.send(command);
      employees = response.Items || [];
    } else {
      employees = await scanTable(EMPLOYEES_TABLE);
      employees.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return successResponse({
      employees,
      count: employees.length
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return errorResponse("Failed to fetch employees", 500, error);
  }
};
var getEmployee = async (event) => {
  try {
    const employeeId = event.pathParameters?.id;
    if (!employeeId) {
      return validationErrorResponse(["Employee ID is required"]);
    }
    const employee = await getItem(EMPLOYEES_TABLE, { id: employeeId });
    if (!employee) {
      return errorResponse("Employee not found", 404);
    }
    return successResponse({ employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return errorResponse("Failed to fetch employee", 500, error);
  }
};
var createEmployee = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const errors = [];
    if (!data.name) {
      errors.push("Name is required");
    }
    if (!data.assignedEmail) {
      errors.push("Assigned company email is required");
    }
    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }
    const { DynamoDBClient: DynamoDBClient2 } = await import("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient: DynamoDBDocumentClient2, QueryCommand: QueryCommand2 } = await import("@aws-sdk/lib-dynamodb");
    const client2 = new DynamoDBClient2({ region: process.env.AWS_REGION || "eu-central-1" });
    const docClient2 = DynamoDBDocumentClient2.from(client2);
    const existingCheck = new QueryCommand2({
      TableName: EMPLOYEES_TABLE,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": data.assignedEmail.toLowerCase()
      }
    });
    const existingResult = await docClient2.send(existingCheck);
    if (existingResult.Items && existingResult.Items.length > 0) {
      return validationErrorResponse(["This company email is already assigned to another employee"]);
    }
    let cognitoUserId;
    try {
      const createUserCommand = new import_client_cognito_identity_provider.AdminCreateUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: data.assignedEmail.toLowerCase(),
        // Login with company email
        UserAttributes: [
          { Name: "email", Value: data.assignedEmail.toLowerCase() },
          // Company email for Cognito
          { Name: "email_verified", Value: "true" },
          { Name: "name", Value: sanitizeInput(data.name) },
          { Name: "custom:personal_email", Value: data.email ? data.email.toLowerCase() : "" }
          // Store personal email as backup
        ],
        TemporaryPassword: data.temporaryPassword || generateTemporaryPassword(),
        MessageAction: data.suppressEmail ? "SUPPRESS" : void 0
      });
      const cognitoResponse = await cognitoClient.send(createUserCommand);
      cognitoUserId = cognitoResponse.User.Username;
      const addToGroupCommand = new import_client_cognito_identity_provider.AdminAddUserToGroupCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: cognitoUserId,
        GroupName: "employees"
      });
      await cognitoClient.send(addToGroupCommand);
    } catch (cognitoError) {
      console.error("Cognito error:", cognitoError);
      if (cognitoError.name === "UsernameExistsException") {
        return validationErrorResponse(["A user with this email already exists"]);
      }
      throw cognitoError;
    }
    const employee = {
      id: v4_default(),
      email: data.assignedEmail.toLowerCase(),
      // Company email (used for login)
      personalEmail: data.email ? data.email.toLowerCase() : null,
      // Personal email (optional, for contact)
      cognitoUserId,
      name: sanitizeInput(data.name),
      department: data.department ? sanitizeInput(data.department) : null,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: event.requestContext?.authorizer?.claims?.email || "admin"
    };
    await putItem(EMPLOYEES_TABLE, employee);
    return successResponse({
      message: "Employee created successfully",
      employee
    }, 201);
  } catch (error) {
    console.error("Error creating employee:", error);
    return errorResponse("Failed to create employee", 500, error);
  }
};
var updateEmployee = async (event) => {
  try {
    const employeeId = event.pathParameters?.id;
    const data = JSON.parse(event.body);
    if (!employeeId) {
      return validationErrorResponse(["Employee ID is required"]);
    }
    const existingEmployee = await getItem(EMPLOYEES_TABLE, { id: employeeId });
    if (!existingEmployee) {
      return errorResponse("Employee not found", 404);
    }
    const updates = {
      updatedAt: Date.now()
    };
    if (data.name) {
      updates.name = sanitizeInput(data.name);
    }
    if (data.department !== void 0) {
      updates.department = data.department ? sanitizeInput(data.department) : null;
    }
    if (data.status && ["active", "inactive", "suspended"].includes(data.status)) {
      updates.status = data.status;
      if (existingEmployee.cognitoUserId) {
        if (data.status === "active") {
          await cognitoClient.send(new import_client_cognito_identity_provider.AdminEnableUserCommand({
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: existingEmployee.cognitoUserId
          }));
        } else {
          await cognitoClient.send(new import_client_cognito_identity_provider.AdminDisableUserCommand({
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: existingEmployee.cognitoUserId
          }));
        }
      }
    }
    if (data.assignedEmail && data.assignedEmail.toLowerCase() !== existingEmployee.email) {
      const { DynamoDBClient: DynamoDBClient2 } = await import("@aws-sdk/client-dynamodb");
      const { DynamoDBDocumentClient: DynamoDBDocumentClient2, QueryCommand: QueryCommand2 } = await import("@aws-sdk/lib-dynamodb");
      const client2 = new DynamoDBClient2({ region: process.env.AWS_REGION || "eu-central-1" });
      const docClient2 = DynamoDBDocumentClient2.from(client2);
      const existingCheck = new QueryCommand2({
        TableName: EMPLOYEES_TABLE,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": data.assignedEmail.toLowerCase()
        }
      });
      const existingResult = await docClient2.send(existingCheck);
      if (existingResult.Items && existingResult.Items.length > 0) {
        return validationErrorResponse(["This company email is already assigned to another employee"]);
      }
      updates.email = data.assignedEmail.toLowerCase();
      if (existingEmployee.cognitoUserId) {
        await cognitoClient.send(new import_client_cognito_identity_provider.AdminUpdateUserAttributesCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: existingEmployee.cognitoUserId,
          UserAttributes: [
            { Name: "custom:assigned_email", Value: data.assignedEmail.toLowerCase() }
          ]
        }));
      }
    }
    if (data.name && existingEmployee.cognitoUserId) {
      await cognitoClient.send(new import_client_cognito_identity_provider.AdminUpdateUserAttributesCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: existingEmployee.cognitoUserId,
        UserAttributes: [
          { Name: "name", Value: sanitizeInput(data.name) }
        ]
      }));
    }
    const updatedEmployee = await updateItem(EMPLOYEES_TABLE, { id: employeeId }, updates);
    return successResponse({
      message: "Employee updated successfully",
      employee: updatedEmployee
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return errorResponse("Failed to update employee", 500, error);
  }
};
var deleteEmployee = async (event) => {
  try {
    const employeeId = event.pathParameters?.id;
    const queryParams = event.queryStringParameters || {};
    const hardDelete = queryParams.hard === "true";
    if (!employeeId) {
      return validationErrorResponse(["Employee ID is required"]);
    }
    const existingEmployee = await getItem(EMPLOYEES_TABLE, { id: employeeId });
    if (!existingEmployee) {
      return errorResponse("Employee not found", 404);
    }
    if (hardDelete) {
      if (existingEmployee.cognitoUserId) {
        try {
          await cognitoClient.send(new import_client_cognito_identity_provider.AdminDeleteUserCommand({
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: existingEmployee.cognitoUserId
          }));
        } catch (cognitoError) {
          console.error("Error deleting Cognito user:", cognitoError);
        }
      }
      await deleteItem(EMPLOYEES_TABLE, { id: employeeId });
      return successResponse({
        message: "Employee permanently deleted"
      });
    } else {
      if (existingEmployee.cognitoUserId) {
        await cognitoClient.send(new import_client_cognito_identity_provider.AdminDisableUserCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: existingEmployee.cognitoUserId
        }));
      }
      const updatedEmployee = await updateItem(EMPLOYEES_TABLE, { id: employeeId }, {
        status: "inactive",
        updatedAt: Date.now()
      });
      return successResponse({
        message: "Employee deactivated successfully",
        employee: updatedEmployee
      });
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    return errorResponse("Failed to delete employee", 500, error);
  }
};
function generateTemporaryPassword() {
  const length = 12;
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const all = lowercase + uppercase + numbers;
  let password = "";
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  for (let i = 3; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  return password.split("").sort(() => Math.random() - 0.5).join("");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployees,
  updateEmployee
});

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

// src/handlers/employee/emails.js
var emails_exports = {};
__export(emails_exports, {
  getEmail: () => getEmail,
  getEmails: () => getEmails,
  sendEmail: () => sendEmail,
  updateEmail: () => updateEmail
});
module.exports = __toCommonJS(emails_exports);

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

// src/handlers/employee/emails.js
var import_client_ssm = require("@aws-sdk/client-ssm");
var import_client_dynamodb3 = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb3 = require("@aws-sdk/lib-dynamodb");

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
var verifyEmailOwnership = (emailRecord, employeeEmail) => {
  if (!emailRecord || !employeeEmail) {
    return false;
  }
  const normalizedEmployeeEmail = employeeEmail.toLowerCase();
  if (emailRecord.ownerEmail?.toLowerCase() === normalizedEmployeeEmail) {
    return true;
  }
  if (emailRecord.from?.email?.toLowerCase() === normalizedEmployeeEmail) {
    return true;
  }
  if (emailRecord.to) {
    const recipients = Array.isArray(emailRecord.to) ? emailRecord.to : [emailRecord.to];
    for (const recipient of recipients) {
      const recipientEmail = typeof recipient === "string" ? recipient : recipient.email;
      if (recipientEmail?.toLowerCase() === normalizedEmployeeEmail) {
        return true;
      }
    }
  }
  return false;
};
var isEmployeeActive = (employee) => {
  return employee && employee.status === "active";
};

// src/handlers/employee/emails.js
var EMAILS_TABLE = process.env.EMAILS_TABLE;
var EMAIL_CONTACTS_TABLE = process.env.EMAIL_CONTACTS_TABLE;
var RESEND_API_KEY_PARAM = process.env.RESEND_API_KEY_PARAM;
var COMPANY_NAME = "Philocom";
var COMPANY_WEBSITE = "https://philocom.co";
var COMPANY_ADDRESS = "Addis Ababa, Ethiopia";
var ADMIN_EMAIL_ADDRESSES = ["info@philocom.co", "support@philocom.co", "admin@philocom.co", "noreply@philocom.co"];
var ssmClient = new import_client_ssm.SSMClient({ region: process.env.AWS_REGION || "eu-central-1" });
var dynamoClient = new import_client_dynamodb3.DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
var docClient3 = import_lib_dynamodb3.DynamoDBDocumentClient.from(dynamoClient);
var createEmailTemplate = (content, subject, senderName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 32px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #e5e7eb;">
              <a href="${COMPANY_WEBSITE}" style="font-size: 24px; font-weight: 700; color: #111827; text-decoration: none;">Philo<span style="color: #0891b2;">com</span></a>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; color: #374151; font-size: 15px; line-height: 1.7;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #18181b; padding: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <a href="https://www.facebook.com/share/1NKm444kyR/" style="color: #a1a1aa; text-decoration: none; margin-right: 20px; font-size: 13px;">Facebook</a>
                    <a href="https://twitter.com/philocom_" style="color: #a1a1aa; text-decoration: none; margin-right: 20px; font-size: 13px;">Twitter</a>
                    <a href="https://www.instagram.com/philo__com" style="color: #a1a1aa; text-decoration: none; margin-right: 20px; font-size: 13px;">Instagram</a>
                    <a href="https://linkedin.com/company/philocom" style="color: #a1a1aa; text-decoration: none; font-size: 13px;">LinkedIn</a>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-bottom: 1px solid #27272a; padding-bottom: 20px;"></td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-top: 20px; padding-bottom: 20px;">
                    <a href="${COMPANY_WEBSITE}/about" style="color: #d4d4d8; text-decoration: none; margin-right: 20px; font-size: 12px;">About Us</a>
                    <a href="${COMPANY_WEBSITE}/careers" style="color: #d4d4d8; text-decoration: none; margin-right: 20px; font-size: 12px;">Careers</a>
                    <a href="${COMPANY_WEBSITE}/privacy" style="color: #d4d4d8; text-decoration: none; margin-right: 20px; font-size: 12px;">Privacy Policy</a>
                    <a href="${COMPANY_WEBSITE}/terms" style="color: #d4d4d8; text-decoration: none; font-size: 12px;">Terms of Service</a>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                      Nile Source Building, 5th Floor, Africa AV / Bole Road, ${COMPANY_ADDRESS}<br>
                      +251 947 447 244
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 11px; color: #52525b;">
                      &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${COMPANY_NAME} Technology. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
var cachedResendApiKey = null;
var cacheExpiry = 0;
var getResendApiKey = async () => {
  const now = Date.now();
  if (cachedResendApiKey && now < cacheExpiry) {
    return cachedResendApiKey;
  }
  const command = new import_client_ssm.GetParameterCommand({
    Name: RESEND_API_KEY_PARAM,
    WithDecryption: true
  });
  const response = await ssmClient.send(command);
  cachedResendApiKey = response.Parameter.Value;
  cacheExpiry = now + 5 * 60 * 1e3;
  return cachedResendApiKey;
};
var sendViaResend = async (emailData, senderEmail, senderName) => {
  const apiKey = await getResendApiKey();
  const htmlContent = createEmailTemplate(emailData.body, emailData.subject, senderName);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `${senderName} - Philocom <${senderEmail}>`,
      to: emailData.to,
      cc: emailData.cc || [],
      subject: emailData.subject,
      html: htmlContent,
      text: emailData.bodyText || stripHtml(emailData.body),
      reply_to: senderEmail,
      headers: emailData.inReplyTo ? {
        "In-Reply-To": emailData.inReplyTo,
        "References": emailData.inReplyTo
      } : void 0
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${error.message || response.statusText}`);
  }
  return response.json();
};
var stripHtml = (html) => {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
};
var generateThreadId = (subject, inReplyTo = null) => {
  if (inReplyTo) {
    return inReplyTo;
  }
  const normalizedSubject = subject.replace(/^(re:|fwd:|fw:)\s*/gi, "").toLowerCase().trim();
  return `thread_${Buffer.from(normalizedSubject).toString("base64").slice(0, 32)}`;
};
var getEmails = async (event) => {
  try {
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }
    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.email) {
      return errorResponse("Employee not found or email not assigned", 403);
    }
    if (!isEmployeeActive(employee)) {
      return errorResponse("Employee account is not active", 403);
    }
    const queryParams = event.queryStringParameters || {};
    const direction = queryParams.direction;
    const limit = parseInt(queryParams.limit) || 50;
    const params = {
      TableName: EMAILS_TABLE,
      IndexName: "OwnerEmailIndex",
      KeyConditionExpression: "ownerEmail = :email",
      ExpressionAttributeValues: {
        ":email": employee.email.toLowerCase()
      },
      ScanIndexForward: false,
      Limit: limit
    };
    if (direction) {
      params.FilterExpression = "direction = :direction";
      params.ExpressionAttributeValues[":direction"] = direction;
    }
    const command = new import_lib_dynamodb3.QueryCommand(params);
    const response = await docClient3.send(command);
    return successResponse({
      emails: response.Items || [],
      count: response.Count,
      lastKey: response.LastEvaluatedKey
    });
  } catch (error) {
    console.error("Error fetching employee emails:", error);
    return errorResponse("Failed to fetch emails", 500, error);
  }
};
var getEmail = async (event) => {
  try {
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }
    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.email) {
      return errorResponse("Employee not found", 403);
    }
    const emailId = event.pathParameters?.id;
    if (!emailId) {
      return validationErrorResponse(["Email ID is required"]);
    }
    const email = await getItem(EMAILS_TABLE, { id: emailId });
    if (!email) {
      return errorResponse("Email not found", 404);
    }
    if (!verifyEmailOwnership(email, employee.email)) {
      return errorResponse("You do not have access to this email", 403);
    }
    if (!email.isRead) {
      await updateItem(EMAILS_TABLE, { id: emailId }, { isRead: true });
      email.isRead = true;
    }
    let threadEmails = [];
    if (email.threadId) {
      const threadCommand = new import_lib_dynamodb3.QueryCommand({
        TableName: EMAILS_TABLE,
        IndexName: "ThreadIndex",
        KeyConditionExpression: "threadId = :threadId",
        FilterExpression: "ownerEmail = :email",
        ExpressionAttributeValues: {
          ":threadId": email.threadId,
          ":email": employee.email.toLowerCase()
        },
        ScanIndexForward: true
      });
      const threadResponse = await docClient3.send(threadCommand);
      threadEmails = threadResponse.Items || [];
    }
    return successResponse({
      email,
      thread: threadEmails
    });
  } catch (error) {
    console.error("Error fetching employee email:", error);
    return errorResponse("Failed to fetch email", 500, error);
  }
};
var sendEmail = async (event) => {
  try {
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }
    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.email) {
      return errorResponse("Employee not found", 403);
    }
    if (!isEmployeeActive(employee)) {
      return errorResponse("Employee account is not active", 403);
    }
    const data = JSON.parse(event.body);
    const errors = [];
    if (!data.to || Array.isArray(data.to) && data.to.length === 0) {
      errors.push("Recipient (to) is required");
    }
    if (!data.subject) {
      errors.push("Subject is required");
    }
    if (!data.body) {
      errors.push("Email body is required");
    }
    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }
    const toRecipients = Array.isArray(data.to) ? data.to : [data.to];
    const ccRecipients = data.cc ? Array.isArray(data.cc) ? data.cc : [data.cc] : [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of toRecipients) {
      if (!emailRegex.test(email)) {
        return validationErrorResponse([`Invalid email address: ${email}`]);
      }
    }
    for (const email of ccRecipients) {
      if (!emailRegex.test(email)) {
        return validationErrorResponse([`Invalid CC email address: ${email}`]);
      }
    }
    const threadId = generateThreadId(data.subject, data.inReplyTo);
    const emailData = {
      to: toRecipients,
      cc: ccRecipients,
      subject: sanitizeInput(data.subject),
      body: data.body,
      bodyText: data.bodyText || stripHtml(data.body),
      inReplyTo: data.inReplyTo || null
    };
    const resendResponse = await sendViaResend(emailData, employee.email, employee.name);
    const templatedBody = createEmailTemplate(emailData.body, emailData.subject, employee.name);
    const sentEmail = {
      id: v4_default(),
      threadId,
      direction: "outbound",
      ownerEmail: employee.email.toLowerCase(),
      from: { email: employee.email, name: employee.name },
      to: toRecipients.map((email) => ({ email, name: email.split("@")[0] })),
      cc: ccRecipients.map((email) => ({ email, name: email.split("@")[0] })),
      subject: emailData.subject,
      body: templatedBody,
      bodyText: emailData.bodyText,
      status: "sent",
      isRead: true,
      isStarred: false,
      labels: [],
      messageId: resendResponse.id,
      inReplyTo: data.inReplyTo || null,
      sentBy: employee.id || employee.email,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await putItem(EMAILS_TABLE, sentEmail);
    const allRecipients = [...toRecipients, ...ccRecipients];
    const adminRecipients = allRecipients.filter(
      (email) => ADMIN_EMAIL_ADDRESSES.includes(email.toLowerCase())
    );
    if (adminRecipients.length > 0) {
      const adminInboundEmail = {
        id: v4_default(),
        threadId,
        direction: "inbound",
        ownerEmail: "__admin__",
        // Special marker for admin panel emails
        from: { email: employee.email, name: employee.name },
        to: toRecipients.map((email) => ({ email, name: email.split("@")[0] })),
        cc: ccRecipients.map((email) => ({ email, name: email.split("@")[0] })),
        subject: emailData.subject,
        body: templatedBody,
        bodyText: emailData.bodyText,
        status: "received",
        isRead: false,
        isStarred: false,
        labels: ["internal"],
        messageId: `internal-${resendResponse.id}`,
        inReplyTo: data.inReplyTo || null,
        sentBy: employee.id || employee.email,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await putItem(EMAILS_TABLE, adminInboundEmail);
      console.log("Created inbound copy for admin panel:", adminInboundEmail.id);
    }
    for (const recipient of toRecipients) {
      try {
        await updateItem(EMAIL_CONTACTS_TABLE, { email: recipient }, {
          lastContactedAt: Date.now()
        });
      } catch (err) {
        await putItem(EMAIL_CONTACTS_TABLE, {
          email: recipient,
          name: recipient.split("@")[0],
          lastContactedAt: Date.now(),
          createdAt: Date.now()
        });
      }
    }
    return successResponse({
      message: "Email sent successfully",
      emailId: sentEmail.id,
      resendId: resendResponse.id,
      adminCopy: adminRecipients.length > 0
    }, 201);
  } catch (error) {
    console.error("Error sending employee email:", error);
    return errorResponse("Failed to send email", 500, error);
  }
};
var updateEmail = async (event) => {
  try {
    const accessCheck = validateEmployeeAccess(event);
    if (!accessCheck.isValid) {
      return errorResponse(accessCheck.error, 403);
    }
    const employee = await getEmployeeFromEvent(event);
    if (!employee || !employee.email) {
      return errorResponse("Employee not found", 403);
    }
    const emailId = event.pathParameters?.id;
    const data = JSON.parse(event.body);
    if (!emailId) {
      return validationErrorResponse(["Email ID is required"]);
    }
    const email = await getItem(EMAILS_TABLE, { id: emailId });
    if (!email) {
      return errorResponse("Email not found", 404);
    }
    if (!verifyEmailOwnership(email, employee.email)) {
      return errorResponse("You do not have access to this email", 403);
    }
    const allowedFields = ["isRead", "isStarred"];
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
    const updatedEmail = await updateItem(EMAILS_TABLE, { id: emailId }, updates);
    return successResponse({
      message: "Email updated successfully",
      email: updatedEmail
    });
  } catch (error) {
    console.error("Error updating employee email:", error);
    return errorResponse("Failed to update email", 500, error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getEmail,
  getEmails,
  sendEmail,
  updateEmail
});

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

// src/handlers/webhook/email.js
var email_exports = {};
__export(email_exports, {
  handleIncoming: () => handleIncoming
});
module.exports = __toCommonJS(email_exports);

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

// src/handlers/webhook/email.js
var import_client_ssm = require("@aws-sdk/client-ssm");
var import_crypto = require("crypto");

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

// src/handlers/webhook/email.js
var import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");
var EMAILS_TABLE = process.env.EMAILS_TABLE;
var EMAIL_CONTACTS_TABLE = process.env.EMAIL_CONTACTS_TABLE;
var EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;
var WEBHOOK_SECRET_PARAM = process.env.WEBHOOK_SECRET_PARAM || "/philocom/webhook-secret";
var RESEND_API_KEY_PARAM = process.env.RESEND_API_KEY_PARAM || "/philocom/resend-api-key";
var ssmClient = new import_client_ssm.SSMClient({ region: process.env.AWS_REGION || "eu-central-1" });
var dynamoClient = new import_client_dynamodb2.DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
var docClient2 = import_lib_dynamodb2.DynamoDBDocumentClient.from(dynamoClient);
var cachedResendApiKey = null;
var resendKeyCacheExpiry = 0;
var cachedWebhookSecret = null;
var cacheExpiry = 0;
var getWebhookSecret = async () => {
  const now = Date.now();
  if (cachedWebhookSecret && now < cacheExpiry) {
    return cachedWebhookSecret;
  }
  try {
    const command = new import_client_ssm.GetParameterCommand({
      Name: WEBHOOK_SECRET_PARAM,
      WithDecryption: true
    });
    const response = await ssmClient.send(command);
    cachedWebhookSecret = response.Parameter.Value;
    cacheExpiry = now + 5 * 60 * 1e3;
    return cachedWebhookSecret;
  } catch (error) {
    console.error("Failed to get webhook secret from SSM:", error);
    return null;
  }
};
var getResendApiKey = async () => {
  const now = Date.now();
  if (cachedResendApiKey && now < resendKeyCacheExpiry) {
    return cachedResendApiKey;
  }
  try {
    const command = new import_client_ssm.GetParameterCommand({
      Name: RESEND_API_KEY_PARAM,
      WithDecryption: true
    });
    const response = await ssmClient.send(command);
    cachedResendApiKey = response.Parameter.Value;
    resendKeyCacheExpiry = now + 5 * 60 * 1e3;
    return cachedResendApiKey;
  } catch (error) {
    console.error("Failed to get Resend API key from SSM:", error);
    return null;
  }
};
var fetchEmailContent = async (emailId) => {
  try {
    const apiKey = await getResendApiKey();
    if (!apiKey) {
      console.warn("No Resend API key available");
      return null;
    }
    const response = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch email from Resend:", response.status, errorText);
      return null;
    }
    const emailData = await response.json();
    console.log("Fetched email content from Resend:", {
      hasHtml: !!emailData.html,
      hasText: !!emailData.text,
      htmlLength: emailData.html?.length || 0,
      textLength: emailData.text?.length || 0
    });
    return emailData;
  } catch (error) {
    console.error("Error fetching email content from Resend:", error);
    return null;
  }
};
var verifySvixSignature = (payload, headers, secret) => {
  try {
    const svixId = headers["svix-id"] || headers["Svix-Id"];
    const svixTimestamp = headers["svix-timestamp"] || headers["Svix-Timestamp"];
    const svixSignature = headers["svix-signature"] || headers["Svix-Signature"];
    if (!svixId || !svixTimestamp || !svixSignature || !secret) {
      console.log("Missing Svix headers or secret", { svixId: !!svixId, svixTimestamp: !!svixTimestamp, svixSignature: !!svixSignature, secret: !!secret });
      return false;
    }
    const timestamp = parseInt(svixTimestamp, 10);
    const now = Math.floor(Date.now() / 1e3);
    if (Math.abs(now - timestamp) > 300) {
      console.warn("Svix timestamp too old or in future", { timestamp, now, diff: now - timestamp });
      return false;
    }
    const signedPayload = `${svixId}.${svixTimestamp}.${payload}`;
    const secretKey = secret.startsWith("whsec_") ? secret.slice(6) : secret;
    const secretBytes = Buffer.from(secretKey, "base64");
    const expectedSignature = (0, import_crypto.createHmac)("sha256", secretBytes).update(signedPayload).digest("base64");
    const signatures = svixSignature.split(" ");
    for (const sig of signatures) {
      const [version, signatureValue] = sig.split(",");
      if (version === "v1" && signatureValue) {
        try {
          const sigBuffer = Buffer.from(signatureValue, "base64");
          const expectedBuffer = Buffer.from(expectedSignature, "base64");
          if (sigBuffer.length === expectedBuffer.length && (0, import_crypto.timingSafeEqual)(sigBuffer, expectedBuffer)) {
            return true;
          }
        } catch (e) {
        }
      }
    }
    console.warn("Svix signature mismatch", { expectedSignature, receivedSignatures: signatures });
    return false;
  } catch (error) {
    console.error("Error verifying Svix signature:", error);
    return false;
  }
};
var parseEmailAddress = (emailString) => {
  if (!emailString) return { email: "", name: "" };
  const match = emailString.match(/^(?:(.+?)\s*<)?([^<>]+@[^<>]+)>?$/);
  if (match) {
    return {
      name: match[1]?.trim() || match[2].split("@")[0],
      email: match[2].trim().toLowerCase()
    };
  }
  return { email: emailString.toLowerCase(), name: emailString.split("@")[0] };
};
var parseEmailAddresses = (emailString) => {
  if (!emailString) return [];
  return emailString.split(",").map((e) => parseEmailAddress(e.trim()));
};
var parseRawEmail = (rawEmail) => {
  const result = {
    headers: {},
    bodyHtml: "",
    bodyText: "",
    attachments: []
  };
  try {
    const headerBodySplit = rawEmail.indexOf("\r\n\r\n");
    if (headerBodySplit === -1) {
      result.bodyText = rawEmail;
      return result;
    }
    const headerSection = rawEmail.substring(0, headerBodySplit);
    const bodySection = rawEmail.substring(headerBodySplit + 4);
    const headerLines = headerSection.split("\r\n");
    let currentHeader = "";
    for (const line of headerLines) {
      if (line.startsWith(" ") || line.startsWith("	")) {
        currentHeader += " " + line.trim();
      } else {
        if (currentHeader) {
          const colonIndex = currentHeader.indexOf(":");
          if (colonIndex > 0) {
            const name = currentHeader.substring(0, colonIndex).toLowerCase();
            const value = currentHeader.substring(colonIndex + 1).trim();
            result.headers[name] = value;
          }
        }
        currentHeader = line;
      }
    }
    if (currentHeader) {
      const colonIndex = currentHeader.indexOf(":");
      if (colonIndex > 0) {
        const name = currentHeader.substring(0, colonIndex).toLowerCase();
        const value = currentHeader.substring(colonIndex + 1).trim();
        result.headers[name] = value;
      }
    }
    const contentType = result.headers["content-type"] || "";
    if (contentType.includes("multipart/")) {
      const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/);
      if (boundaryMatch) {
        const boundary = boundaryMatch[1];
        const parts = bodySection.split("--" + boundary);
        for (const part of parts) {
          if (part.includes("text/plain")) {
            const textStart = part.indexOf("\r\n\r\n");
            if (textStart > 0) {
              result.bodyText = part.substring(textStart + 4).trim();
            }
          } else if (part.includes("text/html")) {
            const htmlStart = part.indexOf("\r\n\r\n");
            if (htmlStart > 0) {
              result.bodyHtml = part.substring(htmlStart + 4).trim();
            }
          }
        }
      }
    } else if (contentType.includes("text/html")) {
      result.bodyHtml = bodySection;
    } else {
      result.bodyText = bodySection;
    }
    if (!result.bodyHtml && result.bodyText) {
      result.bodyHtml = `<pre>${result.bodyText}</pre>`;
    }
    if (!result.bodyText && result.bodyHtml) {
      result.bodyText = result.bodyHtml.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "").trim();
    }
  } catch (err) {
    console.error("Error parsing raw email:", err);
    result.bodyText = rawEmail;
    result.bodyHtml = `<pre>${rawEmail}</pre>`;
  }
  return result;
};
var generateThreadId = (subject, inReplyTo = null) => {
  if (inReplyTo) {
    return inReplyTo;
  }
  const normalizedSubject = (subject || "").replace(/^(re:|fwd:|fw:)\s*/gi, "").toLowerCase().trim();
  return `thread_${Buffer.from(normalizedSubject).toString("base64").slice(0, 32)}`;
};
var getEmployeeByEmail = async (email) => {
  if (!email || !EMPLOYEES_TABLE) return null;
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
var findMatchingEmployees = async (emailAddresses) => {
  const employees = [];
  for (const addr of emailAddresses) {
    const email = typeof addr === "string" ? addr : addr.email;
    if (email) {
      const employee = await getEmployeeByEmail(email);
      if (employee && employee.status === "active") {
        employees.push(employee);
      }
    }
  }
  return employees;
};
var checkDuplicateByMessageId = async (messageId, ownerEmail) => {
  if (!messageId || !ownerEmail) return false;
  try {
    const command = new import_lib_dynamodb2.ScanCommand({
      TableName: EMAILS_TABLE,
      FilterExpression: "messageId = :messageId AND ownerEmail = :ownerEmail",
      ExpressionAttributeValues: {
        ":messageId": messageId,
        ":ownerEmail": ownerEmail
      },
      Limit: 1,
      ConsistentRead: true
      // Ensure we see recently created items
    });
    const response = await docClient2.send(command);
    return response.Items && response.Items.length > 0;
  } catch (error) {
    console.error("Error checking for duplicate email:", error);
    return false;
  }
};
var checkAdminDuplicate = async (messageId, subject, fromEmail) => {
  if (!subject || !fromEmail) return false;
  try {
    if (messageId) {
      const exactMatch = await checkDuplicateByMessageId(messageId, "__admin__");
      if (exactMatch) {
        console.log("Admin duplicate found by exact messageId:", messageId);
        return true;
      }
      const internalMatch = await checkDuplicateByMessageId(`internal-${messageId}`, "__admin__");
      if (internalMatch) {
        console.log("Admin duplicate found by internal- prefix:", messageId);
        return true;
      }
    }
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1e3;
    const command = new import_lib_dynamodb2.ScanCommand({
      TableName: EMAILS_TABLE,
      FilterExpression: "ownerEmail = :owner AND #subj = :subject AND #from.#email = :fromEmail AND createdAt > :minTime",
      ExpressionAttributeNames: {
        "#subj": "subject",
        "#from": "from",
        "#email": "email"
      },
      ExpressionAttributeValues: {
        ":owner": "__admin__",
        ":subject": subject,
        ":fromEmail": fromEmail.toLowerCase(),
        ":minTime": fiveMinutesAgo
      },
      Limit: 100
    });
    const response = await docClient2.send(command);
    console.log("Duplicate check scan result:", { itemCount: response.Items?.length || 0, subject, fromEmail });
    if (response.Items && response.Items.length > 0) {
      console.log("Admin duplicate found by subject+sender:", { subject, fromEmail });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking for admin duplicate:", error);
    return false;
  }
};
var handleIncoming = async (event) => {
  try {
    const body = event.body;
    const webhookSecret = await getWebhookSecret();
    const hasSvixHeaders = event.headers["svix-signature"] || event.headers["Svix-Signature"];
    const legacySecret = event.headers["x-webhook-secret"] || event.headers["X-Webhook-Secret"];
    console.log("Webhook headers:", {
      hasSvixHeaders: !!hasSvixHeaders,
      hasLegacySecret: !!legacySecret,
      hasWebhookSecret: !!webhookSecret
    });
    if (hasSvixHeaders) {
      if (webhookSecret && !verifySvixSignature(body, event.headers, webhookSecret)) {
        console.warn("Invalid Svix webhook signature");
        return errorResponse("Unauthorized", 401);
      }
      console.log("Svix signature verified successfully");
    } else if (legacySecret) {
      if (webhookSecret && legacySecret !== webhookSecret) {
        console.warn("Invalid legacy webhook secret");
        return errorResponse("Unauthorized", 401);
      }
    } else {
      console.log("No webhook authentication provided");
    }
    const data = JSON.parse(body);
    console.log("Received email webhook:", {
      type: data.type,
      from: data.from || data.data?.from,
      to: data.to || data.data?.to,
      subject: data.subject || data.data?.subject
    });
    if (data.data) {
      console.log("Resend payload data keys:", Object.keys(data.data));
      console.log("Resend payload data:", JSON.stringify(data.data, null, 2).slice(0, 2e3));
    }
    let emailData;
    if (data.type === "email.received" && data.data) {
      const emailId = data.data.email_id;
      let fullEmail = null;
      if (emailId) {
        console.log("Fetching full email content from Resend API for:", emailId);
        fullEmail = await fetchEmailContent(emailId);
      }
      emailData = {
        from: data.data.from,
        to: data.data.to,
        cc: data.data.cc,
        subject: data.data.subject,
        html: fullEmail?.html || data.data.html || data.data.body || "",
        text: fullEmail?.text || data.data.text || "",
        messageId: emailId || data.data.id,
        headers: data.data.headers || {}
      };
      console.log("Parsed email data:", {
        hasHtml: !!emailData.html,
        htmlLength: emailData.html?.length || 0,
        hasText: !!emailData.text,
        textLength: emailData.text?.length || 0,
        fetchedFromApi: !!fullEmail
      });
    } else {
      emailData = data;
    }
    let parsedEmail = {
      headers: emailData.headers || {},
      bodyHtml: "",
      bodyText: "",
      attachments: []
    };
    if (emailData.rawEmail) {
      parsedEmail = parseRawEmail(emailData.rawEmail);
    } else {
      parsedEmail.bodyHtml = emailData.html || emailData.body || "";
      parsedEmail.bodyText = emailData.text || emailData.bodyText || "";
    }
    const fromParsed = parseEmailAddress(emailData.from);
    const toParsed = parseEmailAddresses(Array.isArray(emailData.to) ? emailData.to.join(", ") : emailData.to);
    const ccParsed = parseEmailAddresses(Array.isArray(emailData.cc) ? emailData.cc.join(", ") : emailData.cc);
    const messageId = parsedEmail.headers["message-id"] || emailData.messageId || v4_default();
    const inReplyTo = parsedEmail.headers["in-reply-to"] || emailData.inReplyTo || null;
    const subject = parsedEmail.headers["subject"] || emailData.subject || "(No Subject)";
    const threadId = generateThreadId(subject, inReplyTo);
    const allRecipients = [...toParsed, ...ccParsed];
    const matchingEmployees = await findMatchingEmployees(allRecipients);
    console.log("Matching employees found:", matchingEmployees.length);
    const baseEmailRecord = {
      threadId,
      direction: "inbound",
      from: fromParsed,
      to: toParsed,
      cc: ccParsed,
      subject,
      body: parsedEmail.bodyHtml || `<pre>${parsedEmail.bodyText}</pre>`,
      bodyText: parsedEmail.bodyText,
      attachments: parsedEmail.attachments,
      status: "received",
      isRead: false,
      isStarred: false,
      labels: [],
      messageId,
      inReplyTo,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    let employeeCopiesCreated = 0;
    if (matchingEmployees.length > 0) {
      for (const employee of matchingEmployees) {
        const isDuplicate = await checkDuplicateByMessageId(messageId, employee.email.toLowerCase());
        if (isDuplicate) {
          console.log("Skipping duplicate email for employee:", employee.email, messageId);
          continue;
        }
        const employeeEmailRecord = {
          ...baseEmailRecord,
          id: v4_default(),
          ownerEmail: employee.email.toLowerCase()
        };
        await putItem(EMAILS_TABLE, employeeEmailRecord);
        console.log("Email stored for employee:", employee.email, employeeEmailRecord.id);
        employeeCopiesCreated++;
      }
    }
    const senderIsEmployee = await getEmployeeByEmail(fromParsed.email);
    let adminEmailId = null;
    let adminDuplicateExists = false;
    if (senderIsEmployee) {
      console.log("Sender is employee, skipping admin copy (employee handler creates it):", fromParsed.email);
      adminDuplicateExists = true;
    } else if (matchingEmployees.length > 0) {
      console.log("Email is to employees, skipping admin inbox copy (admin has sent copy)");
      adminDuplicateExists = true;
    } else {
      adminDuplicateExists = await checkAdminDuplicate(messageId, subject, fromParsed.email);
      if (adminDuplicateExists) {
        console.log("Skipping duplicate admin email for messageId:", messageId);
      } else {
        const adminEmailRecord = {
          ...baseEmailRecord,
          id: v4_default(),
          ownerEmail: "__admin__"
          // Special marker for admin panel emails
        };
        await putItem(EMAILS_TABLE, adminEmailRecord);
        adminEmailId = adminEmailRecord.id;
        console.log("Created admin inbox copy:", adminEmailId);
      }
    }
    const existingContact = await getItem(EMAIL_CONTACTS_TABLE, { email: fromParsed.email });
    if (existingContact) {
      await updateItem(EMAIL_CONTACTS_TABLE, { email: fromParsed.email }, {
        lastContactedAt: Date.now(),
        name: fromParsed.name || existingContact.name
      });
    } else {
      await putItem(EMAIL_CONTACTS_TABLE, {
        email: fromParsed.email,
        name: fromParsed.name,
        company: null,
        phone: null,
        notes: "",
        tags: ["inbox"],
        lastContactedAt: Date.now(),
        createdAt: Date.now()
      });
    }
    console.log("Email processing complete:", { adminEmailId, employeeCopiesCreated, messageId });
    return successResponse({
      message: "Email received and stored",
      emailId: adminEmailId,
      employeeCopies: employeeCopiesCreated,
      deduplicated: adminDuplicateExists
    }, 201);
  } catch (error) {
    console.error("Error handling incoming email:", error);
    return errorResponse("Failed to process email", 500, error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handleIncoming
});

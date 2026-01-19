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

// src/handlers/contact.js
var contact_exports = {};
__export(contact_exports, {
  handleContact: () => handleContact
});
module.exports = __toCommonJS(contact_exports);

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

// src/utils/db.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var putItem = async (tableName, item) => {
  const command = new import_lib_dynamodb.PutCommand({
    TableName: tableName,
    Item: item
  });
  await docClient.send(command);
  return item;
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
var validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
var validateRequired = (value, fieldName) => {
  if (!value || typeof value === "string" && value.trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
};
var validateLength = (value, fieldName, min, max) => {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (max && value.length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  return null;
};
var validateContactForm = (data) => {
  const errors = [];
  const nameError = validateRequired(data.name, "Name");
  if (nameError) errors.push(nameError);
  else {
    const lengthError = validateLength(data.name, "Name", 2, 100);
    if (lengthError) errors.push(lengthError);
  }
  const emailError = validateRequired(data.email, "Email");
  if (emailError) errors.push(emailError);
  else if (!validateEmail(data.email)) {
    errors.push("Invalid email format");
  }
  const messageError = validateRequired(data.message, "Message");
  if (messageError) errors.push(messageError);
  else {
    const lengthError = validateLength(data.message, "Message", 10, 1e3);
    if (lengthError) errors.push(lengthError);
  }
  return errors;
};
var sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.replace(/<script[^>]*>.*?<\/script>/gi, "").replace(/<[^>]+>/g, "").trim();
};

// src/utils/email.js
var import_client_ses = require("@aws-sdk/client-ses");
var sesClient = new import_client_ses.SESClient({ region: process.env.AWS_REGION || "eu-central-1" });
var SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@philocom.co";
var ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@philocom.co";
var sendContactNotification = async (contactData) => {
  const params = {
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [ADMIN_EMAIL]
    },
    Message: {
      Subject: {
        Data: `New Contact Form Submission from ${contactData.name}`,
        Charset: "UTF-8"
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #555; }
                .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #667eea; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>\u{1F389} New Contact Form Submission</h2>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${contactData.name}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value">${contactData.email}</div>
                  </div>
                  ${contactData.phone ? `
                    <div class="field">
                      <div class="label">Phone:</div>
                      <div class="value">${contactData.phone}</div>
                    </div>
                  ` : ""}
                  ${contactData.company ? `
                    <div class="field">
                      <div class="label">Company:</div>
                      <div class="value">${contactData.company}</div>
                    </div>
                  ` : ""}
                  <div class="field">
                    <div class="label">Message:</div>
                    <div class="value">${contactData.message}</div>
                  </div>
                  <div class="field">
                    <div class="label">Submitted At:</div>
                    <div class="value">${new Date(contactData.submittedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
          Charset: "UTF-8"
        }
      }
    }
  };
  try {
    const command = new import_client_ses.SendEmailCommand(params);
    await sesClient.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// src/handlers/contact.js
var CONTACTS_TABLE = process.env.CONTACTS_TABLE;
var handleContact = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const errors = validateContactForm(data);
    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }
    const contactData = {
      id: v4_default(),
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      phone: data.phone ? sanitizeInput(data.phone) : null,
      company: data.company ? sanitizeInput(data.company) : null,
      message: sanitizeInput(data.message),
      submittedAt: Date.now(),
      status: "new",
      // TTL: Auto-delete after 90 days (optional)
      ttl: Math.floor(Date.now() / 1e3) + 90 * 24 * 60 * 60
    };
    await putItem(CONTACTS_TABLE, contactData);
    sendContactNotification(contactData).catch((err) => {
      console.error("Failed to send email notification:", err);
    });
    return successResponse({
      message: "Thank you for contacting us! We will get back to you soon.",
      submissionId: contactData.id
    }, 201);
  } catch (error) {
    console.error("Error handling contact submission:", error);
    return errorResponse("Failed to process your request. Please try again.", 500, error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handleContact
});

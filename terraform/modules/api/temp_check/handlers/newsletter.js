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

// src/handlers/newsletter.js
var newsletter_exports = {};
__export(newsletter_exports, {
  handleNewsletter: () => handleNewsletter
});
module.exports = __toCommonJS(newsletter_exports);

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
var validateNewsletterSubscription = (data) => {
  const errors = [];
  const emailError = validateRequired(data.email, "Email");
  if (emailError) errors.push(emailError);
  else if (!validateEmail(data.email)) {
    errors.push("Invalid email format");
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
var sendNewsletterWelcome = async (email) => {
  const params = {
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: "Welcome to Philocom Newsletter! \u{1F680}",
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
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px; }
                .cta-button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>\u{1F389} Welcome to Philocom!</h1>
                </div>
                <div class="content">
                  <h2>Thank you for subscribing! </h2>
                  <p>We're excited to have you join our community. You'll receive updates about:</p>
                  <ul>
                    <li>\u{1F680} Latest technology innovations</li>
                    <li>\u{1F4A1} Industry insights and best practices</li>
                    <li>\u{1F510} Cybersecurity tips and alerts</li>
                    <li>\u{1F4F1} New product launches</li>
                  </ul>
                  <p>Stay tuned for amazing content!</p>
                  <a href="https://philocom.co" class="cta-button">Visit Our Website</a>
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
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

// src/handlers/newsletter.js
var NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE;
var handleNewsletter = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const errors = validateNewsletterSubscription(data);
    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }
    const email = sanitizeInput(data.email).toLowerCase();
    const existing = await getItem(NEWSLETTER_TABLE, { email });
    if (existing) {
      if (existing.status === "active") {
        return successResponse({
          message: "You are already subscribed to our newsletter!"
        });
      }
    }
    const subscription = {
      email,
      subscribedAt: Date.now(),
      status: "active",
      source: data.source || "website",
      preferences: data.preferences || {}
    };
    await putItem(NEWSLETTER_TABLE, subscription);
    sendNewsletterWelcome(email).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
    return successResponse({
      message: "Successfully subscribed! Check your email for confirmation.",
      email
    }, 201);
  } catch (error) {
    console.error("Error handling newsletter subscription:", error);
    return errorResponse("Failed to process subscription. Please try again.", 500, error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handleNewsletter
});

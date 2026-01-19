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

// src/handlers/blog.js
var blog_exports = {};
__export(blog_exports, {
  createBlogPost: () => createBlogPost,
  getBlogPostById: () => getBlogPostById,
  getBlogPosts: () => getBlogPosts
});
module.exports = __toCommonJS(blog_exports);

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
var scanTable = async (tableName, filters = {}) => {
  const command = new import_lib_dynamodb.ScanCommand({
    TableName: tableName,
    ...filters
  });
  const response = await docClient.send(command);
  return response.Items || [];
};
var queryTable = async (tableName, keyConditionExpression, expressionAttributeValues) => {
  const command = new import_lib_dynamodb.QueryCommand({
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues
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

// src/handlers/blog.js
var BLOG_POSTS_TABLE = process.env.BLOG_POSTS_TABLE;
var getBlogPosts = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const category = queryParams.category;
    const limit = parseInt(queryParams.limit) || 10;
    let blogPosts;
    if (category) {
      blogPosts = await queryTable(
        BLOG_POSTS_TABLE,
        "category = :category",
        { ":category": category }
      );
    } else {
      blogPosts = await scanTable(BLOG_POSTS_TABLE);
    }
    blogPosts = blogPosts.filter((post) => post.status === "published");
    blogPosts.sort((a, b) => b.publishedAt - a.publishedAt);
    blogPosts = blogPosts.slice(0, limit);
    return successResponse({
      posts: blogPosts,
      count: blogPosts.length
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return errorResponse("Failed to fetch blog posts", 500, error);
  }
};
var getBlogPostById = async (event) => {
  try {
    const { id } = event.pathParameters;
    const post = await getItem(BLOG_POSTS_TABLE, { id });
    if (!post || post.status !== "published") {
      return errorResponse("Blog post not found", 404);
    }
    return successResponse({ post });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return errorResponse("Failed to fetch blog post", 500, error);
  }
};
var createBlogPost = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const post = {
      id: v4_default(),
      ...data,
      publishedAt: data.status === "published" ? Date.now() : null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await putItem(BLOG_POSTS_TABLE, post);
    return successResponse({ post }, 201);
  } catch (error) {
    console.error("Error creating blog post:", error);
    return errorResponse("Failed to create blog post", 500, error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createBlogPost,
  getBlogPostById,
  getBlogPosts
});

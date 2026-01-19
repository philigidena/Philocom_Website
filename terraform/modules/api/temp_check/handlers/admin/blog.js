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

// src/handlers/admin/blog.js
var blog_exports = {};
__export(blog_exports, {
  createPost: () => createPost,
  deletePost: () => deletePost,
  getPost: () => getPost,
  getPosts: () => getPosts,
  updatePost: () => updatePost
});
module.exports = __toCommonJS(blog_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var import_crypto = require("crypto");
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var BLOG_POSTS_TABLE = process.env.BLOG_POSTS_TABLE;
var CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
var headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};
var getPosts = async (event) => {
  try {
    const result = await docClient.send(
      new import_lib_dynamodb.ScanCommand({
        TableName: BLOG_POSTS_TABLE
      })
    );
    const posts = (result.Items || []).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: posts,
        count: posts.length
      })
    };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch blog posts"
      })
    };
  }
};
var getPost = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Post ID is required"
        })
      };
    }
    const result = await docClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: BLOG_POSTS_TABLE,
        Key: { id }
      })
    );
    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Blog post not found"
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
    console.error("Error fetching blog post:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch blog post"
      })
    };
  }
};
var createPost = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { title, content, excerpt, category, tags, image, author, status } = body;
    if (!title || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Title and content are required"
        })
      };
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const post = {
      id: (0, import_crypto.randomUUID)(),
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 160) + "...",
      category: category || "General",
      tags: tags || [],
      image: image || "",
      author: author || "Admin",
      status: status || "draft",
      views: 0,
      publishedAt: status === "published" ? Date.now() : null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await docClient.send(
      new import_lib_dynamodb.PutCommand({
        TableName: BLOG_POSTS_TABLE,
        Item: post
      })
    );
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data: post,
        message: "Blog post created successfully"
      })
    };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to create blog post"
      })
    };
  }
};
var updatePost = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || "{}");
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Post ID is required"
        })
      };
    }
    const existing = await docClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: BLOG_POSTS_TABLE,
        Key: { id }
      })
    );
    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Blog post not found"
        })
      };
    }
    const { title, content, excerpt, category, tags, image, author, status } = body;
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    if (title !== void 0) {
      updateExpressions.push("#title = :title");
      expressionAttributeNames["#title"] = "title";
      expressionAttributeValues[":title"] = title;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      updateExpressions.push("#slug = :slug");
      expressionAttributeNames["#slug"] = "slug";
      expressionAttributeValues[":slug"] = slug;
    }
    if (content !== void 0) {
      updateExpressions.push("#content = :content");
      expressionAttributeNames["#content"] = "content";
      expressionAttributeValues[":content"] = content;
    }
    if (excerpt !== void 0) {
      updateExpressions.push("#excerpt = :excerpt");
      expressionAttributeNames["#excerpt"] = "excerpt";
      expressionAttributeValues[":excerpt"] = excerpt;
    }
    if (category !== void 0) {
      updateExpressions.push("#category = :category");
      expressionAttributeNames["#category"] = "category";
      expressionAttributeValues[":category"] = category;
    }
    if (tags !== void 0) {
      updateExpressions.push("#tags = :tags");
      expressionAttributeNames["#tags"] = "tags";
      expressionAttributeValues[":tags"] = tags;
    }
    if (image !== void 0) {
      updateExpressions.push("#image = :image");
      expressionAttributeNames["#image"] = "image";
      expressionAttributeValues[":image"] = image;
    }
    if (author !== void 0) {
      updateExpressions.push("#author = :author");
      expressionAttributeNames["#author"] = "author";
      expressionAttributeValues[":author"] = author;
    }
    if (status !== void 0) {
      updateExpressions.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = status;
      if (status === "published" && !existing.Item.publishedAt) {
        updateExpressions.push("#publishedAt = :publishedAt");
        expressionAttributeNames["#publishedAt"] = "publishedAt";
        expressionAttributeValues[":publishedAt"] = Date.now();
      }
    }
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = Date.now();
    const result = await docClient.send(
      new import_lib_dynamodb.UpdateCommand({
        TableName: BLOG_POSTS_TABLE,
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
        message: "Blog post updated successfully"
      })
    };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to update blog post"
      })
    };
  }
};
var deletePost = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Post ID is required"
        })
      };
    }
    const existing = await docClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: BLOG_POSTS_TABLE,
        Key: { id }
      })
    );
    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Blog post not found"
        })
      };
    }
    await docClient.send(
      new import_lib_dynamodb.DeleteCommand({
        TableName: BLOG_POSTS_TABLE,
        Key: { id }
      })
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Blog post deleted successfully"
      })
    };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to delete blog post"
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost
});

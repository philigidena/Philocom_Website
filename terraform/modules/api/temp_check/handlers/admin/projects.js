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

// src/handlers/admin/projects.js
var projects_exports = {};
__export(projects_exports, {
  createProject: () => createProject,
  deleteProject: () => deleteProject,
  getProject: () => getProject,
  getProjects: () => getProjects,
  updateProject: () => updateProject
});
module.exports = __toCommonJS(projects_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var import_crypto = require("crypto");
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var PROJECTS_TABLE = process.env.PROJECTS_TABLE;
var CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
var headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};
var getProjects = async (event) => {
  try {
    const result = await docClient.send(
      new import_lib_dynamodb.ScanCommand({
        TableName: PROJECTS_TABLE
      })
    );
    const projects = (result.Items || []).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: projects,
        count: projects.length
      })
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch projects"
      })
    };
  }
};
var getProject = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Project ID is required"
        })
      };
    }
    const result = await docClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: PROJECTS_TABLE,
        Key: { id }
      })
    );
    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Project not found"
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
    console.error("Error fetching project:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch project"
      })
    };
  }
};
var createProject = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { title, description, category, technologies, link, image, featured, status } = body;
    if (!title || !description) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Title and description are required"
        })
      };
    }
    const project = {
      id: (0, import_crypto.randomUUID)(),
      title,
      description,
      category: category || "Web Development",
      technologies: technologies || [],
      link: link || "",
      image: image || "",
      featured: featured || false,
      status: status || "published",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await docClient.send(
      new import_lib_dynamodb.PutCommand({
        TableName: PROJECTS_TABLE,
        Item: project
      })
    );
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data: project,
        message: "Project created successfully"
      })
    };
  } catch (error) {
    console.error("Error creating project:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to create project"
      })
    };
  }
};
var updateProject = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || "{}");
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Project ID is required"
        })
      };
    }
    const existing = await docClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: PROJECTS_TABLE,
        Key: { id }
      })
    );
    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Project not found"
        })
      };
    }
    const { title, description, category, technologies, link, image, featured, status } = body;
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    if (title !== void 0) {
      updateExpressions.push("#title = :title");
      expressionAttributeNames["#title"] = "title";
      expressionAttributeValues[":title"] = title;
    }
    if (description !== void 0) {
      updateExpressions.push("#description = :description");
      expressionAttributeNames["#description"] = "description";
      expressionAttributeValues[":description"] = description;
    }
    if (category !== void 0) {
      updateExpressions.push("#category = :category");
      expressionAttributeNames["#category"] = "category";
      expressionAttributeValues[":category"] = category;
    }
    if (technologies !== void 0) {
      updateExpressions.push("#technologies = :technologies");
      expressionAttributeNames["#technologies"] = "technologies";
      expressionAttributeValues[":technologies"] = technologies;
    }
    if (link !== void 0) {
      updateExpressions.push("#link = :link");
      expressionAttributeNames["#link"] = "link";
      expressionAttributeValues[":link"] = link;
    }
    if (image !== void 0) {
      updateExpressions.push("#image = :image");
      expressionAttributeNames["#image"] = "image";
      expressionAttributeValues[":image"] = image;
    }
    if (featured !== void 0) {
      updateExpressions.push("#featured = :featured");
      expressionAttributeNames["#featured"] = "featured";
      expressionAttributeValues[":featured"] = featured;
    }
    if (status !== void 0) {
      updateExpressions.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = status;
    }
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = Date.now();
    const result = await docClient.send(
      new import_lib_dynamodb.UpdateCommand({
        TableName: PROJECTS_TABLE,
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
        message: "Project updated successfully"
      })
    };
  } catch (error) {
    console.error("Error updating project:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to update project"
      })
    };
  }
};
var deleteProject = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Project ID is required"
        })
      };
    }
    const existing = await docClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: PROJECTS_TABLE,
        Key: { id }
      })
    );
    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Project not found"
        })
      };
    }
    await docClient.send(
      new import_lib_dynamodb.DeleteCommand({
        TableName: PROJECTS_TABLE,
        Key: { id }
      })
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Project deleted successfully"
      })
    };
  } catch (error) {
    console.error("Error deleting project:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to delete project"
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject
});

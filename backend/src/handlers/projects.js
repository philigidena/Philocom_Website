/**
 * Lambda handler for Projects API
 */

import { v4 as uuidv4 } from 'uuid';
import { scanTable, putItem, getItem } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const PROJECTS_TABLE = process.env.PROJECTS_TABLE;

/**
 * GET /projects - Get all published projects
 */
export const getProjects = async (event) => {
  try {
    let projects = await scanTable(PROJECTS_TABLE);

    // Filter only published projects
    projects = projects.filter(project => project.status === 'published');

    // Sort by createdAt descending
    const sortedProjects = projects.sort((a, b) => b.createdAt - a.createdAt);

    return successResponse({
      projects: sortedProjects,
      count: sortedProjects.length,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return errorResponse('Failed to fetch projects', 500, error);
  }
};

/**
 * GET /projects/{id} - Get a single project
 */
export const getProjectById = async (event) => {
  try {
    const { id } = event.pathParameters;

    const project = await getItem(PROJECTS_TABLE, { id });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    return successResponse({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return errorResponse('Failed to fetch project', 500, error);
  }
};

/**
 * POST /projects - Create a new project (Admin only - add auth later)
 */
export const createProject = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const project = {
      id: uuidv4(),
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await putItem(PROJECTS_TABLE, project);

    return successResponse({ project }, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    return errorResponse('Failed to create project', 500, error);
  }
};

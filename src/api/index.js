/**
 * Centralized API exports
 * Import all APIs from this single file instead of importing individually
 * 
 * Usage:
 * import { authAPI, usersAPI, templatesAPI, campaignsAPI, creditsAPI } from '../api';
 * 
 * Or import specific API:
 * import { authAPI } from '../api';
 */

export { authAPI } from './auth.api';
export { usersAPI } from './users.api';
export { templatesAPI } from './templates.api';
export { campaignsAPI } from './campaigns.api';
export { creditsAPI } from './credits.api';
export { uploadAPI } from './upload.api';
export { API_ENDPOINTS, API_CONFIG } from './config';
export { default as apiClient } from './apiClient';

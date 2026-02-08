/**
 * Upload API - Handles image uploads for profile pictures and business logos
 * Uses separate upload service with pre-signed S3 URLs
 * Uploaded images are accessible via CloudFront CDN: https://d2nw8bxx6o9c62.cloudfront.net/${imageID}
 * 
 * @example Basic Usage - Upload Profile Picture
 * ```javascript
 * import { uploadAPI } from '../api';
 * 
 * const handleProfileUpload = async (event) => {
 *   const file = event.target.files[0];
 *   
 *   try {
 *     const result = await uploadAPI.uploadFile(file, 'profile');
 *     console.log('Uploaded:', result.data.fileUrl);
 *     console.log('CDN URL:', result.data.cdnUrl); // CloudFront URL
 *     // Save result.data.cdnUrl to user profile for fast access
 *   } catch (error) {
 *     console.error('Upload failed:', error);
 *   }
 * };
 * ```
 * 
 * @example Upload Business Logo
 * ```javascript
 * const result = await uploadAPI.uploadFile(logoFile, 'business-logo');
 * // Save result.data.fileUrl to business settings
 * ```
 * 
 * @example Advanced - Manual Flow
 * ```javascript
 * // Step 1: Get pre-signed URL
 * const urlData = await uploadAPI.getUploadUrl({
 *   fileName: file.name,
 *   fileType: file.type,
 *   fileSize: file.size,
 *   uploadType: 'profile'
 * });
 * 
 * // Step 2: Upload to S3
 * await uploadAPI.uploadToS3(urlData.data.uploadUrl, file);
 * 
 * // Step 3: Use the file URL
 * const imageUrl = urlData.data.fileUrl;
 * ```
 * 
 * @example Get Download URL
 * ```javascript
 * const downloadData = await uploadAPI.getDownloadUrl('uploads/12345-image.jpg');
 * console.log('Download URL:', downloadData.data.downloadUrl);
 * ```
 */

import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './config';

// Mock mode - set to false when backend is ready
const MOCK_MODE = false;

// Mock delay to simulate network request
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Create separate axios instance for upload service
const uploadClient = axios.create({
  baseURL: API_CONFIG.UPLOAD_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Add auth token to upload requests
uploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

uploadClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
);

export const uploadAPI = {
  /**
   * Get pre-signed URL for uploading image
   * @param {Object} fileData - File metadata
   * @param {string} fileData.fileName - Name of the file
   * @param {string} fileData.fileType - MIME type (e.g., 'image/jpeg')
   * @param {number} fileData.fileSize - File size in bytes
   * @param {string} fileData.uploadType - Type: 'profile', 'business-logo', etc.
   * @returns {Promise<{success: boolean, data: {uploadUrl: string, fileUrl: string, key: string}}>}
   */
  getUploadUrl: async (fileData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const imageId = `${Date.now()}-${fileData.fileName}`;
      return {
        success: true,
        data: {
          uploadUrl: 'https://mock-s3-bucket.amazonaws.com/upload-url',
          fileUrl: `https://mock-s3-bucket.amazonaws.com/uploads/${imageId}`,
          cdnUrl: `https://d2nw8bxx6o9c62.cloudfront.net/${imageId}`,
          imageId: imageId,
          key: `uploads/${imageId}`,
        },
      };
    }
    
    return uploadClient.post(API_ENDPOINTS.UPLOAD_PRESIGNED_URL, {
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      fileSize: fileData.fileSize,
      uploadType: fileData.uploadType, // 'profile', 'business-logo', etc.
    });
  },

  /**
   * Upload file directly to S3 using pre-signed URL
   * @param {string} presignedUrl - Pre-signed S3 upload URL
   * @param {File} file - File object to upload
   * @returns {Promise<{success: boolean, message: string}>}
   */
  uploadToS3: async (presignedUrl, file) => {
    if (MOCK_MODE) {
      await mockDelay(1000);
      return {
        success: true,
        message: 'File uploaded successfully',
      };
    }
    
    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
    
    return {
      success: response.status === 200,
      message: 'File uploaded successfully',
    };
  },

  /**
   * Complete upload flow - Recommended method for most use cases
   * Handles getting pre-signed URL and uploading to S3 in one call
   * @param {File} file - File object to upload
   * @param {string} uploadType - Type: 'profile', 'business-logo', etc. (default: 'profile')
   * @returns {Promise<{success: boolean, data: {fileUrl: string, key: string}}>}
   */
  uploadFile: async (file, uploadType = 'profile') => {
    try {
      // Step 1: Get pre-signed URL
      const urlResponse = await uploadAPI.getUploadUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadType,
      });

      if (!urlResponse.success) {
        throw new Error('Failed to get upload URL');
      }

      // Step 2: Upload to S3
      await uploadAPI.uploadToS3(urlResponse.data.uploadUrl, file);

      // Return the file URL and CDN URL
      return {
        success: true,
        data: {
          fileUrl: urlResponse.data.fileUrl,
          cdnUrl: urlResponse.data.cdnUrl,
          imageId: urlResponse.data.imageId,
          key: urlResponse.data.key,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get CloudFront CDN URL for an image
   * @param {string} imageId - Image identifier (filename or ID)
   * @returns {string} Full CloudFront CDN URL
   * @example
   * const cdnUrl = uploadAPI.getCdnUrl('profile-123456.jpg');
   * // Returns: https://d2nw8bxx6o9c62.cloudfront.net/profile-123456.jpg
   */
  getCdnUrl: (imageId) => {
    return `${API_CONFIG.CDN_BASE_URL}/${imageId}`;
  },

  /**
   * Get pre-signed URL for downloading/accessing private images
   * @param {string} fileKey - S3 file key (path)
   * @returns {Promise<{success: boolean, data: {downloadUrl: string, expiresIn: number}}>}
   */
  getDownloadUrl: async (fileKey) => {
    if (MOCK_MODE) {
      await mockDelay();
      return {
        success: true,
        data: {
          downloadUrl: `https://mock-cdn.example.com/images/${fileKey}`,
          expiresIn: 3600, // 1 hour
        },
      };
    }
    
    return uploadClient.post(API_ENDPOINTS.DOWNLOAD_PRESIGNED_URL, {
      fileKey,
    });
  },
};

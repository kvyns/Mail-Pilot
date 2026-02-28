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

// Upload / download category constants
export const UPLOAD_CATEGORIES = {
  PROFILE_IMAGE:     'PROFILE_IMAGE',
  LOGO_IMAGE:        'LOGO_IMAGE',
  TEMPLATE_IMAGE:    'TEMPLATE_IMAGE',
  HTML_TEMPLATE:     'HTML_TEMPLATE',
  DISTRIBUTION_LIST: 'DISTRIBUTION_LIST',
};

// Authenticated client — Bearer token required (upload, download, voucher, transaction/save)
const uploadClient = axios.create({
  baseURL: API_CONFIG.UPLOAD_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});
uploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
uploadClient.interceptors.response.use(
  (response) => response.data,
  (error) => { if (error.response) throw error.response.data; throw error; }
);

// Public client — No Auth Header (packages, transaction, transactions)
const uploadPublicClient = axios.create({
  baseURL: API_CONFIG.UPLOAD_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});
uploadPublicClient.interceptors.response.use(
  (response) => response.data,
  (error) => { if (error.response) throw error.response.data; throw error; }
);

export const uploadAPI = {
  // ─────────────────────────────────────────────────────────────
  // INTERNAL HELPERS
  // ─────────────────────────────────────────────────────────────

  /** Returns { accountID, email } pulled from localStorage */
  _userContext: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const acct = JSON.parse(localStorage.getItem('selectedAccount') || 'null') || {};
    const accountID =
      user?.accountID || user?.accountId ||
      acct?.accountID || acct?.id || acct?._id || '';
    return { accountID, email: user?.email || '' };
  },

  // ─────────────────────────────────────────────────────────────
  // UPLOAD  POST /upload  (Bearer Token)
  // Body: fileName, fileType, category, email, accountID, templateID
  // fileType enum: "image/jpeg" | "image/jpg" | "image/png" | "text/csv" | "text/html"
  // category enum: see UPLOAD_CATEGORIES
  // ─────────────────────────────────────────────────────────────

  /**
   * Step 1 of 2 — get a presigned S3 upload URL from the backend.
   * Returns the raw API response (uploadUrl, key, …).
   */
  getUploadUrl: async (fileData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const imageId = `${Date.now()}-${fileData.fileName}`;
      return {
        success: true,
        uploadUrl: 'https://mock-s3-bucket.amazonaws.com/upload-url',
        fileUrl: `https://mock-s3-bucket.amazonaws.com/uploads/${imageId}`,
        cdnUrl: `https://d2nw8bxx6o9c62.cloudfront.net/${imageId}`,
        key: `uploads/${imageId}`,
      };
    }

    const { accountID, email } = uploadAPI._userContext();
    return uploadClient.post(API_ENDPOINTS.UPLOAD_PRESIGNED_URL, {
      fileName:   fileData.fileName,
      fileType:   fileData.fileType,
      category:   fileData.category,
      email,
      accountID,
      templateID: fileData.templateID || undefined,
    });
  },

  // ─────────────────────────────────────────────────────────────
  // Step 2 of 2 — PUT file directly to S3 via presigned URL
  // ─────────────────────────────────────────────────────────────
  uploadToS3: async (presignedUrl, fileOrBlob) => {
    if (MOCK_MODE) {
      await mockDelay(800);
      return { success: true };
    }
    await axios.put(presignedUrl, fileOrBlob, {
      headers: { 'Content-Type': fileOrBlob.type },
    });
    return { success: true };
  },

  // ─────────────────────────────────────────────────────────────
  // DOWNLOAD  GET /download  (Bearer Token)
  // Query params: category, key
  // ─────────────────────────────────────────────────────────────

  /**
   * Get a short-lived presigned download URL for a previously uploaded file.
   * @param {string} category  - UPLOAD_CATEGORIES value
   * @param {string} key       - S3 key returned by getUploadUrl
   */
  getDownloadUrl: async (category, key) => {
    if (MOCK_MODE) {
      await mockDelay();
      return { downloadUrl: `https://mock-cdn.example.com/${key}` };
    }
    // Spec: POST /download  Bearer Token  Body: { category, key }
    return uploadClient.post(API_ENDPOINTS.DOWNLOAD_PRESIGNED_URL, { category, key });
  },

  // ─────────────────────────────────────────────────────────────
  // HIGH-LEVEL CONVENIENCE METHODS
  // ─────────────────────────────────────────────────────────────

  /**
   * Full upload flow for a File object.
   * Returns { key, imageUrl } — imageUrl is the presigned download URL.
   * @param {File}   file
   * @param {string} category   - UPLOAD_CATEGORIES value
   * @param {string} [templateID]
   */
  uploadFile: async (file, category = UPLOAD_CATEGORIES.TEMPLATE_IMAGE, templateID) => {
    const urlRes = await uploadAPI.getUploadUrl({
      fileName:   file.name,
      fileType:   file.type,
      category,
      templateID,
    });

    const uploadUrl = urlRes?.uploadUrl || urlRes?.data?.uploadUrl;
    const key       = urlRes?.key       || urlRes?.data?.key;
    if (!uploadUrl) throw new Error('Failed to get upload URL');

    await uploadAPI.uploadToS3(uploadUrl, file);

    // Fetch presigned download URL
    let imageUrl = urlRes?.fileUrl || urlRes?.data?.fileUrl;
    if (key) {
      try {
        const dl = await uploadAPI.getDownloadUrl(category, key);
        imageUrl = dl?.downloadUrl || dl?.data?.downloadUrl || dl?.url || imageUrl;
      } catch { /* best-effort */ }
    }

    return { key, imageUrl };
  },

  /**
   * Upload a raw HTML string as HTML_TEMPLATE.
   * Returns { key } for storing in the template record.
   * @param {string} htmlString
   * @param {string} [templateID]
   */
  uploadHtmlString: async (htmlString, templateID) => {
    const fileName = `template-${Date.now()}.html`;
    const file = new File([htmlString], fileName, { type: 'text/html' });

    const { accountID, email } = uploadAPI._userContext();
    const urlRes = await uploadClient.post(API_ENDPOINTS.UPLOAD_PRESIGNED_URL, {
      fileName,
      fileType:   'text/html',
      category:   UPLOAD_CATEGORIES.HTML_TEMPLATE,
      email,
      accountID,
      templateID: templateID || undefined,
    });

    const uploadUrl = urlRes?.uploadUrl || urlRes?.data?.uploadUrl;
    const key       = urlRes?.key       || urlRes?.data?.key;
    if (!uploadUrl) throw new Error('Failed to get HTML upload URL');

    await axios.put(uploadUrl, file, { headers: { 'Content-Type': 'text/html' } });
    return { key };
  },

  /**
   * Upload a base64 data URL as a TEMPLATE_IMAGE.
   * Used as a post-save promotion for locally-embedded (fallback) images.
   * Returns { key, imageUrl } where imageUrl is the presigned download URL.
   * @param {string} dataUrl    - data:image/...;base64,... string
   * @param {string} [fileName]
   * @param {string} [templateID]
   */
  uploadDataUrlAsImage: async (dataUrl, fileName, templateID) => {
    // Convert data URL → File
    const [header, base64] = dataUrl.split(',');
    const mimeType = (header.match(/:(.*?);/) || [])[1] || 'image/jpeg';
    const ext = mimeType.split('/')[1] || 'jpg';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const file = new File(
      [new Blob([bytes], { type: mimeType })],
      fileName || `image-${Date.now()}.${ext}`,
      { type: mimeType }
    );

    return uploadAPI.uploadFile(file, UPLOAD_CATEGORIES.TEMPLATE_IMAGE, templateID);
  },

  // ─────────────────────────────────────────────────────────────
  // PACKAGES  GET /packages  (No Auth)
  // ─────────────────────────────────────────────────────────────
  getPackages: (countryCode) => {
    const params = countryCode ? { countryCode } : {};
    return uploadPublicClient.get(API_ENDPOINTS.PACKAGES, { params });
  },

  // ─────────────────────────────────────────────────────────────
  // VOUCHER  POST /voucher  (Bearer Token)
  // Body: voucherCode, accountID, countryCode
  // ─────────────────────────────────────────────────────────────
  applyVoucher: (data) => uploadClient.post(API_ENDPOINTS.VOUCHER, data),

  // ─────────────────────────────────────────────────────────────
  // TRANSACTIONS  (upload server)
  // ─────────────────────────────────────────────────────────────

  /** POST /transaction/save  Bearer Token — Body: accountID, package{title,price,credits}, discount, vat, total, voucherID, payer{email,firstName,lastName} */
  saveTransaction: (data) => uploadClient.post(API_ENDPOINTS.TRANSACTION_SAVE, data),

  /** GET /transaction  No Auth — Query: transactionID, accountID */
  getTransaction: (transactionID, accountID) =>
    uploadPublicClient.get(API_ENDPOINTS.TRANSACTION, { params: { transactionID, accountID } }),

  /** GET /transactions  No Auth — Query: accountID */
  getTransactions: (accountID) =>
    uploadPublicClient.get(API_ENDPOINTS.TRANSACTIONS, { params: { accountID } }),

  /** Legacy CDN helper */
  getCdnUrl: (imageId) => `${API_CONFIG.CDN_BASE_URL}/${imageId}`,
};

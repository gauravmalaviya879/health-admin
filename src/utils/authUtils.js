/**
 * Utility functions for authentication and authorization
 */

/**
 * Check if the current user is an admin
 * @returns {boolean} True if user is admin, false otherwise
 */
import CryptoJS from "crypto-js";
const secretKey = import.meta.env.VITE_SECRET_KEY;
export const isAdminUser = () => {
  try {
    const stored = localStorage.getItem('adminData');
    if (!stored) return false;

    // adminData is stored as JSON.stringify(encryptedString)
    let cipherText;
    try {
      cipherText = JSON.parse(stored);
    } catch {
      // Fallback if it was stored directly without JSON.stringify
      cipherText = stored;
    }

    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedJson) return false;

    const adminData = JSON.parse(decryptedJson);
    if (!adminData) return false;

    const { subadmin } = adminData;
    return !subadmin; // If subadmin is false, user is admin
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get the current user's data
 * @returns {Object|null} User data or null if not available
 */
export const getUserData = () => {
  try {
    const stored = localStorage.getItem('adminData');
    if (!stored) return null;

    let cipherText;
    try {
      cipherText = JSON.parse(stored);
    } catch {
      cipherText = stored;
    }

    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedJson) return null;

    const adminData = JSON.parse(decryptedJson);
    return adminData || null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('healthAdminToken');
  return !!token;
};

/**
 * Utility functions for authentication and authorization
 */

/**
 * Check if the current user is an admin
 * @returns {boolean} True if user is admin, false otherwise
 */
export const isAdminUser = () => {
  try {
    const adminData = localStorage.getItem('adminData');
    if (!adminData) return false;
    
    const { subadmin } = JSON.parse(adminData);
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
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
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
  const token = localStorage.getItem('token');
  return !!token;
};

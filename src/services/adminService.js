import axios from 'axios';
import authService from './authService';

const API_URL = 'https://healtheasy-o25g.onrender.com';

const adminService = {
  // Get all admin users
  getAdminUsers: async () => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${API_URL}/admin/adminuser/list`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create or update admin user
  saveAdminUser: async (adminData) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${API_URL}/admin/adminuser/save`,
        adminData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Deactivate admin user (soft delete)
  deleteAdminUser: async (adminData) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${API_URL}/admin/adminuser/save`,
        adminData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get admin user by ID
  getUserById: async (adminId) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${API_URL}/admin/adminuser/getone`,
        { adminid: adminId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data.Data; // Return the user data
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update admin user status
  updateUserStatus: async (userData) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${API_URL}/admin/adminuser/save`,
        {
          adminuserid: userData._id,
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          password: userData.password,
          status: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default adminService;

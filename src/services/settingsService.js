import authService from './authService';
import axios from 'axios';

const API_BASE_URL = 'https://healtheasy-o25g.onrender.com';

const settingsService = {
  saveTcSettings: async (tcData) => {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/settings/savetc`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: tcData
      });

      return {
        success: true,
        data: response.data.Data || {}
      };
    } catch (error) {
      console.error('Save TC settings error:', error);
      return {
        success: false,
        error: error.response?.data?.Message || 'Failed to save TC settings'
      };
    }
  },

  getTcSettings: async () => {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/admin/settings/tc`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        data: response.data.Data || {}
      };
    } catch (error) {
      console.error('Get TC settings error:', error);
      return {
        success: false,
        error: error.response?.data?.Message || 'Failed to fetch TC settings'
      };
    }
  },

  // Get all settings
  getSettings: async () => {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/admin/settings/getone`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        data: response.data.Data || {}
      };
    } catch (error) {
      console.error('Get settings error:', error);
      return {
        success: false,
        error: error.response?.data?.Message || 'Failed to fetch settings'
      };
    }
  },

  // Save or update settings
  saveSettings: async (settingsData) => {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/settings/savetc`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: settingsData
      });

      return {
        success: true,
        data: response.data.Data || {}
      };
    } catch (error) {
      console.error('Save settings error:', error);
      return {
        success: false,
        error: error.response?.data?.Message || 'Failed to save settings'
      };
    }
  }
};

export default settingsService;

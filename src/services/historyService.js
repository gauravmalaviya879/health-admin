import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const historyService = {
  listByAdmin: async (adminId) => {
    const token = authService.getToken();
    const payload = { adminid: adminId };
    try {
      const response = await axios.post(`${API_URL}/admin/histories/list`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching histories:', error);
      throw error;
    }
  }
};

export default historyService;

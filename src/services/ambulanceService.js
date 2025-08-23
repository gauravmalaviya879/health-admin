import axios from 'axios';
import authService from "./authService";

const API_URL = 'https://healtheasy-o25g.onrender.com';

export const ambulanceService = {
  getAmbulances: async () => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${API_URL}/admin/ambulances/list`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching ambulances:', error);
      throw error;
    }
  },

  updateApproval: async (id, status) => {
    const token = authService.getToken();
    try {
      const response = await axios.put(
        `${API_URL}/admin/ambulances/${id}/status`,
        { approval_status: status },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating ambulance status:', error);
      throw error;
    }
  }
};

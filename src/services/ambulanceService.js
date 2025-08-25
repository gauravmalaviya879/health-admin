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

  approveAmbulance: async (ambulanceId) => {
    const token = authService.getToken();
    console.log(ambulanceId,status)
    try {
      const response = await axios.post(
        `${API_URL}/admin/ambulances/approved`,
        { 
          ambulanceid: ambulanceId,
          status: 'Approved' 
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
      console.error('Error updating ambulance approval status:', error);
      throw error;
    }
  },

  rejectAmbulance: async (ambulanceId) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${API_URL}/admin/ambulances/approved`,
        { 
          ambulanceid: ambulanceId,
          status: 'Rejected' 
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
      console.error('Error rejecting ambulance:', error);
      throw error;
    }
  }
};

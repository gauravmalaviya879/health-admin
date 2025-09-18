import axios from 'axios';
import authService from "./authService";

const API_URL = import.meta.env.VITE_API_BASE_URL;

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
  },

  getAmbulanceById: async (ambulanceId) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${API_URL}/admin/ambulances/getone`,
        { ambulanceid: ambulanceId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return { data: response.data };
    } catch (error) {
      console.error('Error fetching ambulance details:', error);
      throw error;
    }
  },
};

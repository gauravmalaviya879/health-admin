import authService from './authService';
import axios from 'axios';

const API_BASE_URL = 'https://healtheasy-o25g.onrender.com';

class PatientService {
  // Get all patients
  async getPatients() {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/patient/list`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        data: response.data.Data || []
      };
    } catch (error) {
      console.error('Get patients error:', error);
      return {
        success: false,
        error: error.response?.data?.Message || 'Failed to fetch patients'
      };
    }
  }

  // Get patient details by ID
  async getPatientDetails(patientId) {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/admin/patient/${patientId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      return {
        success: true,
        data: response.data.Data || null
      };
    } catch (error) {
      console.error('Get patient details error:', error);
      
      if (error.response?.data?.Message) {
        return {
          success: false,
          error: error.response.data.Message
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch patient details. Please try again.'
      };
    }
  }
}

export default new PatientService();

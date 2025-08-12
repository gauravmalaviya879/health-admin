import axios from 'axios';
import authService from "./authService";

const BASE_URL = 'https://healtheasy-o25g.onrender.com';

const approvedService = {
  // Get all doctors list (will filter for approved ones in component)
  getDoctorsList: async () => {
    const token = authService.getToken();
    try {
      const response = await axios.post(`${BASE_URL}/admin/doctors/list`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return { data: response.data };
    } catch (error) {
      console.error('Error fetching doctors list:', error);
      throw error;
    }
  },

  // Reject an approved doctor
  rejectDoctor: async (doctorId) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(`${BASE_URL}/admin/doctors/approved`, {
        doctorid: doctorId,
        status: "Rejected"
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return { status: response.status, data: response.data };
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      throw error;
    }
  }
};

export default approvedService;

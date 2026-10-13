import axios from 'axios';
import authService from "./authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  rejectDoctor: async (doctorId, reason = '') => {
    const token = authService.getToken();
    try {
      const response = await axios.post(`${BASE_URL}/admin/doctors/approved`, {
        doctorid: doctorId,
        status: "Rejected",
        reason: reason || ''
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
  },

  // Approve or reject pending profile update
  approveProfileUpdate: async (doctorId, status = 'Approved', reason = '') => {
    const token = authService.getToken();
    try {
      const response = await axios.post(`${BASE_URL}/admin/doctors/approve-profile-update`, {
        doctorid: doctorId,
        status: status,
        reason: reason || ''
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return { status: response.status, data: response.data };
    } catch (error) {
      console.error('Error in approveProfileUpdate:', error);
      throw error;
    }
  }
};

export default approvedService;

import axios from 'axios';
import authService from "./authService";

const BASE_URL = 'https://healtheasy-o25g.onrender.com';

const newDoctorsService = {
  // Get all doctors list
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

  // Approve a doctor
  approveDoctor: async (doctorId) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(`${BASE_URL}/admin/doctors/approved`, {
        doctorid: doctorId,
        status: "Approved"
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return { status: response.status, data: response.data };
    } catch (error) {
      console.error('Error approving doctor:', error);
      throw error;
    }
  },

  // Reject/Cancel a doctor
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
  },

  // Get a single doctor by ID
  getDoctorById: async (doctorId) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${BASE_URL}/admin/doctors/getone`,
        { doctorid: doctorId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return { data: response.data };
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      throw error;
    }
  },
};

export default newDoctorsService;

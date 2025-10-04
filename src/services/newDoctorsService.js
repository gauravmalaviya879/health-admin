import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const newDoctorsService = {
  // Get all doctors list
  getDoctorsList: async () => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${BASE_URL}/admin/doctors/list`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

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
      const response = await axios.post(
        `${BASE_URL}/admin/doctors/approved`,
        {
          doctorid: doctorId,
          status: 'Approved'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

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
      const response = await axios.post(
        `${BASE_URL}/admin/doctors/approved`,
        {
          doctorid: doctorId,
          status: 'Rejected'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

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
            Authorization: `Bearer ${token}`
          }
        }
      );

      return { data: response.data };
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      throw error;
    }
  },

  // Edit surgery details
  editSurgery: async (surgeryData) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(`${BASE_URL}/admin/surgeries/edit`, surgeryData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return { data: response.data };
    } catch (error) {
      console.error('Error updating surgery:', error);
      throw error;
    }
  },

  // Get surgery types
  getSurgeryTypes: async () => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${BASE_URL}/admin/surgerytypes/list`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching surgery types:', error);
      throw error;
    }
  },
  // In src/services/newDoctorsService.js
  removeSurgery: async (surgeryId) => {
    const token = authService.getToken();
    try {
      const response = await axios.post(
        `${BASE_URL}/admin/surgeries/remove`,
        { surgeryid: surgeryId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return { status: response.status, data: response.data };
    } catch (error) {
      console.error('Error removing surgery:', error);
      throw error;
    }
  }
};

export default newDoctorsService;

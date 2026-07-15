import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const newHospitalService = {
  // Get hospital list with pagination
  getHospitalList: async (payload) => {
    const token = authService.getToken();

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/hospital`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      return { data: response.data };
    } catch (error) {
      console.error('Error fetching hospital list:', error);
      throw error;
    }
  },

  // Get hospital list without pagination
  getHospitalListWithoutPagination: async (payload) => {
    const token = authService.getToken();

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/hospital/list`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      return { data: response.data };
    } catch (error) {
      console.error('Error fetching hospital list without pagination:', error);
      throw error;
    }
  },

  // Get single hospital details by ID
  getHospitalById: async (hospitalId) => {
    const token = authService.getToken();

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/hospital/getone`,
        {
          hospitalid: hospitalId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      return { data: response.data };
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      throw error;
    }
  },

  // Change hospital status (Approved / Rejected)
  changeHospitalStatus: async (hospitalId, status) => {
    const token = authService.getToken();

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/hospital/changestatus`,
        {
          hospitalid: hospitalId,
          status: status
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
      console.error('Error changing hospital status:', error);
      throw error;
    }
  },

  // Update branch percentage
  updateBranchPercentage: async (branchData) => {
    const token = authService.getToken();

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/hospital/updatebranchpercentage`,
        branchData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      return { data: response.data };
    } catch (error) {
      console.error('Error updating branch percentage:', error);
      throw error;
    }
  }
};

export default newHospitalService;
import authService from './authService';
import axios from 'axios';

const API_BASE_URL = 'https://healtheasy-o25g.onrender.com';

class DashboardService {
  // Get total count of specialties
  async getSpecialtiesCount() {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/surgerytypes/list`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          search: "",
        }
      });

      return {
        success: true,
        count: response.data.Data?.length || 0
      };
    } catch (error) {
      console.error('Get specialties count error:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to fetch specialties count'
      };
    }
  }

  // Get total count of categories
  async getCategoriesCount() {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/doctorcategories/list`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          search: "",
        }
      });

      return {
        success: true,
        count: response.data.Data?.length || 0
      };
    } catch (error) {
      console.error('Get categories count error:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to fetch categories count'
      };
    }
  }

  // Get count of pending doctors
  async getPendingDoctorsCount() {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/doctors/list`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          search: "",
        }
      });

      // Filter doctors with approval_status 'pending'
      const pendingDoctors = response.data.Data?.filter(
        doctor => doctor.approval_status?.toLowerCase() === 'pending'
      ) || [];

      return {
        success: true,
        count: pendingDoctors.length
      };
    } catch (error) {
      console.error('Get pending doctors count error:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to fetch pending doctors count'
      };
    }
  }

  // Get count of approved doctors
  async getApprovedDoctorsCount() {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/doctors/list`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          search: "",
        }
      });

      // Filter doctors with approval_status 'approved'
      const approvedDoctors = response.data.Data?.filter(
        doctor => doctor.approval_status?.toLowerCase() === 'approved'
      ) || [];

      return {
        success: true,
        count: approvedDoctors.length
      };
    } catch (error) {
      console.error('Get approved doctors count error:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to fetch approved doctors count'
      };
    }
  }

  // Get total count of patients
  async getPatientsCount() {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/patient/list`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          search: "",
        }
      });

      return {
        success: true,
        count: response.data.Data?.length || 0
      };
    } catch (error) {
      console.error('Get patients count error:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to fetch patients count'
      };
    }
  }
}

export default new DashboardService();

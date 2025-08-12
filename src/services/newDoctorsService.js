import authService from "./authService";

const BASE_URL = 'https://healtheasy-o25g.onrender.com';

const newDoctorsService = {
  // Get all doctors list
  getDoctorsList: async () => {
    const token = authService.getToken();
    try {
      const response = await fetch(`${BASE_URL}/admin/doctors/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching doctors list:', error);
      throw error;
    }
  },

  // Approve a doctor
  approveDoctor: async (doctorId) => {
    const token = authService.getToken();
    try {
      const response = await fetch(`${BASE_URL}/${doctorId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error('Error approving doctor:', error);
      throw error;
    }
  },

  // Reject/Cancel a doctor
  rejectDoctor: async (doctorId) => {
    const token = authService.getToken();
    try {
      const response = await fetch(`${BASE_URL}/${doctorId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      throw error;
    }
  }
};

export default newDoctorsService;

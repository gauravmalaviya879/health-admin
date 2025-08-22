import authService from './authService';
import axios from 'axios';

const API_BASE_URL = 'https://healtheasy-o25g.onrender.com';

class SpecialtiesService {
  // Get all specialties
  async getAllSpecialties() {
    try {
      const token = authService.getToken();
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/surgerytypes/list`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          "search": "",
        }
      });
    
      return {
        success: true,
        data: response.data.Data || []
      };
    } catch (error) {
      console.error('Get specialties error:', error);
      
      if (error.response && error.response.data && error.response.data.Message) {
        return {
          success: false,
          error: error.response.data.Message
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Add new specialty
  async addSpecialty(specialtyName) {
    const token = authService.getToken();
    try {
      
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/surgerytypes/save`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          surgerytypename: specialtyName,
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Specialty added successfully',
      };
    } catch (error) {
      console.error('Add specialty error:', error);
      
      if (error.response && error.response.data && error.response.data.Message) {
        return {
          success: false,
          error: error.response.data.Message
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Update existing specialty
  async updateSpecialty(id, specialtyName) {
    const token = authService.getToken();
    try {

      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/surgerytypes/save`,
        headers: {
          Authorization:  `Bearer ${token}`,
        },
        data: {
          surgerytypeid: id,
          surgerytypename: specialtyName
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Specialty updated successfully',
      };
    } catch (error) {
      console.error('Update specialty error:', error);
      
      if (error.response && error.response.data && error.response.data.Message) {
        return {
          success: false,
          error: error.response.data.Message
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Delete specialty
  async deleteSpecialty(id) {
    const token = authService.getToken();
    try {
      
      
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/admin/surgerytypes/remove`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          surgerytypeid: id,
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Specialty deleted successfully',
      };
    } catch (error) {
      console.error('Delete specialty error:', error);
      
      if (error.response && error.response.data && error.response.data.Message) {
        return {
          success: false,
          error: error.response.data.Message
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }
}

export default new SpecialtiesService();

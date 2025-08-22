import authService from './authService';
import axios from 'axios';

const API_BASE_URL = 'https://healtheasy-o25g.onrender.com';

class CategoriesService {
  // Get all categories
  async getAllCategories() {
    const token = authService.getToken();
    try {
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/doctorcategories/list`,
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
      console.error('Get categories error:', error);
      
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

  // Add new category
  async addCategory(categoryName, surgerytypeid) {
    const token = authService.getToken();
    try {
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/doctorcategories/save`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          surgerytypeid: surgerytypeid,
          categoryname: categoryName,
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Category added successfully',
      };
    } catch (error) {
      console.error('Add category error:', error);
      
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

  // Update existing category
  async updateCategory(id, categoryName, surgerytypeid) {
    const token = authService.getToken();
    try {
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/admin/doctorcategories/save`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          categoryid: id,
          categoryname: categoryName,
          surgerytypeid: surgerytypeid
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Category updated successfully',
      };
    } catch (error) {
      console.error('Update category error:', error);
      
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

  // Delete category
  async deleteCategory(id) {
    const token = authService.getToken();
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/admin/doctorcategories/remove`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
            categoryid: id,
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      console.error('Delete category error:', error);
      
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

export default new CategoriesService();

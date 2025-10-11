import authService from './authService';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class BannerService {
  // Get all banners
  async getBanner() {
    const token = authService.getToken();
    try {
      const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/admin/banner/getone`,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      return response.data.Data || { banners: [] };
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  }
}

export default new BannerService();
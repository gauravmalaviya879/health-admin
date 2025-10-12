import authService from './authService';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authService.getToken();
class BannerService {
  // Get all banners
  async getBanner() {
    try {
      const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/admin/banner/getone`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.Data || { banners: [] };
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  }
  async uploadBannerImages(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file); // 'files' should match your backend's expected field name
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/user/upload/multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.Data; // Array of { path, type } objects
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  // Save banners
  // In bannerService.js
  async saveBanners(bannersData) {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_BASE_URL}/admin/banner/save`,
        bannersData, // This should be { banners: [...] }
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving banners:', error);
      throw error;
    }
  }
}

export default new BannerService();

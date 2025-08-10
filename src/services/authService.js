const API_BASE_URL = 'https://healtheasy-o25g.onrender.com';

class AuthService {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      this.setToken(data.token);
     
      if (response.ok) {
        // Successful login
        return {
          success: true,
          data: data,
          token: data.token || data.accessToken || data.access_token,
          user: data.user || data.admin || { email, name: data.name || 'Admin' }
        };
      } else {
        // Failed login
        return {
          success: false,
          error: data.message || data.error || 'Login failed. Please check your credentials.',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please check your internet connection and try again.',
      };
    }
  }

  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        // Optional: Call logout endpoint if available
        // await fetch(`${API_BASE_URL}/admin/logout`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        //   },
        // });
        this.clearToken();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
    
    }
  }

  setToken(token) {
    localStorage.setItem('healthAdminToken', token);
  }

  getToken() {
    return localStorage.getItem('healthAdminToken');
  }

  clearToken() {
    localStorage.removeItem('healthAdminToken');
    localStorage.removeItem('healthAdminAuth');
  }

  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic token validation - you might want to decode JWT and check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        this.clearToken();
        return false;
      }
      
      return true;
    } catch (error) {
      // If token is not a valid JWT or can't be parsed, consider it invalid
      console.error('Token validation error:', error);
      return true; // Return true for non-JWT tokens, let the server validate
    }
  }

  // Helper method to make authenticated API calls
  async authenticatedRequest(url, options = {}) {
    const token = this.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired or invalid
        this.clearToken();
        window.location.href = '/login';
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
}

export default new AuthService();

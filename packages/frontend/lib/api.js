const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request('/auth/user');
  }

  // Company methods
  async getCompanies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/companies${queryString ? `?${queryString}` : ''}`);
  }

  async getCompany(id) {
    return this.request(`/companies/${id}`);
  }

  async createCompany(companyData) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(id, companyData) {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(id) {
    return this.request(`/companies/${id}`, { method: 'DELETE' });
  }

  async getCompanyProducts(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/companies/${id}/products${queryString ? `?${queryString}` : ''}`);
  }

  // Product methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  // Quote methods
  async getQuotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/quotes${queryString ? `?${queryString}` : ''}`);
  }

  async getQuote(id) {
    return this.request(`/quotes/${id}`);
  }

  async createQuote(quoteData) {
    return this.request('/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
  }

  async updateQuote(id, quoteData) {
    return this.request(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quoteData),
    });
  }

  async respondToQuote(id, responseData) {
    return this.request(`/quotes/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  }

  // Order methods
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id, orderData) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async getOrderTracking(id) {
    return this.request(`/orders/${id}/tracking`);
  }

  // Message methods
  async getMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/messages${queryString ? `?${queryString}` : ''}`);
  }

  async getMessage(id) {
    return this.request(`/messages/${id}`);
  }

  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(id) {
    return this.request(`/messages/${id}/read`, { method: 'PUT' });
  }

  async getUnreadCount(companyId) {
    return this.request(`/messages/unread-count?company_id=${companyId}`);
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;

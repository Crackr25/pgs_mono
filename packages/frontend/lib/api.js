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

  // File upload methods for onboarding
  async uploadFormData(endpoint, formData, onProgress) {
    const url = `${this.baseURL}${endpoint}`;
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }
      
      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(new Error(response.message || `HTTP error! status: ${xhr.status}`));
          }
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });
      
      xhr.open('POST', url);
      
      // Set authorization header
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }
      
      xhr.send(formData);
    });
  }

  async uploadCompanyDocuments(companyId, files, onProgress, fieldName = null) {
    const formData = new FormData();
    
    if (fieldName) {
      // Use the specific field name provided
      const isMultiple = ['peza_documents', 'product_certifications', 'business_permits'].includes(fieldName);
      files.forEach((file) => {
        if (isMultiple) {
          formData.append(`${fieldName}[]`, file);
        } else {
          formData.append(fieldName, file);
        }
      });
    } else {
      // Fallback to filename-based logic for backward compatibility
      files.forEach((file, index) => {
        if (file.name.toLowerCase().includes('dti') || file.name.toLowerCase().includes('sec')) {
          formData.append('dti_sec_certificate', file);
        } else if (file.name.toLowerCase().includes('peza')) {
          formData.append('peza_documents[]', file);
        } else if (file.name.toLowerCase().includes('certification')) {
          formData.append('product_certifications[]', file);
        } else if (file.name.toLowerCase().includes('permit')) {
          formData.append('business_permits[]', file);
        } else {
          formData.append('business_permits[]', file);
        }
      });
    }
    
    return this.uploadFormData(`/companies/${companyId}/upload-documents`, formData, onProgress);
  }

  async uploadCompanyKyc(companyId, files, onProgress, fieldName = null) {
    const formData = new FormData();
    
    if (fieldName) {
      // Use the specific field name provided
      files.forEach((file) => {
        formData.append(fieldName, file);
      });
    } else {
      // Fallback to filename-based logic for backward compatibility
      files.forEach((file) => {
        const fileName = file.name.toLowerCase();
        if (fileName.includes('front') || fileName.includes('id_front')) {
          formData.append('kyc_id_front', file);
        } else if (fileName.includes('back') || fileName.includes('id_back')) {
          formData.append('kyc_id_back', file);
        } else if (fileName.includes('address') || fileName.includes('utility') || fileName.includes('bill')) {
          formData.append('kyc_proof_address', file);
        } else if (fileName.includes('registration') || fileName.includes('certificate')) {
          formData.append('kyc_business_registration', file);
        } else {
          formData.append('kyc_business_registration', file);
        }
      });
    }
    
    return this.uploadFormData(`/companies/${companyId}/upload-kyc`, formData, onProgress);
  }

  async uploadFactoryTour(companyId, files, onProgress, fieldName = null) {
    const formData = new FormData();
    
    if (fieldName) {
      // Use the specific field name provided
      const isMultiple = ['production_line_photos', 'quality_control_photos', 'warehouse_photos', 'certifications_display_photos'].includes(fieldName);
      files.forEach((file) => {
        if (isMultiple) {
          formData.append(`${fieldName}[]`, file);
        } else {
          formData.append(fieldName, file);
        }
      });
    } else {
      // Fallback to filename-based logic for backward compatibility
      files.forEach((file) => {
        const fileName = file.name.toLowerCase();
        const fileType = file.type;
        
        if (fileType.startsWith('video/') || fileName.includes('overview')) {
          formData.append('factory_overview_video', file);
        } else if (fileName.includes('production') || fileName.includes('line')) {
          formData.append('production_line_photos[]', file);
        } else if (fileName.includes('quality') || fileName.includes('control')) {
          formData.append('quality_control_photos[]', file);
        } else if (fileName.includes('warehouse') || fileName.includes('storage')) {
          formData.append('warehouse_photos[]', file);
        } else if (fileName.includes('cert') || fileName.includes('display')) {
          formData.append('certifications_display_photos[]', file);
        } else {
          formData.append('production_line_photos[]', file);
        }
      });
    }
    
    return this.uploadFormData(`/companies/${companyId}/upload-factory-tour`, formData, onProgress);
  }

  // Product methods
  async getProducts(params = {}) {
    console.log('');
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
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadProductImage(productId, file, onProgress) {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.uploadFormData(`/products/${productId}/upload-images`, formData, onProgress);
  }

  async uploadProductImages(productId, files, onProgress) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images[]', file);
    });
    
    return this.uploadFormData(`/products/${productId}/upload-images`, formData, onProgress);
  }

  async updateImageOrder(productId, imageOrders) {
    return this.request(`/products/${productId}/images/order`, {
      method: 'PUT',
      body: JSON.stringify({ image_orders: imageOrders }),
    });
  }

  async deleteProductImage(productId, imageId) {
    return this.request(`/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });
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

  async deleteQuote(id) {
    return this.request(`/quotes/${id}`, {
      method: 'DELETE',
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

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }


  async getConversations() {
    return this.request('/conversations');
  }

  // Get messages for a specific conversation
  async getConversation(conversationId) {
    return this.request(`/conversations/${conversationId}`);
  }

  // Create a new conversation
  async createConversation(buyerId, orderId = null, initialMessage) {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify({
        buyer_id: buyerId,
        order_id: orderId,
        initial_message: initialMessage,
      }),
    });
  }

  // Send a message in a conversation
  async sendMessage(conversationId, message, messageType = 'text') {
    return this.request('/messages/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
        message_type: messageType,
      }),
    });
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId, messageIds = null) {
    const body = { conversation_id: conversationId };
    if (messageIds) {
      body.message_ids = messageIds;
    }

    return this.request('/messages/mark-read', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Get unread message count
  async getUnreadCount() {
    return this.request('/chat/unread-count');
  }
  

}

const apiService = new ApiService();
export default apiService;

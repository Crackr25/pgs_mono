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

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token && includeAuth) {
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

    // Convert data to body if present
    if (options.data) {
      config.body = JSON.stringify(options.data);
      delete config.data;
    }

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

  // Public request method for endpoints that don't require authentication
  async publicRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(false), // Don't include auth headers
      ...options,
    };

    // Convert data to body if present
    if (options.data) {
      config.body = JSON.stringify(options.data);
      delete config.data;
    }



    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Create a proper error object with response data
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.response = { data, status: response.status };
        throw error;
      }

      return data;
    } catch (error) {
      // If it's already our custom error, just re-throw it
      if (error.response) {
        throw error;
      }
      
      // Otherwise, it's a network or other error
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

  async getCurrentUserCompany() {
    return this.request('/companies/current');
  }

  // Get current user's company with graceful 404 handling
  async getCurrentUserCompanySafe() {
    try {
      return await this.request('/companies/current');
    } catch (error) {
      // If it's a 404, return a standardized "no company" response
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'No company found for user',
          data: null
        };
      }
      // Re-throw other errors
      throw error;
    }
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
      // Use specific field name for targeted uploads
      if (files.length === 1) {
        formData.append(fieldName, files[0]);
      } else {
        files.forEach((file, index) => {
          formData.append(`${fieldName}[${index}]`, file);
        });
      }
    } else {
      // Use filename-based mapping (legacy behavior)
      files.forEach((file, index) => {
        const fileName = file.name.toLowerCase();
        
        if (fileName.includes('overview') || fileName.includes('video')) {
          formData.append('factory_overview_video', file);
        } else if (fileName.includes('production') || fileName.includes('line')) {
          formData.append('production_line_photos[]', file);
        } else if (fileName.includes('quality') || fileName.includes('control')) {
          formData.append('quality_control_photos[]', file);
        } else if (fileName.includes('warehouse') || fileName.includes('storage')) {
          formData.append('warehouse_photos[]', file);
        } else if (fileName.includes('cert') || fileName.includes('display')) {
          formData.append('certifications_photos[]', file);
        } else {
          // Default to production line photos
          formData.append('production_line_photos[]', file);
        }
      });
    }
    
    return this.uploadFormData(`/companies/${companyId}/upload-factory-tour`, formData, onProgress);
  }

  async uploadCompanyBanner(companyId, file, onProgress) {
    const formData = new FormData();
    formData.append('banner', file);
    
    return this.uploadFormData(`/companies/${companyId}/upload-banner`, formData, onProgress);
  }

  async deleteCompanyBanner(companyId) {
    return this.request(`/companies/${companyId}/banner`, {
      method: 'DELETE'
    });
  }

  async uploadCompanyLogo(companyId, file, onProgress) {
    const formData = new FormData();
    formData.append('logo', file);
    
    return this.uploadFormData(`/companies/${companyId}/upload-logo`, formData, onProgress);
  }

  async deleteCompanyLogo(companyId) {
    return this.request(`/companies/${companyId}/logo`, {
      method: 'DELETE'
    });
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

  async uploadProductVideos(productId, files, onProgress) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('videos[]', file);
    });
    
    return this.uploadFormData(`/products/${productId}/upload-videos`, formData, onProgress);
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

  async respondToQuote(id, responseData) {
    return this.request(`/quotes/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  }

  async updateQuoteStatus(id, status, additionalData = {}) {
    return this.request(`/quotes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...additionalData }),
    });
  }

  async getQuoteStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/quotes/stats${queryString ? `?${queryString}` : ''}`);
  }

  // Order methods
  async getOrders(companyId, params = {}) {
    if (companyId) {
      params.company_id = companyId;
    }
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  // Buyer-specific order methods
  async getBuyerOrders(params = {}) {
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

  async getConversation(id) {
    return this.request(`/conversations/${id}`);
  }

  async getMessagesAfter(conversationId, timestamp) {
    return this.request(`/conversations/${conversationId}/messages/after?timestamp=${encodeURIComponent(timestamp)}`);
  }

  async sendMessage(conversationId, message, attachment = null) {
    const formData = new FormData();
    formData.append('message', message || '');
    formData.append('conversation_id', conversationId);
    
    if (attachment) {
      formData.append('attachment', attachment);
    }

    // Use fetch directly for FormData to avoid header conflicts
    const response = await fetch(`${this.baseURL}/chat/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.field_errors = errorData.field_errors || errorData.errors;
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  async markMessagesAsRead(conversationId, messageIds = []) {
    return this.request('/chat/mark-read', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        message_ids: messageIds
      })
    });
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


  // Get unread message count
  async getUnreadCount() {
    return this.request('/chat/unread-count');
  }

  // Buyer-specific message methods
  async getBuyerConversations() {
    return this.request('/buyer/conversations');
  }

  async getBuyerConversationMessages(conversationId) {
    return this.request(`/buyer/conversations/${conversationId}`);
  }

  async getBuyerMessagesAfter(conversationId, timestamp) {
    return this.request(`/buyer/conversations/${conversationId}/messages/after?timestamp=${encodeURIComponent(timestamp)}`);
  }

  async sendBuyerMessage(messageData) {
    return this.request('/buyer/messages/send', {
      method: 'POST',
      data: messageData,
    });
  }

  async sendBuyerMessageWithAttachment(conversationId, message, attachment = null) {
    // If no attachment, use regular message endpoint
    if (!attachment) {
      return this.sendBuyerMessage({
        conversation_id: conversationId,
        message: message,
        message_type: 'text'
      });
    }

    // If attachment provided, use attachment endpoint
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    formData.append('message', message || '');
    formData.append('message_type', attachment.type?.startsWith('image/') ? 'image' : 'file');
    formData.append('attachment', attachment);

    // Use fetch directly for FormData to avoid header conflicts
    const response = await fetch(`${this.baseURL}/buyer/messages/send-attachment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  }

  async markBuyerMessagesAsRead(data) {
    return this.request('/buyer/messages/mark-read', {
      method: 'POST',
      data: data,
    });
  }

  async getBuyerUnreadCount() {
    return this.request('/buyer/messages/unread-count');
  }

  // Buyer RFQ methods
  async getBuyerRFQs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/buyer/rfqs${queryString ? `?${queryString}` : ''}`);
  }

  async createBuyerRFQ(rfqData, attachments = []) {
    try {
      const formData = new FormData();
      
      // Add all RFQ data
      Object.keys(rfqData).forEach(key => {
        if (key === 'specifications') {
          formData.append('specifications', JSON.stringify(rfqData[key]));
        } else if (rfqData[key] !== null && rfqData[key] !== undefined) {
          formData.append(key, rfqData[key]);
        }
      });

      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      const fetchResponse = await fetch(`${this.baseURL}/buyer/rfqs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${fetchResponse.status}`);
        error.field_errors = errorData.field_errors || errorData.errors;
        error.status = fetchResponse.status;
        throw error;
      }

      return await fetchResponse.json();
    } catch (error) {
      console.error('Error creating RFQ:', error);
      throw error;
    }
  }

  async getBuyerRFQ(id) {
    return this.request(`/buyer/rfqs/${id}`);
  }

  async updateBuyerRFQ(id, rfqData, attachments = []) {
    try {
      console.log('=== API SERVICE DEBUG START ===');
      console.log('updateBuyerRFQ called with:', { id, rfqData, attachments });
      
      const formData = new FormData();
      
      // Add all RFQ data
      Object.keys(rfqData).forEach(key => {
        console.log(`Processing key: ${key}, value:`, rfqData[key]);
        if (key === 'specifications') {
          formData.append('specifications', JSON.stringify(rfqData[key]));
        } else if (key === 'existing_attachments') {
          formData.append('existing_attachments', JSON.stringify(rfqData[key]));
        } else if (key === 'certifications_required') {
          formData.append('certifications_required', JSON.stringify(rfqData[key] || []));
        } else if (rfqData[key] !== null && rfqData[key] !== undefined) {
          formData.append(key, rfqData[key]);
        }
      });

      // Add method spoofing for Laravel FormData handling
      formData.append('_method', 'PUT');

      // Log FormData contents
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Add new attachments (files that need to be uploaded)
      const newAttachments = attachments.filter(file => file instanceof File);
      newAttachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
      
      console.log('=== API SERVICE DEBUG END ===');

      const fetchResponse = await fetch(`${this.baseURL}/buyer/rfqs/${id}`, {
        method: 'POST', // Changed from PUT to POST with method spoofing
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${fetchResponse.status}`);
        error.field_errors = errorData.field_errors || errorData.errors;
        error.status = fetchResponse.status;
        throw error;
      }

      return await fetchResponse.json();
    } catch (error) {
      console.error('Error updating RFQ:', error);
      throw error;
    }
  }

  async deleteBuyerRFQ(id) {
    return this.request(`/buyer/rfqs/${id}`, {
      method: 'DELETE'
    });
  }

  async publishBuyerRFQ(id) {
    return this.request(`/buyer/rfqs/${id}/publish`, {
      method: 'POST'
    });
  }

  async closeBuyerRFQ(id) {
    return this.request(`/buyer/rfqs/${id}/close`, {
      method: 'POST'
    });
  }

  async getBuyerRFQCategories() {
    return this.request('/buyer/rfqs/categories');
  }

  async getBuyerRFQDashboardStats() {
    return this.request('/buyer/rfqs/dashboard-stats');
  }

  async getRFQResponses(rfqId) {
    return this.request(`/buyer/rfqs/${rfqId}/responses`);
  }

  // Marketplace methods (public - no auth required)
  async getMarketplaceProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.publicRequest(`/marketplace/products?${queryString}`);
  }

  async getMarketplaceStats() {
    return this.publicRequest('/marketplace/stats');
  }

  async getMarketplaceProductDetails(id) {
    return this.publicRequest(`/marketplace/products/${id}`);
  }

  async getRelatedProducts(productId, limit = 8) {
    return this.publicRequest(`/marketplace/products/${productId}/related?limit=${limit}`);
  }

  // Search suggestions based on existing products
  async getSearchSuggestions(query, limit = 8) {
    const params = new URLSearchParams({
      q: query,
      limit: limit
    });
    return this.request(`/search/suggestions?${params.toString()}`);
  }

  // Full product search with filters
  async searchProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/search/products?${queryString}`);
  }

  // Get popular search terms
  async getPopularSearches(limit = 10) {
    const params = new URLSearchParams({ limit });
    return this.request(`/search/popular?${params.toString()}`);
  }

  // Track search for analytics
  async trackSearch(query, resultsCount = 0) {
    return this.request('/search/track', {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        results_count: resultsCount
      })
    });
  }

  async submitMarketplaceInquiry(inquiryData) {
    return this.request('/marketplace/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  }

  async getMarketplaceCategories() {
    return this.request('/marketplace/categories');
  }

  async getMarketplaceLocations() {
    return this.request('/marketplace/locations');
  }

  // Saved Products methods
  async getSavedProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/saved-products${queryString ? `?${queryString}` : ''}`);
  }

  async saveProduct(productId) {
    return this.request('/saved-products', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async unsaveProduct(productId) {
    return this.request(`/saved-products/${productId}`, {
      method: 'DELETE',
    });
  }

  async checkSavedProduct(productId) {
    try {
      // Only check if user is authenticated
      if (!this.token) {
        return { is_saved: false };
      }
      return this.request(`/saved-products/check/${productId}`);
    } catch (error) {
      // If authentication fails, assume not saved
      if (error.message?.includes('401') || error.message?.includes('Unauthenticated')) {
        return { is_saved: false };
      }
      throw error;
    }
  }

  // Supplier methods (public endpoints)
  async getSupplierDetails(supplierId) {
    return this.publicRequest(`/suppliers/${supplierId}`);
  }

  async getSupplierProducts(supplierId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.publicRequest(`/suppliers/${supplierId}/products${queryString ? `?${queryString}` : ''}`);
  }

  async getSupplierReviews(supplierId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.publicRequest(`/suppliers/${supplierId}/reviews${queryString ? `?${queryString}` : ''}`);
  }

  async getSupplierReviewStats(supplierId) {
    return this.publicRequest(`/suppliers/${supplierId}/reviews/stats`);
  }

  async submitSupplierReview(supplierId, reviewData) {
    return this.publicRequest(`/suppliers/${supplierId}/reviews`, {
      method: 'POST',
      data: reviewData
    });
  }

  // Starred Suppliers methods
  async getStarredSuppliers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/starred-suppliers${queryString ? `?${queryString}` : ''}`);
  }

  async starSupplier(supplierId) {
    return this.request('/starred-suppliers', {
      method: 'POST',
      body: JSON.stringify({ supplier_id: supplierId }),
    });
  }

  async unstarSupplier(supplierId) {
    return this.request(`/starred-suppliers/${supplierId}`, {
      method: 'DELETE',
    });
  }

  async checkStarredSupplier(supplierId) {
    try {
      // Only check if user is authenticated
      if (!this.token) {
        return { is_starred: false };
      }
      return this.request(`/starred-suppliers/check/${supplierId}`);
    } catch (error) {
      // If authentication fails, assume not starred
      if (error.message?.includes('401') || error.message?.includes('Unauthenticated')) {
        return { is_starred: false };
      }
      throw error;
    }
  }

  // Cart methods
  async getCartItems() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity, selectedSpecifications = {}) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
        selected_specifications: selectedSpecifications
      }),
    });
  }

  async updateCartItem(cartItemId, quantity) {
    return this.request(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: quantity }),
    });
  }

  async removeFromCart(cartItemId) {
    return this.request(`/cart/${cartItemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE'
    });
  }

  async removeCartItems(cartItemIds) {
    return this.request('/cart/remove-items', {
      method: 'POST',
      data: {
        cart_item_ids: cartItemIds
      }
    });
  }

  async getCartCount() {
    return this.request('/cart/count');
  }

  // Buyer-specific Quote methods (using existing quote endpoints)
  async getBuyerQuotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/quotes${queryString ? `?${queryString}` : ''}`);
  }

  async getBuyerQuote(id) {
    return this.request(`/quotes/${id}`);
  }

  async getBuyerQuoteStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/quotes/stats${queryString ? `?${queryString}` : ''}`);
  }

  async acceptQuote(id) {
    return this.request(`/quotes/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action: 'accept' }),
    });
  }

  async rejectQuote(id, reason = '') {
    return this.request(`/quotes/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', reason }),
    });
  }

  async cancelQuote(id, reason = '') {
    return this.request(`/quotes/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateQuote(id) {
    return this.request(`/quotes/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async exportQuote(id, format = 'pdf') {
    return this.request(`/quotes/${id}/export?format=${format}`, {
      method: 'GET',
    });
  }

  async bulkQuoteAction(quoteIds, action, data = {}) {
    return this.request('/quotes/bulk-action', {
      method: 'POST',
      body: JSON.stringify({
        quote_ids: quoteIds,
        action,
        ...data
      }),
    });
  }

  // Contact Inquiry methods
  async submitContactInquiry(inquiryData) {
    return this.request('/contact-inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  }

  async getContactInquiries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/contact-inquiries${queryString ? `?${queryString}` : ''}`);
  }

  async getContactInquiry(id) {
    return this.request(`/contact-inquiries/${id}`);
  }

  async updateContactInquiry(id, data) {
    return this.request(`/contact-inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContactInquiry(id) {
    return this.request(`/contact-inquiries/${id}`, {
      method: 'DELETE',
    });
  }

  async getContactInquiryStats() {
    return this.request('/contact-inquiries/stats');
  }

  // Product Message and Quote methods
  async sendProductMessage(messageData) {
    // Use existing buyer messages endpoint
    return this.request('/buyer/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        recipient_id: messageData.supplier_id,
        recipient_type: 'company',
        message: messageData.message,
        message_type: 'product_inquiry',
        product_id: messageData.product_id,
        product_context: messageData.product_context,
        inquiry_type: messageData.inquiry_type,
        quantity_of_interest: messageData.quantity_of_interest
      }),
    });
  }

  async requestProductQuote(quoteData) {
    // Use existing quotes endpoint
    return this.request('/quotes', {
      method: 'POST',
      body: JSON.stringify({
        product_id: quoteData.product_id,
        supplier_id: quoteData.supplier_id,
        quantity: quoteData.quantity,
        target_price: quoteData.target_price,
        deadline: quoteData.deadline,
        message: quoteData.message,
        product_name: quoteData.product_name,
        supplier_name: quoteData.supplier_name
      }),
    });
  }

  async getProductMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/product-messages${queryString ? `?${queryString}` : ''}`);
  }

  async getProductQuotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/product-quotes${queryString ? `?${queryString}` : ''}`);
  }

  // Shipping Address API methods
  async getShippingAddresses() {
    return this.request('/shipping-addresses');
  }

  async createShippingAddress(addressData) {
    return this.request('/shipping-addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async getShippingAddress(id) {
    return this.request(`/shipping-addresses/${id}`);
  }

  async updateShippingAddress(id, addressData) {
    return this.request(`/shipping-addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteShippingAddress(id) {
    return this.request(`/shipping-addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultShippingAddress(id) {
    return this.request(`/shipping-addresses/${id}/set-default`, {
      method: 'POST',
    });
  }

  async getDefaultShippingAddress() {
    return this.request('/shipping-addresses/default/get');
  }

  // Analytics methods
  async getDashboardAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/dashboard?${queryString}` : '/analytics/dashboard';
    return this.request(endpoint);
  }

  async getAllProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/products/all?${queryString}` : '/analytics/products/all';
    return this.request(endpoint);
  }

  async exportBuyerEngagement(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/buyer-engagement/export?${queryString}` : '/analytics/buyer-engagement/export';
    return this.request(endpoint);
  }

  async getProductOptimizations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/products/optimizations?${queryString}` : '/analytics/products/optimizations';
    return this.request(endpoint);
  }

  async getTopBuyers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/buyers/top?${queryString}` : '/analytics/buyers/top';
    return this.request(endpoint);
  }

  async getMarketTrends(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/trends?${queryString}` : '/analytics/trends';
    return this.request(endpoint);
  }

  async exportAnalyticsReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/export?${queryString}` : '/analytics/export';
    return this.request(endpoint);
  }

  // ===== PAYMENT METHODS =====

  // Create payment intent for general payments
  async createPaymentIntent(paymentData) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      data: paymentData
    });
  }

  // Create payment intent for existing orders
  async createOrderPaymentIntent(orderData) {
    return this.request('/payments/create-order-intent', {
      method: 'POST',
      data: orderData
    });
  }

  // Confirm payment
  async confirmPayment(paymentData) {
    return this.request('/payments/confirm', {
      method: 'POST',
      data: paymentData
    });
  }

  // ===== PAYOUT MANAGEMENT METHODS =====

  // Admin payout methods
  async getAdminPayouts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/payouts?${queryString}` : '/admin/payouts';
    return this.request(endpoint);
  }

  async getPayoutStatistics() {
    return this.request('/admin/payouts/statistics');
  }

  async createPayoutFromOrder(orderData) {
    return this.request('/admin/payouts/create-from-order', {
      method: 'POST',
      data: orderData
    });
  }

  async processStripePayout(payoutId) {
    return this.request(`/admin/payouts/${payoutId}/process-stripe`, {
      method: 'POST'
    });
  }

  async completeManualPayout(payoutId, data) {
    return this.request(`/admin/payouts/${payoutId}/complete-manual`, {
      method: 'POST',
      data
    });
  }

  async retryPayout(payoutId) {
    return this.request(`/admin/payouts/${payoutId}/retry`, {
      method: 'POST'
    });
  }

  // Seller payout methods
  async getSellerPayouts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/seller/payouts?${queryString}` : '/seller/payouts';
    return this.request(endpoint);
  }

  // ===== ADMIN PAYMENT LEDGER METHODS =====

  // Get payment ledger for admin
  async getAdminPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/payments?${queryString}` : '/admin/payments';
    return this.request(endpoint);
  }

  // Get payment statistics for admin
  async getPaymentStatistics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/payments/statistics?${queryString}` : '/admin/payments/statistics';
    return this.request(endpoint);
  }

  // Get detailed payment information
  async getPaymentDetails(paymentId) {
    return this.request(`/admin/payments/${paymentId}`);
  }

  // ===== AGENT MANAGEMENT METHODS =====

  // Get all agents for the company
  async getAgents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/agents?${queryString}` : '/agents';
    return this.request(endpoint);
  }

  // Create a new agent
  async createAgent(agentData) {
    return this.request('/agents', {
      method: 'POST',
      data: agentData
    });
  }

  // Get a specific agent
  async getAgent(agentId) {
    return this.request(`/agents/${agentId}`);
  }

  // Update an agent
  async updateAgent(agentId, agentData) {
    return this.request(`/agents/${agentId}`, {
      method: 'PUT',
      data: agentData
    });
  }

  // Delete an agent
  async deleteAgent(agentId) {
    return this.request(`/agents/${agentId}`, {
      method: 'DELETE'
    });
  }

  // Get agent statistics
  async getAgentStatistics() {
    return this.request('/agents/statistics');
  }

  // Get available roles and permissions
  async getAgentRoles() {
    return this.request('/agents/roles');
  }

  // Assign a conversation to an agent
  async assignConversationToAgent(conversationId, agentId) {
    return this.request('/agents/assign-conversation', {
      method: 'POST',
      data: {
        conversation_id: conversationId,
        agent_id: agentId
      }
    });
  }

  // Accept agent invitation (public endpoint)
  async acceptAgentInvitation(token, password, passwordConfirmation) {
    return this.request('/agents/accept-invitation', {
      method: 'POST',
      data: {
        token,
        password,
        password_confirmation: passwordConfirmation
      }
    });
  }

  // ==================== Admin API Methods ====================
  
  // Admin - Get all users with pagination and filters
  async getAdminUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get user statistics
  async getAdminUserStatistics() {
    return this.request('/admin/users/statistics');
  }

  // Admin - Get specific user
  async getAdminUser(id) {
    return this.request(`/admin/users/${id}`);
  }

  // Admin - Update user
  async updateAdminUser(id, data) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      data
    });
  }

  // Admin - Delete user
  async deleteAdminUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin - Toggle user status
  async toggleAdminUserStatus(id) {
    return this.request(`/admin/users/${id}/toggle-status`, {
      method: 'POST'
    });
  }

  // Admin - Reset user password
  async resetAdminUserPassword(id, password, passwordConfirmation) {
    return this.request(`/admin/users/${id}/reset-password`, {
      method: 'POST',
      data: {
        password,
        password_confirmation: passwordConfirmation
      }
    });
  }

  // Admin - Get user activity log
  async getAdminUserActivity(id) {
    return this.request(`/admin/users/${id}/activity`);
  }

  // Admin - Impersonate user
  async impersonateUser(id) {
    return this.request(`/admin/users/${id}/impersonate`, {
      method: 'POST'
    });
  }

  // Admin - Stop impersonation
  async stopImpersonation() {
    return this.request('/admin/users/stop-impersonation', {
      method: 'POST'
    });
  }

  // ==================== Admin Company Management ====================
  
  // Admin - Get all companies with pagination and filters
  async getAdminCompanies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/companies${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get company statistics
  async getAdminCompanyStatistics() {
    return this.request('/admin/companies/statistics');
  }

  // Admin - Get pending verifications
  async getAdminPendingVerifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/companies/pending-verifications${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get specific company
  async getAdminCompany(id) {
    return this.request(`/admin/companies/${id}`);
  }

  // Admin - Update company
  async updateAdminCompany(id, data) {
    return this.request(`/admin/companies/${id}`, {
      method: 'PUT',
      data
    });
  }

  // Admin - Delete company
  async deleteAdminCompany(id) {
    return this.request(`/admin/companies/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin - Verify company
  async verifyAdminCompany(id) {
    return this.request(`/admin/companies/${id}/verify`, {
      method: 'POST'
    });
  }

  // Admin - Reject company verification
  async rejectAdminCompany(id, reason) {
    return this.request(`/admin/companies/${id}/reject`, {
      method: 'POST',
      data: { reason }
    });
  }

  // Admin - Get company documents
  async getAdminCompanyDocuments(id) {
    return this.request(`/admin/companies/${id}/documents`);
  }

  // Admin - Update Stripe status
  async updateAdminCompanyStripeStatus(id, status) {
    return this.request(`/admin/companies/${id}/stripe-status`, {
      method: 'POST',
      data: { stripe_onboarding_status: status }
    });
  }

  // Admin - Get company activity
  async getAdminCompanyActivity(id) {
    return this.request(`/admin/companies/${id}/activity`);
  }

  // ==================== Admin Agent Management ====================
  
  // Admin - Get all agents with pagination and filters
  async getAdminAgents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/agents${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get agent statistics
  async getAdminAgentStatistics() {
    return this.request('/admin/agents/statistics');
  }

  // Admin - Get pending invitations
  async getAdminPendingInvitations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/agents/pending-invitations${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get specific agent
  async getAdminAgent(id) {
    return this.request(`/admin/agents/${id}`);
  }

  // Admin - Update agent
  async updateAdminAgent(id, data) {
    return this.request(`/admin/agents/${id}`, {
      method: 'PUT',
      data
    });
  }

  // Admin - Delete agent
  async deleteAdminAgent(id) {
    return this.request(`/admin/agents/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin - Toggle agent status
  async toggleAdminAgentStatus(id) {
    return this.request(`/admin/agents/${id}/toggle-status`, {
      method: 'POST'
    });
  }

  // Admin - Update agent permissions
  async updateAdminAgentPermissions(id, permissions, role) {
    return this.request(`/admin/agents/${id}/permissions`, {
      method: 'POST',
      data: { permissions, role }
    });
  }

  // Admin - Resend agent invitation
  async resendAdminAgentInvitation(id) {
    return this.request(`/admin/agents/${id}/resend-invitation`, {
      method: 'POST'
    });
  }

  // Admin - Create agent invitation
  async createAdminAgentInvitation(data) {
    return this.request('/admin/agents/create-invitation', {
      method: 'POST',
      data
    });
  }

  // Admin - Change agent company
  async changeAdminAgentCompany(id, companyId, role, permissions) {
    return this.request(`/admin/agents/${id}/change-company`, {
      method: 'POST',
      data: { company_id: companyId, role, permissions }
    });
  }

  // Admin - Get agent activity
  async getAdminAgentActivity(id) {
    return this.request(`/admin/agents/${id}/activity`);
  }

  // ==================== Admin Product Management ====================
  
  // Admin - Get all products with pagination and filters
  async getAdminProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/products${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get product statistics
  async getAdminProductStatistics() {
    return this.request('/admin/products/statistics');
  }

  // Admin - Get all categories
  async getAdminProductCategories() {
    return this.request('/admin/products/categories');
  }

  // Admin - Get out of stock products
  async getAdminOutOfStockProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/products/out-of-stock${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get low stock products
  async getAdminLowStockProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/products/low-stock${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get specific product
  async getAdminProduct(id) {
    return this.request(`/admin/products/${id}`);
  }

  // Admin - Update product
  async updateAdminProduct(id, data) {
    return this.request(`/admin/products/${id}`, {
      method: 'PUT',
      data
    });
  }

  // Admin - Delete product
  async deleteAdminProduct(id) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin - Toggle product status
  async toggleAdminProductStatus(id) {
    return this.request(`/admin/products/${id}/toggle-status`, {
      method: 'POST'
    });
  }

  // Admin - Bulk update products
  async bulkUpdateAdminProducts(productIds, action) {
    return this.request('/admin/products/bulk-update', {
      method: 'POST',
      data: {
        product_ids: productIds,
        action
      }
    });
  }

  // Admin - Get product activity
  async getAdminProductActivity(id) {
    return this.request(`/admin/products/${id}/activity`);
  }

  // ==================== Admin Order Management ====================
  
  // Admin - Get all orders with pagination and filters
  async getAdminOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get order statistics
  async getAdminOrderStatistics() {
    return this.request('/admin/orders/statistics');
  }

  // Admin - Get pending orders
  async getAdminPendingOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders/pending${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get recent orders
  async getAdminRecentOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders/recent${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get revenue statistics
  async getAdminRevenue(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders/revenue${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get orders by status
  async getAdminOrdersByStatus(status, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders/status/${status}${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get specific order
  async getAdminOrder(id) {
    return this.request(`/admin/orders/${id}`);
  }

  // Admin - Update order
  async updateAdminOrder(id, data) {
    return this.request(`/admin/orders/${id}`, {
      method: 'PUT',
      data
    });
  }

  // Admin - Update order status
  async updateAdminOrderStatus(id, status, notes = null) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'POST',
      data: { status, notes }
    });
  }

  // Admin - Update payment status
  async updateAdminOrderPaymentStatus(id, paymentStatus, notes = null) {
    return this.request(`/admin/orders/${id}/payment-status`, {
      method: 'POST',
      data: { payment_status: paymentStatus, notes }
    });
  }

  // Admin - Bulk update orders
  async bulkUpdateAdminOrders(orderIds, action, data = {}) {
    return this.request('/admin/orders/bulk-update', {
      method: 'POST',
      data: {
        order_ids: orderIds,
        action,
        ...data
      }
    });
  }

  // Admin - Get order activity
  async getAdminOrderActivity(id) {
    return this.request(`/admin/orders/${id}/activity`);
  }

  // Admin - Export orders
  async exportAdminOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders/export${queryString ? `?${queryString}` : ''}`);
  }

  // ==================== Admin Payment Management ====================
  
  // Admin - Get all payments with pagination and filters
  async getAdminPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/payments${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get payment statistics
  async getAdminPaymentStatistics() {
    return this.request('/admin/payments/statistics');
  }

  // Admin - Get completed payments
  async getAdminCompletedPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/payments/completed${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get failed payments
  async getAdminFailedPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/payments/failed${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get pending payments
  async getAdminPendingPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/payments/pending${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get revenue statistics
  async getAdminPaymentRevenue(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/payments/revenue${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get platform fees
  async getAdminPlatformFees(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/payments/platform-fees${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get payments by method
  async getAdminPaymentsByMethod(method, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/payments/method/${method}${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get specific payment
  async getAdminPayment(id) {
    return this.request(`/admin/payments/${id}`);
  }

  // Admin - Get payment activity
  async getAdminPaymentActivity(id) {
    return this.request(`/admin/payments/${id}/activity`);
  }

  // Admin - Export payments
  async exportAdminPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/payments/export${queryString ? `?${queryString}` : ''}`);
  }

  // ==================== Admin Stripe Management ====================
  
  // Admin - Get Stripe overview
  async getAdminStripeOverview() {
    return this.request('/admin/stripe/overview');
  }

  // Admin - Get connected Stripe accounts
  async getAdminStripeAccounts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/stripe/accounts${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get Stripe account details
  async getAdminStripeAccountDetails(companyId) {
    return this.request(`/admin/stripe/accounts/${companyId}`);
  }

  // Admin - Get Stripe transactions
  async getAdminStripeTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/stripe/transactions${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get Stripe payouts
  async getAdminStripePayouts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/stripe/payouts${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get Stripe configuration status
  async getAdminStripeConfig() {
    return this.request('/admin/stripe/config');
  }

  // Admin - Test Stripe connection
  async testAdminStripeConnection() {
    return this.request('/admin/stripe/test-connection', {
      method: 'POST'
    });
  }

  // ==================== Admin Chat Monitoring ====================
  
  // Admin - Get chat statistics
  async getAdminChatStatistics() {
    return this.request('/admin/chat/statistics');
  }

  // Admin - Get all conversations
  async getAdminConversations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/chat/conversations${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get recent conversations
  async getAdminRecentConversations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/chat/conversations/recent${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get active conversations
  async getAdminActiveConversations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/chat/conversations/active${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get specific conversation
  async getAdminConversation(id) {
    return this.request(`/admin/chat/conversations/${id}`);
  }

  // Admin - Get conversation messages
  async getAdminConversationMessages(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/chat/conversations/${id}/messages${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get conversation activity
  async getAdminConversationActivity(id) {
    return this.request(`/admin/chat/conversations/${id}/activity`);
  }

  // Admin - Update conversation status
  async updateAdminConversationStatus(id, status) {
    return this.request(`/admin/chat/conversations/${id}/status`, {
      method: 'PUT',
      data: { status }
    });
  }

  // Admin - Assign agent to conversation
  async assignAgentToConversation(id, agentId, assignmentType = 'manual') {
    return this.request(`/admin/chat/conversations/${id}/assign-agent`, {
      method: 'POST',
      data: { agent_id: agentId, assignment_type: assignmentType }
    });
  }

  // Admin - Search messages
  async searchAdminMessages(query, params = {}) {
    const searchParams = new URLSearchParams({ query, ...params }).toString();
    return this.request(`/admin/chat/messages/search?${searchParams}`);
  }

  // Admin - Get unread messages count
  async getAdminUnreadMessagesCount() {
    return this.request('/admin/chat/unread-count');
  }

  // ==================== Admin Inquiry Management ====================
  
  // Admin - Get inquiry statistics
  async getAdminInquiryStatistics() {
    return this.request('/admin/inquiries/statistics');
  }

  // Admin - Get all inquiries
  async getAdminInquiries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/inquiries${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get pending inquiries
  async getAdminPendingInquiries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/inquiries/pending${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get recent inquiries
  async getAdminRecentInquiries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/inquiries/recent${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Get specific inquiry
  async getAdminInquiry(id) {
    return this.request(`/admin/inquiries/${id}`);
  }

  // Admin - Update inquiry
  async updateAdminInquiry(id, data) {
    return this.request(`/admin/inquiries/${id}`, {
      method: 'PUT',
      data
    });
  }

  // Admin - Delete inquiry
  async deleteAdminInquiry(id) {
    return this.request(`/admin/inquiries/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin - Bulk update inquiries
  async bulkUpdateAdminInquiries(inquiryIds, action, data = {}) {
    return this.request('/admin/inquiries/bulk-update', {
      method: 'POST',
      data: {
        inquiry_ids: inquiryIds,
        action,
        ...data
      }
    });
  }
}

const apiService = new ApiService();
export default apiService;

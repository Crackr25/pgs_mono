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

  async respondToQuote(id, responseData) {
    return this.request(`/quotes/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData),
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

  async sendMessage(conversationId, message, attachment = null) {
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    formData.append('message', message);
    formData.append('message_type', attachment ? (attachment.type.startsWith('image/') ? 'image' : 'file') : 'text');
    
    if (attachment) {
      formData.append('attachment', attachment);
    }

    return this.request('/chat/send', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        'Authorization': `Bearer ${this.token}`,
      },
    });
  }

  // Buyer-specific message methods
  async getBuyerConversations() {
    return this.request('/buyer/conversations');
  }

  async getBuyerConversationMessages(conversationId) {
    return this.request(`/buyer/conversations/${conversationId}`);
  }

  async sendBuyerMessage(messageData) {
    return this.request('/buyer/messages/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markBuyerMessagesAsRead(data) {
    return this.request('/buyer/messages/mark-read', {
      method: 'POST',
      body: JSON.stringify(data),
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
    return this.request(`/marketplace/products${queryString ? `?${queryString}` : ''}`);
  }

  async getMarketplaceProductDetails(id) {
    return this.request(`/marketplace/products/${id}`);
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
    return this.request(`/saved-products/check/${productId}`);
  }

  // Supplier methods
  async getSupplierDetails(supplierId) {
    return this.request(`/suppliers/${supplierId}`);
  }

  async getSupplierProducts(supplierId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/suppliers/${supplierId}/products${queryString ? `?${queryString}` : ''}`);
  }

  async getSupplierReviews(supplierId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/suppliers/${supplierId}/reviews${queryString ? `?${queryString}` : ''}`);
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
    return this.request(`/starred-suppliers/check/${supplierId}`);
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
      method: 'DELETE',
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

  async bulkUpdateQuotes(quoteIds, action, data = {}) {
    return this.request('/quotes/bulk', {
      method: 'POST',
      body: JSON.stringify({
        quote_ids: quoteIds,
        action,
        ...data
      }),
    });
  }


}

const apiService = new ApiService();
export default apiService;

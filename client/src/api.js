import axios from 'axios';

// Use relative URL - works for both localhost and ngrok
const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - HANDLES NEW MVC FORMAT
api.interceptors.response.use(
  (response) => {
    // Transform response to extract data from MVC format
    if (response.data && response.data.success !== undefined) {
      // New MVC format: { success, data, message }
      return {
        ...response,
        data: response.data.data || response.data
      };
    }
    // Old format - return as is
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== INVENTORY API ====================
export const inventoryApi = {
  // Get all inventory items with filters and pagination
  getItems: (filters = {}, page = 1, limit = 10) => {
    const params = { ...filters, page, limit };
    return api.get('/inventory', { params });
  },

  // Get analytics
  getAnalytics: () => {
    return api.get('/inventory/analytics');
  },

  // Manual add inventory
  manualAdd: (data) => {
    return api.post('/inventory/manual-add', data);
  },

  // Manual adjust inventory
  manualAdjust: (data) => {
    return api.post('/inventory/manual-adjust', data);
  },

  // Get transaction history for an item
  getTransactions: (itemId) => {
    return api.get(`/inventory/${itemId}/transactions`);
  },

  // Delete inventory item
  deleteItem: (itemId) => {
    return api.delete(`/inventory/${itemId}`);
  },
};

// ==================== PROCUREMENT API ====================
export const procurementApi = {
  // Get all procurements with filters
  getAll: (filters = {}, page = 1, limit = 10) => {
    const params = { ...filters, page, limit };
    return api.get('/procurements', { params });
  },

  // Get procurement by ID
  getById: (id) => {
    return api.get(`/procurements/${id}`);
  },

  // Create procurement
  create: (data) => {
    return api.post('/procurements', data);
  },

  // Get analytics
  getAnalytics: () => {
    return api.get('/procurements/analytics');
  },

  // Delete procurement item
  deleteItem: (itemId) => {
    return api.delete(`/procurements/items/${itemId}`);
  },

  // Add item to procurement
  addItem: (procurementId, itemData) => {
    return api.post(`/procurements/${procurementId}/items`, itemData);
  },
};

// ==================== VENDOR API ====================
export const vendorApi = {
  // Get all vendors
  getAll: (page = 1, limit = 10) => {
    return api.get('/vendors', { params: { page, limit } });
  },

  // Get vendor by ID
  getById: (id) => {
    return api.get(`/vendors/${id}`);
  },

  // Create vendor
  create: (data) => {
    return api.post('/vendors', data);
  },

  // Update vendor
  update: (id, data) => {
    return api.put(`/vendors/${id}`, data);
  },

  // Check company name availability
  checkCompanyName: (name, excludeId = null) => {
    const params = excludeId ? { excludeId } : {};
    return api.get(`/vendors/check-company-name/${name}`, { params });
  },

  // Check GST availability
  checkGst: (gst, excludeId = null) => {
    const params = excludeId ? { excludeId } : {};
    return api.get(`/vendors/check-gst/${gst}`, { params });
  },

  // Get analytics
  getAnalytics: () => {
    return api.get('/vendors/analytics');
  },
};

// ==================== MASTER DATA API ====================
export const masterDataApi = {
  // Get all stones
  getStones: () => {
    return api.get('/master/stones');
  },

  // Get all stages
  getStages: () => {
    return api.get('/master/stages');
  },

  // Get all edge types
  getEdges: () => {
    return api.get('/master/edges');
  },

  // Get all finishing types
  getFinishes: () => {
    return api.get('/master/finishes');
  },

  // Get HSN codes
  getHsnCodes: () => {
    return api.get('/master/hsn-codes');
  },
};

// ==================== VENDOR PROCUREMENT API ====================
export const vendorProcurementApi = {
  // Get all vendors with procurement counts
  getVendors: (search = '') => {
    const params = search ? { search } : {};
    return api.get('/vendor-procurement/vendors', { params });
  },

  // Get vendor details
  getVendorDetails: (vendorId) => {
    return api.get(`/vendor-procurement/vendors/${vendorId}`);
  },

  // Get procurement items for a vendor
  getVendorProcurementItems: (vendorId, filters = {}) => {
    const params = { ...filters };
    return api.get(`/vendor-procurement/vendors/${vendorId}/items`, { params });
  },

  // Get filter options
  getFilterOptions: () => {
    return api.get('/vendor-procurement/filter-options');
  },

  // Get stone names by type
  getStoneNames: (stoneType = '') => {
    const params = stoneType ? { stoneType } : {};
    return api.get('/vendor-procurement/stones/names', { params });
  },

  // Generate PDF
  generatePDF: (data) => {
    return api.post('/vendor-procurement/pdf', data, {
      responseType: 'blob',
    });
  },
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
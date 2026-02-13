import axios from 'axios';

const API_URL = "http://localhost:5001/api";

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("ec_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ec_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const DataService = {
  // === AUTH ===
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      if (response.data.token) {
        localStorage.setItem("ec_admin_token", response.data.token);
        localStorage.setItem("ec_admin_user", JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false, message: "No token received" };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Invalid credentials" 
      };
    }
  },
  logout: () => {
    localStorage.removeItem("ec_admin_token");
    localStorage.removeItem("ec_admin_user");
  },
  isAuthenticated: () => !!localStorage.getItem("ec_admin_token"),

  // === NOTIFICATIONS (Topbar bell) ===
  getNotificationHistory: async () => {
    try {
      const res = await api.get('/notifications');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      return [];
    }
  },
  saveNotification: async (notif) => api.post('/notifications', notif),

  // === ORDERS ===
  getOrders: async (params = {}) => {
    try {
      const res = await api.get('/orders', { params });
      const rawData = res.data.data || res.data;
      const data = Array.isArray(rawData) ? rawData : [];
      return {
        data: data.map(o => ({
          ...o,
          customer: o.user?.name || o.customer || "Guest",
          date: o.createdAt || o.date,
          type: o.type || "Standard"
        })),
        meta: res.data.meta || { total: data.length, page: 1, limit: data.length, totalPages: 1 }
      };
    } catch (e) {
      return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },
  bulkUpdateOrderStatus: async (ids, status) => api.post('/orders/bulk-status', { ids, status }),
  getOrder: async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    } catch (e) {
      return null;
    }
  },
  updateOrderStatus: async (id, status) => api.patch(`/orders/${id}/status`, { status }),

  // === CUSTOMERS (uses /users endpoint) ===
  getCustomers: async (params = {}) => {
    try {
      const res = await api.get('/users', { params });
      const rawData = res.data.data || res.data;
      const data = Array.isArray(rawData) ? rawData : [];
      return {
        data,
        meta: res.data.meta || { total: data.length, page: 1, limit: data.length, totalPages: 1 }
      };
    } catch (e) {
      return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },
  updateCustomer: async (id, data) => api.put(`/users/${id}`, data),
  deleteCustomer: async (id) => api.delete(`/users/${id}`),
  saveCustomer: async (customer) => {
    if (customer.id && typeof customer.id === 'number' && customer.id < 1000000000) {
      return api.put(`/users/${customer.id}`, customer);
    }
    return api.post('/users/register', customer);
  },

  // === SETTINGS ===
  getSettings: async () => {
    try {
      const res = await api.get('/settings');
      return res.data || {};
    } catch (e) {
      return {};
    }
  },
  saveSettings: async (settings) => api.post('/settings', settings),

  // === TICKETS ===
  getTickets: async () => {
    try {
      const res = await api.get('/tickets');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      return [];
    }
  },
  updateTicket: async (id, status) => api.patch(`/tickets/${id}/status`, { status }),
  replyToTicket: async (id, message) => api.post(`/tickets/${id}/reply`, { message }),

  // === REVIEWS ===
  getReviews: async () => {
    try {
      const res = await api.get('/reviews');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      return [];
    }
  },
  updateReview: async (id, status) => api.patch(`/reviews/${id}/status`, { status }),
  deleteReview: async (id) => api.delete(`/reviews/${id}`),

  // === CATEGORIES ===
  getCategories: async () => {
    try {
      const res = await api.get('/categories');
      const data = Array.isArray(res.data) ? res.data : [];
      return data.filter(c => !c.parent);
    } catch (error) {
      console.error("Fetch categories failed", error);
      return [];
    }
  },
  getSubCategories: async () => {
    try {
      const res = await api.get('/categories');
      const data = Array.isArray(res.data) ? res.data : [];
      return data.filter(c => c.parent).map(c => ({
        ...c,
        parent_id: c.parent.id
      }));
    } catch (error) {
      return [];
    }
  },
  saveCategory: async (cat) => {
    if (cat.id && typeof cat.id === 'number' && cat.id < 1000000000) {
      return api.put(`/categories/${cat.id}`, cat);
    } else {
      return api.post('/categories', cat);
    }
  },
  deleteCategory: async (id) => api.delete(`/categories/${id}`),
  
  saveSubCategory: async (sub) => {
    const payload = { ...sub, parentId: sub.parent_id };
    if (sub.id && typeof sub.id === 'number' && sub.id < 1000000000) {
        return api.put(`/categories/${sub.id}`, payload);
    } else {
        return api.post('/categories', payload);
    }
  },
  deleteSubCategory: async (id) => api.delete(`/categories/${id}`),

  // === BRANDS ===
  getBrands: async () => {
    try {
      const res = await api.get('/brands');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      return [
        { id: 1, name: "Samsung" }, { id: 2, name: "Apple" }, { id: 3, name: "Nike" }, { id: 4, name: "Nestle" }
      ];
    }
  },
  saveBrand: async (brand) => {
    if (brand.id && typeof brand.id === 'number' && brand.id < 1000000000) {
      return api.put(`/brands/${brand.id}`, brand);
    } else {
      return api.post('/brands', brand);
    }
  },
  deleteBrand: async (id) => api.delete(`/brands/${id}`),

  // === PRODUCTS ===
  getProducts: async (params = {}) => {
    try {
      const res = await api.get('/products', { params });
      const rawData = res.data.data || res.data;
      const data = Array.isArray(rawData) ? rawData : [];
      return {
        data: data.map(p => ({
            ...p,
            category_id: p.category?.id || p.category_id,
            status: p.stock > 0 ? "Active" : "Out of Stock",
            quantity: p.stock
          })),
        meta: res.data.meta || { total: data.length, page: 1, limit: data.length, totalPages: 1 }
      };
    } catch (error) {
      return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },
  bulkDeleteProducts: async (ids) => api.post('/products/bulk-delete', { ids }),
  bulkUpdateProductStatus: async (ids, isActive) => api.post('/products/bulk-status', { ids, isActive }),
  saveProduct: async (prod) => {
    const payload = {
      ...prod,
      stock: parseInt(prod.quantity),
      categoryId: parseInt(prod.category_id)
    };
    // Check if it's an edit (has a real database ID, not a timestamp)
    // Database IDs are sequential and small, timestamps are large (> 1000000000000)
    const isEdit = prod.id && typeof prod.id === 'number' && prod.id < 1000000000000;
    
    if (isEdit) {
      return api.put(`/products/${prod.id}`, payload);
    } else {
      return api.post('/products', payload);
    }
  },
  deleteProduct: async (id) => api.delete(`/products/${id}`),

  // === OFFERS & BANNERS ===
  getOffers: async () => {
    try {
      const res = await api.get('/offers');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      return [];
    }
  },
  saveOffer: async (offer) => api.post('/offers', offer),
  updateProfile: async (data) => api.post('/users/update-profile', data),
  updatePassword: async (data) => api.post('/users/update-password', data),
  testEmail: async (data) => api.post('/users/test-email', data),
  deleteOffer: async (id) => api.delete(`/offers/${id}`),

  getRiders: async () => api.get('/riders').then(res => res.data),
  saveRider: async (rider) => {
    if (rider.id) return api.put(`/riders/${rider.id}`, rider);
    return api.post('/riders', rider);
  },
  deleteRider: async (id) => api.delete(`/riders/${id}`),

  getWalletHistory: async (userId) => api.get(`/wallet/history/${userId}`).then(res => res.data),
  addWalletFunds: async (userId, amount, reason) => api.post('/wallet/add', { userId, amount, reason }).then(res => res.data),

  // === ZONES ===
  getZones: async () => {
    try {
        const res = await api.get('/zones');
        return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
        return [];
    }
  },
  saveZone: async (zone) => {
    if (zone.id && typeof zone.id === 'number') {
        return api.put(`/zones/${zone.id}`, zone);
    } else {
        return api.post('/zones', zone);
    }
  },
  deleteZone: async (id) => api.delete(`/zones/${id}`),
  toggleSurge: async (id, active, multiplier) => api.post(`/zones/${id}/surge`, { active, multiplier }),

  // === BANNERS ===
  getBanners: async () => {
    try {
      const res = await api.get('/banners');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      return [];
    }
  },
  saveBanner: async (banner) => api.post('/banners', banner),
  deleteBanner: async (id) => api.delete(`/banners/${id}`),

  // === COUPONS ===
  getCoupons: async () => {
    try {
        const res = await api.get('/coupons');
        return Array.isArray(res.data) ? res.data : [];
    } catch(e) { return []; }
  },
  saveCoupon: async (coupon) => api.post('/coupons', coupon),
  deleteCoupon: async (id) => api.delete(`/coupons/${id}`),

  // === AUTOMATION ===
  getAbandonedCarts: async () => {
    try {
        const res = await api.get('/automation/abandoned-carts');
        return Array.isArray(res.data) ? res.data : [];
    } catch(e) { return []; }
  },
  triggerRecovery: async (cartId) => api.post('/automation/trigger-recovery', { cartId }),
  getAutomationStats: async () => api.get('/automation/stats').then(res => res.data),

  // === ANALYTICS ===
  getStats: async () => {
    try {
      const res = await api.get('/analytics/stats');
      return res.data;
    } catch (e) {
      return { totalOrders: 0, totalProducts: 0, totalCustomers: 0, totalRevenue: 0, activeUsers: 0 };
    }
  },

  // === UPLOAD ===
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data; // { url: '...' }
  },
};

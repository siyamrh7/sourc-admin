import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Check if this is a customer-related request
      if (config.url?.includes('/customer-auth/')) {
        const customerToken = localStorage.getItem('customerToken');
        if (customerToken) {
          config.headers.Authorization = `Bearer ${customerToken}`;
        }
      } else {
        // Use admin token for other requests
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // Check if this is a customer-related request
      if (error.config?.url?.includes('/customer-auth/') || currentPath === '/' || currentPath === '/customer-dashboard') {
        // Clear customer tokens and redirect to customer login (root page)
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customer');
        if (currentPath !== '/') {
          window.location.href = '/';
        }
      } else {
        // Clear admin tokens and redirect to admin login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (currentPath !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
};

// Orders API
export const ordersAPI = {
  getOrders: (params = {}) => API.get('/orders', { params }),
  getOrder: (orderId) => API.get(`/orders/${orderId}`),
  createOrder: (orderData) => API.post('/orders', orderData),
  updateOrder: (orderId, orderData) => API.put(`/orders/${orderId}`, orderData),
  deleteOrder: (orderId) => API.delete(`/orders/${orderId}`),
  advanceOrder: (orderId) => API.patch(`/orders/${orderId}/advance`),
  updateOrderPhase: (orderId, phaseData) => API.patch(`/orders/${orderId}/phase`, phaseData),
  getOrderStats: () => API.get('/orders/stats'),
  searchOrders: (query) => API.get('/orders/search', { params: { q: query } }),
};

// Customers API
export const customersAPI = {
  getCustomers: () => API.get('/customers'),
  getCustomer: (customerId) => API.get(`/customers/${customerId}`),
  createCustomer: (customerData) => API.post('/customers', customerData),
  updateCustomer: (customerId, customerData) => API.put(`/customers/${customerId}`, customerData),
  deleteCustomer: (customerId) => API.delete(`/customers/${customerId}`),
};

// Customer Authentication API
export const customerAuthAPI = {
  login: (credentials) => API.post('/customer-auth/login', credentials),
  logout: () => API.post('/customer-auth/logout'),
  getMe: () => API.get('/customer-auth/me'),
  updateProfile: (profileData) => API.put('/customer-auth/update-profile', profileData),
  changePassword: (passwordData) => API.put('/customer-auth/change-password', passwordData),
  getMyOrders: (filters) => API.get('/customer-auth/orders', { params: filters }),
  getMyOrder: (orderId) => API.get(`/customer-auth/orders/${orderId}`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => API.get('/admin/dashboard'),
  getAdmins: () => API.get('/admin/admins'),
  createAdmin: (adminData) => API.post('/admin/admins', adminData),
};

export default API; 
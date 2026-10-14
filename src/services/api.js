import axios from 'axios';

/**
 * Axios instance configured for ShopKart authentication and APIs.
 * 
 * Supports both:
 * 1. HttpOnly cookies via withCredentials: true
 * 2. Bearer token via Authorization request header
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------------------------------------------------
// Authentication APIs (Lab 01)
// -------------------------------------------------------------
export const registerCustomer = async (data) => {
  const response = await api.post('/customers/register', data);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const loginCustomer = async (credentials) => {
  const response = await api.post('/customers/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

export const logoutCustomer = async () => {
  try {
    const response = await api.post('/customers/logout');
    return response.data;
  } finally {
    localStorage.removeItem('token');
  }
};

// -------------------------------------------------------------
// Product Catalog APIs (Lab 03)
// -------------------------------------------------------------
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// -------------------------------------------------------------
// Cart APIs (Lab 05)
// -------------------------------------------------------------
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post(`/cart/${productId}`, { quantity });
  return response.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

// -------------------------------------------------------------
// Checkout & Order APIs (Lab 06)
// -------------------------------------------------------------
/**
 * Task 4: Create pending ShopKart order and Razorpay order
 * @param {Object} shippingAddress - { fullName, phone, addressLine1, city, state, pincode }
 */
export const createPaymentOrder = async (payload) => {
  const shippingAddress = payload.shippingAddress ? payload.shippingAddress : payload;
  const response = await api.post('/orders/create-payment-order', { shippingAddress });
  return response.data;
};

/**
 * Task 4 & 5: Verify payment signature and confirm order
 * @param {Object} paymentData - { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPayment = async (paymentData) => {
  const response = await api.post('/orders/verify-payment', paymentData);
  return response.data;
};

/**
 * Task 7: Fetch current user's orders (newest first)
 */
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

/**
 * Single Order API
 */
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

/**
 * Bonus: Update order progression status
 */
export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export default api;

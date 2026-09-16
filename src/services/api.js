import axios from 'axios';

/**
 * Axios instance configured for ShopKart authentication.
 * 
 * CRITICAL: withCredentials: true ensures that:
 * 1. The browser saves the 'token' HttpOnly cookie sent in Set-Cookie headers.
 * 2. The browser automatically includes this cookie in subsequent cross-origin or
 *    same-origin requests to /customers/me, /customers/logout, etc.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Task 1: Register a new customer
 * @param {Object} data - { fullName, email, password, phone }
 */
export const registerCustomer = async (data) => {
  const response = await api.post('/customers/register', data);
  return response.data;
};

/**
 * Task 2: Login customer and receive HttpOnly cookie
 * @param {Object} credentials - { email, password }
 */
export const loginCustomer = async (credentials) => {
  const response = await api.post('/customers/login', credentials);
  return response.data;
};

/**
 * Task 3: Fetch currently logged-in customer profile (Protected Route)
 * Returns { _id, fullName, email, phone }
 */
export const getProfile = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

/**
 * Task 4: Logout customer and clear auth cookie
 */
export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

export default api;

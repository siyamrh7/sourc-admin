import { customerAuthAPI } from '../../services/api';
import {
  CUSTOMER_LOGIN_START,
  CUSTOMER_LOGIN_SUCCESS,
  CUSTOMER_LOGIN_FAILURE,
  CUSTOMER_LOGOUT,
  CUSTOMER_CLEAR_AUTH_ERROR,
  CUSTOMER_CHECK_AUTH,
  CUSTOMER_UPDATE_PROFILE_START,
  CUSTOMER_UPDATE_PROFILE_SUCCESS,
  CUSTOMER_UPDATE_PROFILE_FAILURE
} from '../types';

// Action creators
const customerLoginStart = () => ({
  type: CUSTOMER_LOGIN_START
});

const customerLoginSuccess = (data) => ({
  type: CUSTOMER_LOGIN_SUCCESS,
  payload: data
});

const customerLoginFailure = (error) => ({
  type: CUSTOMER_LOGIN_FAILURE,
  payload: error
});

const customerLogout = () => ({
  type: CUSTOMER_LOGOUT
});

const customerClearAuthError = () => ({
  type: CUSTOMER_CLEAR_AUTH_ERROR
});

const customerCheckAuth = () => ({
  type: CUSTOMER_CHECK_AUTH
});

// Async thunks
export const loginCustomer = (credentials) => {
  return async (dispatch) => {
    try {
      dispatch(customerLoginStart());
      
      const response = await customerAuthAPI.login(credentials);
      
      if (response.data.success) {
        dispatch(customerLoginSuccess({
          token: response.data.token,
          customer: response.data.data
        }));
        return { success: true };
      } else {
        dispatch(customerLoginFailure(response.data.message || 'Login failed'));
        return { success: false };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch(customerLoginFailure(errorMessage));
      return { success: false };
    }
  };
};

export const logoutCustomer = () => {
  return async (dispatch) => {
    try {
      await customerAuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(customerLogout());
    }
  };
};

export const getCurrentCustomer = () => {
  return async (dispatch) => {
    try {
      const response = await customerAuthAPI.getMe();
      
      if (response.data.success) {
        // Check if we have a token in storage
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('customerToken');
          if (token) {
            dispatch(customerLoginSuccess({
              token,
              customer: response.data.data
            }));
          }
        }
      }
    } catch (error) {
      // If token is invalid, clear auth state
      dispatch(customerLogout());
    }
  };
};

export const getCustomerOrders = (filters = {}) => {
  return async (dispatch) => {
    try {
      const response = await customerAuthAPI.getMyOrders(filters);
      
      if (response.data.success) {
        return { success: true, data: response.data.data, pagination: response.data.pagination };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch orders' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders. Please try again.';
      return { success: false, error: errorMessage };
    }
  };
};

// Export action creators
export { 
  customerLoginStart,
  customerLoginSuccess,
  customerLoginFailure,
  customerLogout as logout,
  customerClearAuthError as clearCustomerAuthError,
  customerCheckAuth as checkCustomerAuth
}; 
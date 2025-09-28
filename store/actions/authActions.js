import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  CLEAR_AUTH_ERROR,
  CHECK_AUTH
} from '../types';
import { authAPI } from '../../services/api';

// Action creators
export const loginStart = () => ({
  type: LOGIN_START
});

export const loginSuccess = (data) => ({
  type: LOGIN_SUCCESS,
  payload: data
});

export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error
});

export const logout = () => ({
  type: LOGOUT
});

export const clearAuthError = () => ({
  type: CLEAR_AUTH_ERROR
});

export const checkAuth = () => ({
  type: CHECK_AUTH
});

// Async action creators (thunks)
export const loginUser = (credentials) => {
  return async (dispatch) => {
    try {
      dispatch(loginStart());
      
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        dispatch(loginSuccess({
          token: response.data.token,
          user: response.data.data
        }));
        return { success: true };
      } else {
        dispatch(loginFailure(response.data.error || 'Login failed'));
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  };
};

export const logoutUser = () => {
  return async (dispatch) => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
    }
  };
};

export const getCurrentUser = () => {
  return async (dispatch) => {
    try {
      const response = await authAPI.getMe();
      
      if (response.data.success) {
        // Update user data if token is still valid
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            dispatch(loginSuccess({
              token,
              user: response.data.data
            }));
          }
        }
      }
    } catch (error) {
      // Token is invalid, logout user
      dispatch(logout());
    }
  };
}; 
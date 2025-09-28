import {
  FETCH_CUSTOMERS_START,
  FETCH_CUSTOMERS_SUCCESS,
  FETCH_CUSTOMERS_FAILURE,
  CREATE_CUSTOMER_START,
  CREATE_CUSTOMER_SUCCESS,
  CREATE_CUSTOMER_FAILURE,
  DELETE_CUSTOMER_START,
  DELETE_CUSTOMER_SUCCESS,
  DELETE_CUSTOMER_FAILURE
} from '../types';
import { customersAPI } from '../../services/api';

// Fetch Customers
export const fetchCustomers = () => {
  return async (dispatch) => {
    try {
      dispatch({ type: FETCH_CUSTOMERS_START });
      
      const response = await customersAPI.getCustomers();
      
      if (response.data.success) {
        dispatch({
          type: FETCH_CUSTOMERS_SUCCESS,
          payload: response.data.data
        });
        return { success: true };
      } else {
        dispatch({
          type: FETCH_CUSTOMERS_FAILURE,
          payload: response.data.error || 'Failed to fetch customers'
        });
        return { success: false };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch customers';
      dispatch({
        type: FETCH_CUSTOMERS_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
};

// Create Customer
export const createCustomer = (customerData) => {
  return async (dispatch) => {
    try {
      dispatch({ type: CREATE_CUSTOMER_START });
      
      const response = await customersAPI.createCustomer(customerData);
      
      if (response.data.success) {
        dispatch({
          type: CREATE_CUSTOMER_SUCCESS,
          payload: response.data.data
        });
        return { success: true, data: response.data.data };
      } else {
        dispatch({
          type: CREATE_CUSTOMER_FAILURE,
          payload: response.data.error || 'Failed to create customer'
        });
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create customer';
      dispatch({
        type: CREATE_CUSTOMER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
};

// Delete Customer
export const deleteCustomer = (customerId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: DELETE_CUSTOMER_START });
      
      const response = await customersAPI.deleteCustomer(customerId);
      
      if (response.data.success) {
        dispatch({
          type: DELETE_CUSTOMER_SUCCESS,
          payload: customerId
        });
        return { success: true };
      } else {
        dispatch({
          type: DELETE_CUSTOMER_FAILURE,
          payload: response.data.error || 'Failed to delete customer'
        });
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete customer';
      dispatch({
        type: DELETE_CUSTOMER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
}; 
import {
  FETCH_ORDERS_START,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
  FETCH_ORDER_START,
  FETCH_ORDER_SUCCESS,
  FETCH_ORDER_FAILURE,
  CREATE_ORDER_START,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  UPDATE_ORDER_START,
  UPDATE_ORDER_SUCCESS,
  UPDATE_ORDER_FAILURE,
  DELETE_ORDER_START,
  DELETE_ORDER_SUCCESS,
  DELETE_ORDER_FAILURE,
  ADVANCE_ORDER_START,
  ADVANCE_ORDER_SUCCESS,
  ADVANCE_ORDER_FAILURE,
  FETCH_ORDER_STATS_START,
  FETCH_ORDER_STATS_SUCCESS,
  FETCH_ORDER_STATS_FAILURE
} from '../types';
import { ordersAPI } from '../../services/api';

// Fetch Orders
export const fetchOrders = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch({ type: FETCH_ORDERS_START });
      
      const response = await ordersAPI.getOrders(params);
      
      if (response.data.success) {
        dispatch({
          type: FETCH_ORDERS_SUCCESS,
          payload: {
            data: response.data.data,
            pagination: response.data.pagination
          }
        });
        return { success: true };
      } else {
        dispatch({
          type: FETCH_ORDERS_FAILURE,
          payload: response.data.error || 'Failed to fetch orders'
        });
        return { success: false };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch orders';
      dispatch({
        type: FETCH_ORDERS_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
};

// Fetch Single Order
export const fetchOrder = (orderId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: FETCH_ORDER_START });
      
      const response = await ordersAPI.getOrder(orderId);
      
      if (response.data.success) {
        dispatch({
          type: FETCH_ORDER_SUCCESS,
          payload: response.data.data
        });
        return { success: true };
      } else {
        dispatch({
          type: FETCH_ORDER_FAILURE,
          payload: response.data.error || 'Failed to fetch order'
        });
        return { success: false };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch order';
      dispatch({
        type: FETCH_ORDER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
};

// Create Order
export const createOrder = (orderData) => {
  return async (dispatch) => {
    try {
      dispatch({ type: CREATE_ORDER_START });
      
      const response = await ordersAPI.createOrder(orderData);
      
      if (response.data.success) {
        dispatch({
          type: CREATE_ORDER_SUCCESS,
          payload: response.data.data
        });
        return { success: true, data: response.data.data };
      } else {
        dispatch({
          type: CREATE_ORDER_FAILURE,
          payload: response.data.error || 'Failed to create order'
        });
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create order';
      dispatch({
        type: CREATE_ORDER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
};

// Update Order
export const updateOrder = (orderId, orderData) => {
  return async (dispatch) => {
    try {
      dispatch({ type: UPDATE_ORDER_START });
      
      const response = await ordersAPI.updateOrder(orderId, orderData);
      
      if (response.data.success) {
        dispatch({
          type: UPDATE_ORDER_SUCCESS,
          payload: response.data.data
        });
        return { success: true, data: response.data.data };
      } else {
        dispatch({
          type: UPDATE_ORDER_FAILURE,
          payload: response.data.error || 'Failed to update order'
        });
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update order';
      dispatch({
        type: UPDATE_ORDER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
};

// Delete Order
export const deleteOrder = (orderId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: DELETE_ORDER_START });
      
      const response = await ordersAPI.deleteOrder(orderId);
      
      if (response.data.success) {
        dispatch({
          type: DELETE_ORDER_SUCCESS,
          payload: orderId
        });
        return { success: true };
      } else {
        dispatch({
          type: DELETE_ORDER_FAILURE,
          payload: response.data.error || 'Failed to delete order'
        });
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete order';
      dispatch({
        type: DELETE_ORDER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
};

// Hard Delete Order
export const hardDeleteOrder = (orderId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: DELETE_ORDER_START });

      const response = await ordersAPI.hardDeleteOrder(orderId);

      if (response.data.success) {
        dispatch({
          type: DELETE_ORDER_SUCCESS,
          payload: orderId
        });
        return { success: true };
      } else {
        dispatch({
          type: DELETE_ORDER_FAILURE,
          payload: response.data.error || 'Failed to delete order permanently'
        });
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete order permanently';
      dispatch({
        type: DELETE_ORDER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
};

// Advance Order Phase
export const advanceOrderPhase = (orderId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: ADVANCE_ORDER_START });
      
      const response = await ordersAPI.advanceOrder(orderId);
      
      if (response.data.success) {
        dispatch({
          type: ADVANCE_ORDER_SUCCESS,
          payload: response.data.data
        });
        return { success: true, data: response.data.data };
      } else {
        dispatch({
          type: ADVANCE_ORDER_FAILURE,
          payload: response.data.error || 'Failed to advance order'
        });
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to advance order';
      dispatch({
        type: ADVANCE_ORDER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
};

// Fetch Order Statistics
export const fetchOrderStats = () => {
  return async (dispatch) => {
    try {
      dispatch({ type: FETCH_ORDER_STATS_START });
      
      const response = await ordersAPI.getOrderStats();
      
      if (response.data.success) {
        dispatch({
          type: FETCH_ORDER_STATS_SUCCESS,
          payload: response.data.data
        });
        return { success: true };
      } else {
        dispatch({
          type: FETCH_ORDER_STATS_FAILURE,
          payload: response.data.error || 'Failed to fetch order statistics'
        });
        return { success: false };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch order statistics';
      dispatch({
        type: FETCH_ORDER_STATS_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };
}; 
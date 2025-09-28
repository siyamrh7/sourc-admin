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

const initialState = {
  isAuthenticated: false,
  customer: null,
  token: null,
  isLoading: false,
  error: null
};

// Initialize from localStorage if available (SSR-safe)
if (typeof window !== 'undefined') {
  const tokenFromStorage = localStorage.getItem('customerToken');
  const customerFromStorage = localStorage.getItem('customer');
  
  if (tokenFromStorage && customerFromStorage) {
    try {
      initialState.isAuthenticated = true;
      initialState.token = tokenFromStorage;
      initialState.customer = JSON.parse(customerFromStorage);
    } catch (error) {
      // If parsing fails, clear invalid data
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customer');
    }
  }
}

const customerAuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case CUSTOMER_LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case CUSTOMER_LOGIN_SUCCESS:
      // Store in localStorage (SSR-safe)
      if (typeof window !== 'undefined') {
        localStorage.setItem('customerToken', action.payload.token);
        localStorage.setItem('customer', JSON.stringify(action.payload.customer));
      }
      
      return {
        ...state,
        isAuthenticated: true,
        customer: action.payload.customer,
        token: action.payload.token,
        isLoading: false,
        error: null
      };

    case CUSTOMER_LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        customer: null,
        token: null,
        isLoading: false,
        error: action.payload
      };

    case CUSTOMER_LOGOUT:
      // Clear localStorage (SSR-safe)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customer');
      }
      
      return {
        ...state,
        isAuthenticated: false,
        customer: null,
        token: null,
        isLoading: false,
        error: null
      };

    case CUSTOMER_CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null
      };

    case CUSTOMER_CHECK_AUTH:
      // Check if we have valid token in localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('customerToken');
        const customer = localStorage.getItem('customer');
        
        if (token && customer) {
          try {
            return {
              ...state,
              isAuthenticated: true,
              token,
              customer: JSON.parse(customer)
            };
          } catch (error) {
            // Clear invalid data
            localStorage.removeItem('customerToken');
            localStorage.removeItem('customer');
          }
        }
      }
      
      return {
        ...state,
        isAuthenticated: false,
        customer: null,
        token: null
      };

    case CUSTOMER_UPDATE_PROFILE_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case CUSTOMER_UPDATE_PROFILE_SUCCESS:
      // Update customer data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('customer', JSON.stringify(action.payload));
      }
      
      return {
        ...state,
        customer: action.payload,
        isLoading: false,
        error: null
      };

    case CUSTOMER_UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default customerAuthReducer; 
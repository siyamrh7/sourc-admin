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

const initialState = {
  customers: [],
  loading: {
    customers: false,
    creating: false
  },
  error: null,
};

const customerReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CUSTOMERS_START:
      return {
        ...state,
        loading: { ...state.loading, customers: true },
        error: null,
      };

    case FETCH_CUSTOMERS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, customers: false },
        customers: action.payload,
        error: null,
      };

    case FETCH_CUSTOMERS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, customers: false },
        error: action.payload,
      };

    case CREATE_CUSTOMER_START:
      return {
        ...state,
        loading: { ...state.loading, creating: true },
        error: null,
      };

    case CREATE_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, creating: false },
        customers: [action.payload, ...state.customers],
        error: null,
      };

    case CREATE_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, creating: false },
        error: action.payload,
      };

    case DELETE_CUSTOMER_START:
      return {
        ...state,
        loading: {
          ...state.loading,
          customers: true
        },
        error: null
      };

    case DELETE_CUSTOMER_SUCCESS:
      return {
        ...state,
        customers: state.customers.filter(customer => customer._id !== action.payload),
        loading: {
          ...state.loading,
          customers: false
        },
        error: null
      };

    case DELETE_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          customers: false
        },
        error: action.payload
      };

    default:
      return state;
  }
};

export default customerReducer; 
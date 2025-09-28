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

const initialState = {
  orders: [],
  currentOrder: null,
  stats: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  loading: {
    orders: false,
    order: false,
    creating: false,
    updating: false,
    deleting: false,
    advancing: false,
    stats: false
  },
  error: null,
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ORDERS_START:
      return {
        ...state,
        loading: { ...state.loading, orders: true },
        error: null,
      };

    case FETCH_ORDERS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, orders: false },
        orders: action.payload.data,
        pagination: action.payload.pagination,
        error: null,
      };

    case FETCH_ORDERS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, orders: false },
        error: action.payload,
      };

    case FETCH_ORDER_START:
      return {
        ...state,
        loading: { ...state.loading, order: true },
        error: null,
      };

    case FETCH_ORDER_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, order: false },
        currentOrder: action.payload,
        error: null,
      };

    case FETCH_ORDER_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, order: false },
        error: action.payload,
      };

    case CREATE_ORDER_START:
      return {
        ...state,
        loading: { ...state.loading, creating: true },
        error: null,
      };

    case CREATE_ORDER_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, creating: false },
        orders: [action.payload, ...state.orders],
        error: null,
      };

    case CREATE_ORDER_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, creating: false },
        error: action.payload,
      };

    case UPDATE_ORDER_START:
      return {
        ...state,
        loading: { ...state.loading, updating: true },
        error: null,
      };

    case UPDATE_ORDER_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, updating: false },
        orders: state.orders.map(order =>
          order.orderId === action.payload.orderId ? action.payload : order
        ),
        currentOrder: state.currentOrder?.orderId === action.payload.orderId 
          ? action.payload 
          : state.currentOrder,
        error: null,
      };

    case UPDATE_ORDER_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, updating: false },
        error: action.payload,
      };

    case DELETE_ORDER_START:
      return {
        ...state,
        loading: { ...state.loading, deleting: true },
        error: null,
      };

    case DELETE_ORDER_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, deleting: false },
        orders: state.orders.filter(order => order.orderId !== action.payload),
        error: null,
      };

    case DELETE_ORDER_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, deleting: false },
        error: action.payload,
      };

    case ADVANCE_ORDER_START:
      return {
        ...state,
        loading: { ...state.loading, advancing: true },
        error: null,
      };

    case ADVANCE_ORDER_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, advancing: false },
        orders: state.orders.map(order =>
          order.orderId === action.payload.orderId ? action.payload : order
        ),
        currentOrder: state.currentOrder?.orderId === action.payload.orderId 
          ? action.payload 
          : state.currentOrder,
        error: null,
      };

    case ADVANCE_ORDER_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, advancing: false },
        error: action.payload,
      };

    case FETCH_ORDER_STATS_START:
      return {
        ...state,
        loading: { ...state.loading, stats: true },
        error: null,
      };

    case FETCH_ORDER_STATS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, stats: false },
        stats: action.payload,
        error: null,
      };

    case FETCH_ORDER_STATS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, stats: false },
        error: action.payload,
      };

    default:
      return state;
  }
};

export default orderReducer; 
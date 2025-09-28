import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  CLEAR_AUTH_ERROR,
  CHECK_AUTH
} from '../types';

// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  error: null,
};

// Get token and user from localStorage on app start (browser only)
if (typeof window !== 'undefined') {
  const tokenFromStorage = localStorage.getItem('token');
  const userFromStorage = localStorage.getItem('user');

  if (tokenFromStorage && userFromStorage) {
    initialState.isAuthenticated = true;
    initialState.token = tokenFromStorage;
    initialState.user = JSON.parse(userFromStorage);
  }
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
      // Store token and user in localStorage (browser only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
      
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case LOGIN_FAILURE:
      // Clear localStorage on failure (browser only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case LOGOUT:
      // Clear localStorage (browser only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };

    case CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null,
      };

    case CHECK_AUTH:
      // Check if user is still authenticated (browser only)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          return {
            ...state,
            isAuthenticated: true,
            token,
            user: JSON.parse(user),
          };
        }
      }
      
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
      };

    default:
      return state;
  }
};

export default authReducer; 
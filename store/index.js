import { createStore, combineReducers, applyMiddleware } from 'redux';
import authReducer from './reducers/authReducer';
import orderReducer from './reducers/orderReducer';
import customerReducer from './reducers/customerReducer';
import customerAuthReducer from './reducers/customerAuthReducer';

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  orders: orderReducer,
  customers: customerReducer,
  customerAuth: customerAuthReducer
});

// Custom middleware for async actions (simple thunk-like)
const asyncMiddleware = store => next => action => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

// Create store with middleware and dev tools (SSR-safe)
const composeEnhancers = 
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : (f) => f;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(asyncMiddleware))
);

export default store; 
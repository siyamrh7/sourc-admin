import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from '../store/actions/authActions';

const ClientHydration = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window !== 'undefined') {
      // Check authentication state from localStorage
      dispatch(checkAuth());
    }
  }, [dispatch]);

  // This component doesn't render anything
  return null;
};

export default ClientHydration; 
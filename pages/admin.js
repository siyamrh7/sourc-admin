import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from 'react-redux';
import Head from "next/head";
import AdminLayout from "../components/AdminLayout/AdminLayout";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import OrderCreator from "../components/OrderCreator/OrderCreator";
import OrderManager from "../components/OrderManager/OrderManager";
import CustomerManager from "../components/CustomerManager/CustomerManager";
import CustomerCreator from "../components/CustomerCreator/CustomerCreator";
import { getCurrentUser, checkAuth } from '../store/actions/authActions';

export default function Admin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector(state => state.auth);
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Check if user is authenticated (browser only)
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Verify the token is still valid
        await dispatch(getCurrentUser());
        setIsCheckingAuth(false);
      } catch (error) {
        // Token is invalid, redirect to login
        router.push('/login');
      }
    };

    checkAuthentication();
  }, [dispatch, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isCheckingAuth, router]);

  const handleViewChange = (view, id = null) => {
    setCurrentView(view);
    if (view === 'manageOrders') {
      setSelectedOrderId(id);
    }
    if (view === 'createOrder') {
      setPreselectedCustomerId(id);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth || isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>SOURC Admin Dashboard - Order Management</title>
        <meta name="description" content="Admin dashboard for managing customer orders and tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <AdminLayout currentView={currentView} onViewChange={handleViewChange}>
        {currentView === 'dashboard' && (
          <AdminDashboard onViewChange={handleViewChange} />
        )}
        {currentView === 'createOrder' && (
          <OrderCreator onBack={() => handleViewChange('dashboard')} preselectedCustomerId={preselectedCustomerId} />
        )}
        {currentView === 'manageOrders' && (
          <OrderManager 
            selectedOrderId={selectedOrderId}
            onBack={() => handleViewChange('dashboard')}
            onSelectOrder={(orderId) => handleViewChange('manageOrders', orderId)}
          />
        )}
        {currentView === 'manageCustomers' && (
          <CustomerManager 
            onBack={() => handleViewChange('dashboard')}
            onViewChange={handleViewChange}
          />
        )}
        {currentView === 'createCustomer' && (
          <CustomerCreator 
            onBack={() => handleViewChange('dashboard')}
            onViewChange={handleViewChange}
          />
        )}
      </AdminLayout>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 
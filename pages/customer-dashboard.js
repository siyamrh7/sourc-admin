import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import Head from 'next/head';
// import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import OrderTable from '../components/OrderTable/OrderTable';
import OrderDetails from '../components/OrderDetails/OrderDetails';
import { getCurrentCustomer, logoutCustomer, getCustomerOrders } from '../store/actions/customerAuthActions';
import styles from '../styles/CustomerDashboard.module.css';
import profileStyles from '../styles/CustomerProfile.module.css';

export default function CustomerDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, customer, isLoading } = useSelector(state => state.customerAuth);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    // Ensure consistent SSR/CSR markup by rendering after mount
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (typeof window === 'undefined') {
        return;
      }
      
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/');
        return;
      }
      
      try {
        await dispatch(getCurrentCustomer());
        setIsCheckingAuth(false);
      } catch (error) {
        router.push('/');
      }
    };
    
    checkAuthentication();
  }, [dispatch, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isCheckingAuth, router]);

  // Fetch customer orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (isAuthenticated && customer) {
        try {
          setOrdersLoading(true);
          const result = await dispatch(getCustomerOrders());
          if (result.success) {
            setOrders(result.data || []);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          setOrders([]);
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    fetchOrders();
  }, [dispatch, isAuthenticated, customer]);

  // Add a refresh function for manual updates
  const refreshOrders = async () => {
    if (isAuthenticated && customer) {
      try {
        setOrdersLoading(true);
        const result = await dispatch(getCustomerOrders());
        if (result.success) {
          setOrders(result.data || []);
        }
      } catch (error) {
        console.error('Error refreshing orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    }
  };

  // Auto-refresh orders every 30 seconds to get real-time updates
  useEffect(() => {
    if (isAuthenticated && customer && !showOrderDetails) {
      const interval = setInterval(() => {
        refreshOrders();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, customer, showOrderDetails]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutCustomer());
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  const handleViewOrderDetails = (orderId) => {
    const order = orders.find(o => o._id === orderId || o.orderId === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowOrderDetails(true);
    }
  };

  const handleBackToOrders = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
    // Refresh orders when coming back from details view
    refreshOrders();
  };

  // Calculate summary statistics
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const inProgressOrders = orders.filter(o => ['Development', 'In Progress', 'Production', 'Shipped'].includes(o.status)).length;
  
  // Calculate delayed orders (orders that are overdue based on timeline)
  const delayedOrders = orders.filter(order => {
    if (order.status === 'Delivered' || !order.timeline) return false;
    
    // Check if any timeline step has passed its estimated finish date
    const currentDate = new Date();
    return order.timeline.steps?.some(step => {
      if (step.finishDate && !step.isCompleted) {
        const finishDate = new Date(step.finishDate);
        return currentDate > finishDate;
      }
      return false;
    });
  }).length;

  // Keep layout visible; show loading only in main content

  // Avoid hydration mismatch by waiting until mounted
  if (!isMounted) {
    return null;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Customer Dashboard - SOURC</title>
        <meta name="description" content="SOURC Customer Dashboard - Track your orders and manage your account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.dashboardContainer}>
        {/* Unified Header (from customer-profile) */}
        <header className={profileStyles.header}>
          <div className={profileStyles.headerContent}>
            <button className={styles.mobileMenuButton} onClick={() => setIsDrawerOpen(true)} aria-label="Open menu">
              <img src="/icons/menu.svg" alt="Menu" className={styles.hamburger} />
            </button>
            <div className={profileStyles.logo}>sourc.</div>
            <nav className={profileStyles.nav}>
              <a href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer">About Us</a>
              <a href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer">Services</a>
              <a href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer">Process</a>
              <a href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer">Team</a>
            </nav>
            
          </div>
        </header>

        {/* Drawer - mobile only (reuses Login styles for consistency) */}
        {isDrawerOpen && (
          <>
            <div className={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)} />
            <div className={`${styles.drawer} ${styles.drawerOpen}`} role="dialog" aria-modal="true">
              <div className={styles.drawerHeader}>
                <div className={styles.drawerTitle}>Menu</div>
                <button className={styles.drawerCloseBtn} onClick={() => setIsDrawerOpen(false)} aria-label="Close menu">×</button>
              </div>
              <nav className={styles.drawerNav}>
                <a href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>About Us</a>
                <a href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Services</a>
                <a href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Process</a>
                <a href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Team</a>
              </nav>
              <div className={styles.drawerActions}>
              <span className={profileStyles.userIcon}><img src="icons/user-circle.svg" alt="User" /></span>
                <a href="https://sourc.nl/#contact" target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>START WITH SOURCES</a>
                <div className={styles.language}>EN 🇬🇧</div>
              </div>
            </div>
          </>
        )}
        
        <div className={styles.dashboardLayout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarContent}>
              <div className={styles.navigation}>
                <div className={`${styles.navItem} ${styles.active}`}>
                  <span className={styles.icon}><img src="icons/grid-01.svg" alt="Order Dashboard" /></span>
                  <span>Order Dashboard</span>
                </div>
                <div 
                  className={styles.navItem}
                  onClick={() => router.push('/customer-profile')}
                >
                  <span className={styles.icon}><img src="icons/settings-01.svg" alt="Profile & Settings" /></span>
                  <span>Profile & Settings</span>
                </div>
              </div>
              
              <div className={styles.sidebarFooter}>
                <div className={styles.logoutItem} onClick={handleLogout}>
                  <span className={styles.icon}><img src="icons/logout.svg" alt="Logout" /></span>
                  <span>Log out</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {showOrderDetails && selectedOrder ? (
              <OrderDetails orderData={selectedOrder} onBack={handleBackToOrders} />
            ) : (
              <>
                {/* Dashboard Header */}
                <div className={styles.dashboardHeader}>
                  <h1 className={styles.dashboardTitle}>
                    {customer?.company?.name || customer?.name || 'ZUNGO Pest Control B.V'}&apos;s dashboard
                  </h1>
                  <p className={styles.dashboardSubtitle}>
                    Overview of all your orders and their current status
                  </p>
                </div>

                {/* Summary Cards */}
                <div className={styles.summaryCards}>
                  <div className={styles.summaryCard}>
                    <div className={styles.cardContent}>
                      <div className={styles.cardNumber}>{totalOrders}</div>
                      <div className={styles.cardLabel}>Total Orders</div>
                    </div>
                    <div className={styles.cardIcon}>
                      <img src="icons/cube-01.svg" alt="Total Orders" />
                    </div>
                  </div>

                  <div className={styles.summaryCard}>
                    <div className={styles.cardContent}>
                      <div className={styles.cardNumber}>{deliveredOrders}</div>
                      <div className={styles.cardLabel}>Delivered</div>
                    </div>
                    <div className={styles.cardIcon}>
                      <img src="icons/check-circle.svg" alt="Delivered" />
                    </div>
                  </div>

                  <div className={styles.summaryCard}>
                    <div className={styles.cardContent}>
                      <div className={styles.cardNumber}>{inProgressOrders}</div>
                      <div className={styles.cardLabel}>In Progress</div>
                    </div>
                    <div className={styles.cardIcon}>
                      <img src="icons/clock.svg" alt="In Progress" />
                    </div>
                  </div>

                  <div className={styles.summaryCard}>
                    <div className={styles.cardContent}>
                      <div className={styles.cardNumber}>{delayedOrders}</div>
                      <div className={styles.cardLabel}>Delayed</div>
                    </div>
                    <div className={styles.cardIcon}>
                      <img src="icons/alert-circle.svg" alt="Delayed" />
                    </div>
                  </div>
                </div>

                {/* Order Table */}
                <div className={styles.orderTableSection}>
                  <OrderTable 
                    onViewOrderDetails={handleViewOrderDetails}
                    orders={orders}
                    isLoading={ordersLoading}
                    onRefresh={refreshOrders}
                  />
                </div>
              </>
            )}
          </main>
        </div>

        {/* Footer aligned with main content */}
        <div className={styles.footerContainer}>
          <Footer />
        </div>
      </div>
    </>
  );
} 
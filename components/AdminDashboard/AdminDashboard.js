import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, fetchOrderStats } from '../../store/actions/orderActions';
import styles from './AdminDashboard.module.css';
import AdminStatsCard from '../AdminStatsCard/AdminStatsCard';
import AdminOrderTable from '../AdminOrderTable/AdminOrderTable';

const AdminDashboard = ({ onViewChange }) => {
  const dispatch = useDispatch();
  const { orders, stats, loading } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // Fetch orders and statistics when component mounts
    dispatch(fetchOrders({ limit: 10, sort: '-createdAt' }));
    dispatch(fetchOrderStats());
  }, [dispatch]);

  // Calculate stats from orders if stats are not available from API
  const dashboardStats = stats || {
    statusBreakdown: [],
    totals: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
    recentOrders: []
  };

  // Status breakdown for stats cards
  const statusStats = dashboardStats.statusBreakdown.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const statsData = [
    {
      title: 'Total Orders',
      value: String(dashboardStats.totals.totalOrders || orders.length || 0),
      icon: '📦',
      color: 'blue',
      trend: '+12%',
      trendDirection: 'up'
    },
    {
      title: 'Active Orders',
      value: String((statusStats['In Progress'] || 0) + (statusStats['Development'] || 0) + (statusStats['Production'] || 0)),
      icon: '🔄',
      color: 'orange',
      trend: '+5%',
      trendDirection: 'up'
    },
    {
      title: 'Completed Orders',
      value: String(statusStats['Delivered'] || 0),
      icon: '✅',
      color: 'green',
      trend: '+8%',
      trendDirection: 'up'
    },
    {
      title: 'Revenue This Month',
      value: `€${(dashboardStats.totals.totalRevenue || 0).toLocaleString()}`,
      icon: '💰',
      color: 'purple',
      trend: '+18%',
      trendDirection: 'up'
    }
  ];

  if (loading.orders && !orders.length) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, {user?.name || 'Admin'}! Manage customer orders, track progress, and update order statuses
          </p>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={() => onViewChange('createOrder')}
          >
            <span className={styles.buttonIcon}>➕</span>
            Create New Order
          </button>
          <button 
            className={styles.secondaryButton}
            onClick={() => onViewChange('manageOrders')}
          >
            <span className={styles.buttonIcon}>📦</span>
            Manage Orders
          </button>
          <button 
            className={styles.refreshButton}
            onClick={() => {
              dispatch(fetchOrders({ limit: 10, sort: '-createdAt' }));
              dispatch(fetchOrderStats());
            }}
            disabled={loading.orders || loading.stats}
            title="Refresh data"
          >
            {loading.orders || loading.stats ? '⟳' : '🔄'}
          </button>
        </div>
      </div>
      
      <div className={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <AdminStatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>
      
      <div className={styles.tableSection}>
        <AdminOrderTable 
          onViewChange={onViewChange}
          orders={orders.slice(0, 10)}
          loading={loading.orders}
          onRefresh={() => dispatch(fetchOrders({ limit: 10, sort: '-createdAt' }))}
        />
      </div>
    </div>
  );
};

export default AdminDashboard; 
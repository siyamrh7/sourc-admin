import { useState, useEffect } from 'react';
import styles from './AdminOrderTable.module.css';

const AdminOrderTable = ({ onViewChange, orders = [], loading = false, onRefresh }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getProgressBarColor = (progress, total) => {
    const percentage = (progress / total) * 100;
    if (percentage >= 100) return styles.progressComplete;
    if (percentage >= 70) return styles.progressHigh;
    if (percentage >= 40) return styles.progressMedium;
    return styles.progressLow;
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return styles.priorityMedium;
    }
  };

  const handleEditOrder = (orderId) => {
    onViewChange('manageOrders', orderId);
  };

  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Recent Orders</h3>
          <button 
            className={styles.refreshButton}
            onClick={onRefresh}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Recent Orders</h3>
          <button 
            className={styles.viewAllButton}
            onClick={() => onViewChange('manageOrders')}
          >
            View All
          </button>
        </div>
        <div className={styles.mobileContainer}>
          {orders.slice(0, 3).map((order, index) => (
            <div key={order._id} className={styles.mobileCard}>
              <div className={styles.mobileHeader}>
                <div className={styles.mobileOrderInfo}>
                  <div className={styles.mobileOrderId}>{order.orderId}</div>
                  <div className={styles.mobileCustomer}>{order.customer?.name}</div>
                </div>
                <span className={`${styles.statusBadge} ${styles.blue}`}>
                  {order.status}
                </span>
              </div>
              
              <div className={styles.mobileContent}>
                <div className={styles.mobileRow}>
                  <span className={styles.mobileLabel}>Product:</span>
                  <span>{order.product?.name}</span>
                </div>
                <div className={styles.mobileRow}>
                  <span className={styles.mobileLabel}>Quantity:</span>
                  <span>{order.product?.quantity}</span>
                </div>
                <div className={styles.mobileRow}>
                  <span className={styles.mobileLabel}>Value:</span>
                  <span className={styles.value}>{order.product?.value}</span>
                </div>
                <div className={styles.mobileRow}>
                  <span className={styles.mobileLabel}>Priority:</span>
                  <span className={`${styles.priorityBadge} ${getPriorityColor(order.priority || 'Medium')}`}>
                    {order.priority || 'Medium'}
                  </span>
                </div>
              </div>
              
              <div className={styles.mobileActions}>
                <button 
                  className={styles.mobileEditButton}
                  onClick={() => handleEditOrder(order.orderId)}
                >
                  Edit Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 className={styles.tableTitle}>Recent Orders</h3>
        <div className={styles.headerActions}>
          <button 
            className={styles.refreshButton}
            onClick={onRefresh}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <button 
            className={styles.viewAllButton}
            onClick={() => onViewChange('manageOrders')}
          >
            View All Orders
          </button>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((order) => (
              <tr key={order._id}>
                <td className={styles.orderId}>{order.orderId}</td>
                <td>
                  <div className={styles.customerInfo}>
                    <div className={styles.customerName}>{order.customer?.name}</div>
                    <div className={styles.customerEmail}>{order.customer?.email}</div>
                  </div>
                </td>
                <td>{order.product?.name}</td>
                <td>{order.product?.quantity}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div 
                        className={`${styles.progressFill} ${getProgressBarColor(Math.min(order?.progress?.current ?? 0, order?.progress?.total ?? 7), order?.progress?.total ?? 7)}`}
                        style={{ width: `${(((Math.min(order?.progress?.current ?? 0, order?.progress?.total ?? 7)) / (order?.progress?.total ?? 7)) * 100)}%` }}
                      ></div>
                    </div>
                    <span className={styles.progressText}>{Math.min(order?.progress?.current ?? 0, order?.progress?.total ?? 7)}/{order?.progress?.total ?? 7}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.blue}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <span className={`${styles.priorityBadge} ${getPriorityColor(order.priority || 'Medium')}`}>
                    {order.priority || 'Medium'}
                  </span>
                </td>
                <td className={styles.value}>{order.product?.value}</td>
                <td>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEditOrder(order.orderId)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h3 className={styles.emptyTitle}>No Orders Yet</h3>
            <p className={styles.emptyText}>
              No orders have been created yet. Create your first order to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderTable; 
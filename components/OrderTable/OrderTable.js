import { useState, useEffect } from 'react';
import styles from './OrderTable.module.css';

const OrderTable = ({ onViewOrderDetails, orders = [], isLoading = false, onRefresh }) => {
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
    if (percentage === 100) return styles.progressComplete;
    if (percentage >= 75) return styles.progressHigh;
    if (percentage >= 50) return styles.progressMedium;
    return styles.progressLow;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'green';
      case 'shipped': return 'blue';
      case 'approved': return 'blue';
      case 'in progress': return 'blue';
      case 'production': return 'orange';
      case 'development': return 'gray';
      case 'mold': return 'gray';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getCurrentPhase = (order) => {
    // Prefer exact title from timeline at progress.current
    if (order.timeline && Array.isArray(order.timeline) && order.timeline.length > 0) {
      const total = order.timeline.length;
      const current = Math.min(Math.max(order.progress?.current || 1, 1), total);
      const index = current - 1;
      return order.timeline[index]?.title || order.timeline[total - 1]?.title || 'Offer Accepted';
    }

    // Fallback to backend-provided currentPhase
    if (order.currentPhase) {
      return order.currentPhase;
    }

    // Final fallback based on status
    switch (order.status?.toLowerCase()) {
      case 'development':
        return 'Mold / Product in Development';
      case 'in progress':
        return 'Sample Approved';
      case 'production':
        return 'Production Phase';
      case 'shipped':
        return 'Transport Phase';
      case 'delivered':
        return 'Delivered to Final Location';
      default:
        return 'Offer Accepted';
    }
  };

  const formatOrderData = (order) => {
    const currentProgress = order.progress?.current || 1;
    const totalProgress = order.progress?.total || 7;
    
    // Handle multiple products
    const products = order.products || (order.product ? [order.product] : []);
    const productCount = products.length;
    const productNames = products.map(p => p.name).filter(Boolean);
    const totalQuantity = products.reduce((sum, p) => {
      const qty = parseInt(p.quantity) || 0;
      return sum + qty;
    }, 0);
    
    return {
      id: order.orderId || order._id || 'N/A',
      product: productCount > 1 ? `${productCount} Products` : '1 Product',
      quantity: productCount > 1 ? `${totalQuantity.toLocaleString()} units total` : (products[0]?.quantity || 'N/A'),
      orderDate: formatDate(order.createdAt),
      progress: currentProgress,
      total: totalProgress,
      currentPhase: getCurrentPhase(order),
      status: order.status || 'Unknown',
      statusColor: getStatusColor(order.status),
      destination: order.shipping?.destination || 'N/A',
      value: order.totalValue
        ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(order.totalValue)
        : (products[0]?.value || 'N/A')
    };
  };

  const handleViewDetails = (orderId) => {
    if (onViewOrderDetails) {
      onViewOrderDetails(orderId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <h3 className={styles.tableTitle}>Order History</h3>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <h3 className={styles.tableTitle}>Order History</h3>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h4 className={styles.emptyTitle}>No Orders Found</h4>
          <p className={styles.emptyText}>
            You don&apos;t have any orders yet. Orders created by our team will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Format orders for display
  const formattedOrders = orders.map(formatOrderData);

  if (isMobile) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Order History</h3>
          {onRefresh && (
            <button 
              className={styles.refreshButton}
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh orders"
            >
              <span className={styles.refreshIcon}>🔄</span>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
        <div className={styles.mobileOrderList}>
          {formattedOrders.map((order, index) => (
            <div key={order.id || index} className={styles.mobileOrderCard}>
              <div className={styles.mobileOrderHeader}>
                <div className={styles.mobileOrderId}>{order.id}</div>
                <span className={`${styles.statusBadge} ${styles[order.statusColor]}`}>
                  {order.status}
                </span>
              </div>
              
              <div className={styles.mobileOrderInfo}>
                <div className={styles.mobileOrderRow}>
                  <span className={styles.mobileLabel}>Product</span>
                  <span className={styles.mobileValue}>{order.product}</span>
                </div>
                <div className={styles.mobileOrderRow}>
                  <span className={styles.mobileLabel}>Quantity</span>
                  <span className={styles.mobileValue}>{order.quantity}</span>
                </div>
                <div className={styles.mobileOrderRow}>
                  <span className={styles.mobileLabel}>Order Date</span>
                  <span className={styles.mobileValue}>{order.orderDate}</span>
                </div>
                <div className={styles.mobileOrderRow}>
                  <span className={styles.mobileLabel}>Current Phase</span>
                  <span className={styles.mobileValue}>{order.currentPhase}</span>
                </div>
                <div className={styles.mobileOrderRow}>
                  <span className={styles.mobileLabel}>Progress</span>
                  <div className={styles.mobileProgressContainer}>
                    <div className={styles.progressBar}>
                    <div 
                      className={`${styles.progressFill} ${getProgressBarColor(order.progress, order.total)}`}
                      style={{ width: `${(((order.progress || 1) / (order.total || 7)) * 100)}%` }}
                    ></div>
                    </div>
                  <span className={styles.progressText}>{order.progress || 1}/{order.total || 7}</span>
                  </div>
                </div>
                <div className={styles.mobileOrderRow}>
                  <span className={styles.mobileLabel}>Destination</span>
                  <span className={styles.mobileValue}>{order.destination}</span>
                </div>
                <div className={styles.mobileOrderRow}>
                  <span className={styles.mobileLabel}>Value</span>
                  <span className={`${styles.mobileValue} ${styles.valueAmount}`}>{order.value}</span>
                </div>
              </div>
              
              <button 
                className={styles.mobileActionButton}
                onClick={() => handleViewDetails(order.id)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 className={styles.tableTitle}>Order History</h3>
        {onRefresh && (
          <button 
            className={styles.refreshButton}
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh orders"
          >
            <span className={styles.refreshIcon}>🔄</span>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Order Date</th>
              <th>Current Phase</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Destination</th>
              <th>Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {formattedOrders.map((order, index) => (
              <tr key={order.id || index}>
                <td className={styles.orderId}>{order.id}</td>
                <td>{order.product}</td>
                <td>{order.quantity}</td>
                <td>{order.orderDate}</td>
                <td className={styles.currentPhase}>{order.currentPhase}</td>
                <td>
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div 
                        className={`${styles.progressFill} ${getProgressBarColor(order.progress, order.total)}`}
                        style={{ width: `${(order.progress / order.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className={styles.progressText}>{order.progress}/{order.total}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[order.statusColor]}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.destination}</td>
                <td className={styles.value}>{order.value}</td>
                <td>
                  <button 
                    className={styles.actionButton}
                    onClick={() => handleViewDetails(order.id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable; 
import { useState, useEffect } from 'react';
import styles from './AdminOrderTable.module.css';

// Generate a PDF invoice for the provided order data
const generateInvoicePdf = async (orderData) => {
  try {
    const [{ jsPDF }, autoTable] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const pageMargin = 40;
    const lineHeight = 16;
    let cursorY = pageMargin;

    const writeText = (text, x, y, options = {}) => {
      doc.text(String(text ?? ''), x, y, options);
    };

    const writeWrappedText = (text, x, y, maxWidth, lineHeight = 15) => {
      const textStr = String(text ?? '');
      const lines = doc.splitTextToSize(textStr, maxWidth);
      let currentY = y;
      
      lines.forEach(line => {
        doc.text(line, x, currentY);
        currentY += lineHeight;
      });
      
      return currentY;
    };

    // Header
    doc.setFontSize(18);
    writeText('Invoice', pageMargin, cursorY);
    doc.setFontSize(10);
    writeText(`Invoice ID: ${orderData.id || orderData.orderId || ''}`, pageMargin, (cursorY += lineHeight));
    writeText(`Date: ${new Date().toLocaleDateString()}`, pageMargin, (cursorY += lineHeight));

    // All sections aligned at same height with compact layout
    const sectionY = cursorY + 20;
    
    // From section (left) - compact
    doc.setFontSize(12);
    writeText('From:', pageMargin, sectionY);
    doc.setFontSize(10);
    writeText('Sourc. B.V.', pageMargin, sectionY + 15);
    writeText('Richard Feynmanstraat 22', pageMargin, sectionY + 30);
    writeText('1341DL Almere', pageMargin, sectionY + 45);
    writeText('KVK: 97340723', pageMargin, sectionY + 60);
    writeText('info@sourc.nl', pageMargin, sectionY + 75);

    // Bill To section (middle) - moved left
    const billToX = 200;
    doc.setFontSize(12);
    writeText('Bill To:', billToX, sectionY);
    doc.setFontSize(10);
    
    // Customer details from order data
    const customer = orderData.customer;
    let billToY = sectionY + 15;
    
    if (customer?.name) {
      writeText(customer.name, billToX, billToY);
      billToY += 15;
    }
  
    if (customer?.email) {
      writeText(`Email: ${customer.email}`, billToX, billToY);
      billToY += 15;
    }
    if (customer?.phone) {
      writeText(`Phone: ${customer.phone}`, billToX, billToY);
      billToY += 15;
    }
    if (customer?.company?.kvk) {
      writeText(`KVK: ${customer.company.kvk}`, billToX, billToY);
      billToY += 15;
    }
    if (customer?.fullAddress) {
      const maxAddressWidth = 200; // Maximum width for address text
      billToY = writeWrappedText(customer.fullAddress, billToX, billToY, maxAddressWidth);
    }
 
    
    // Ship To section (right side) - moved left
    const shipToX = 400;
    doc.setFontSize(12);
    writeText('Ship To:', shipToX, sectionY);
    doc.setFontSize(10);
    
    let shipToY = sectionY + 15;
    const maxDestinationWidth = 150; // Maximum width for destination text
    const destination = orderData.shipping?.destination || orderData.destination || 'N/A';
    shipToY = writeWrappedText(destination, shipToX, shipToY, maxDestinationWidth);
    shipToY += 5; // Small gap after wrapped text
    
    // Calculate the maximum Y position used and set cursorY accordingly
    const maxY = Math.max(billToY, shipToY) + 20; // Add some padding
    cursorY = maxY;

    // Products table
    const products = Array.isArray(orderData.products) && orderData.products.length > 0
      ? orderData.products
      : [{ name: orderData.product || 'Product', description: '', quantity: orderData.quantity || '', value: orderData.value || '' }];

    const bodyRows = products.map((p, idx) => {
      const quantity = typeof p.quantity === 'number' ? p.quantity : parseInt(String(p.quantity || '0').replace(/[^0-9]/g, '')) || 0;
      const valueNum = typeof p.value === 'number' ? p.value : parseFloat(String(p.value || '0').replace(/[^0-9.\-]/g, '')) || 0;
      const unitPrice = quantity > 0 ? valueNum / quantity : valueNum;
      return [
        idx + 1,
        p.name || '-',
        p.description || '-',
        quantity.toLocaleString(),
        `€${unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `€${valueNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ];
    });

    autoTable.default(doc, {
      startY: cursorY,
      head: [["#", "Product", "Description", "Qty", "Unit Price", "Amount"]],
      body: bodyRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [3, 105, 161] },
      theme: 'striped',
      margin: { left: pageMargin, right: pageMargin }
    });

    const finalY = doc.lastAutoTable.finalY || cursorY + 24;

    // Totals
    const subtotal = products.reduce((sum, p) => {
      const valueNum = typeof p.value === 'number' ? p.value : parseFloat(String(p.value || '0').replace(/[^0-9.\-]/g, '')) || 0;
      return sum + valueNum;
    }, 0);

    const taxRate = 0.21; // 21% tax
    const taxAmount = subtotal * taxRate;
    const totalWithTax = subtotal + taxAmount;

    const totalsX = 380;
    let totalsY = finalY + 20;
    doc.setFontSize(10);
    writeText('Subtotal:', totalsX, (totalsY += lineHeight));
    writeText(`€${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, totalsX + 120, totalsY, { align: 'right' });
    writeText('Tax (21%):', totalsX, (totalsY += lineHeight));
    writeText(`€${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, totalsX + 120, totalsY, { align: 'right' });
    doc.setFontSize(12);
    writeText('Total:', totalsX, (totalsY += lineHeight));
    writeText(`€${totalWithTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, totalsX + 120, totalsY, { align: 'right' });

    // Footer note
    doc.setFontSize(9);
    writeText('Thank you for your business!', pageMargin, totalsY + 40);
    writeText('For support, contact info@sourc.nl', pageMargin, totalsY + 56);

    // Save
    const fileName = `Invoice_${orderData.id || orderData.orderId || 'order'}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error('Failed to generate invoice PDF', err);
    alert('Failed to generate invoice. Please try again.');
  }
};

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

  // Helper functions for product display
  const getProductDisplay = (order) => {
    const products = order.products || (order.product ? [order.product] : []);
    const productCount = products.length;
    const productNames = products.map(p => p.name).filter(Boolean);
    return productCount > 1 ? 
      `${productCount} Products: ${productNames.slice(0, 2).join(', ')}${productNames.length > 2 ? '...' : ''}` : 
      (productNames[0] || 'N/A');
  };

  const getQuantityDisplay = (order) => {
    const products = order.products || (order.product ? [order.product] : []);
    const productCount = products.length;
    const totalQuantity = products.reduce((sum, p) => {
      const qty = parseInt(p.quantity) || 0;
      return sum + qty;
    }, 0);
    return productCount > 1 ? `${totalQuantity.toLocaleString()}${window.innerWidth <= 768 ? ' units total' : ' total'}` : (products[0]?.quantity || 'N/A');
  };

  const getValueDisplay = (order) => {
    return order.totalValue ? `€${order.totalValue.toLocaleString()}` : (order.product?.value || 'N/A');
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
                  <span>{getProductDisplay(order)}</span>
                </div>
                <div className={styles.mobileRow}>
                  <span className={styles.mobileLabel}>Quantity:</span>
                  <span>{getQuantityDisplay(order)}</span>
                </div>
                <div className={styles.mobileRow}>
                  <span className={styles.mobileLabel}>Value:</span>
                  <span className={styles.value}>{getValueDisplay(order)}</span>
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
                <button 
                  className={styles.mobileInvoiceButton}
                  onClick={() => generateInvoicePdf(order)}
                  title="Download invoice PDF"
                >
                  📄 Invoice
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
                <td>{getProductDisplay(order)}</td>
                <td>{getQuantityDisplay(order)}</td>
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
                <td className={styles.value}>{getValueDisplay(order)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEditOrder(order.orderId)}
                    >
                      Edit
                    </button>
                    <button 
                      className={styles.invoiceButton}
                      onClick={() => generateInvoicePdf(order)}
                      title="Download invoice PDF"
                    >
                      📄
                    </button>
                  </div>
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
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, deleteOrder, updateOrder, hardDeleteOrder } from '../../store/actions/orderActions';
import styles from './OrderManager.module.css';

const OrderManager = ({ selectedOrderId, onBack, onSelectOrder }) => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.orders);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingOrder, setEditingOrder] = useState(null);
  const [showTimelineEdit, setShowTimelineEdit] = useState(false);
  const [showProductEdit, setShowProductEdit] = useState(false);

  // Fetch orders on component mount
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const phases = [
    'Offer Accepted',
    'In Development',
    'Sample Sent to Client',
    'Sample Approved',
    'Production Phase',
    'Transport Phase',
    'Delivered'
  ];

  const filteredOrders = orders.filter(order => {
    const products = order.products || (order.product ? [order.product] : []);
    const productNames = products.map(p => p.name).join(' ');
    
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productNames?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  const getDefaultCarrier = (shippingMethod) => {
    switch (shippingMethod) {
      case 'Sea Freight':
        return 'COSCO';
      case 'Air Freight':
        return 'DHL Express';
      case 'Road Transport':
        return 'European Transport';
      case 'Express Delivery':
        return 'FedEx';
      default:
        return '';
    }
  };

  const handleEditOrder = (order) => {
    // Handle multiple products - for editing, we'll work with the first product for now
    // TODO: Implement full multi-product editing UI
    const products = order.products || (order.product ? [order.product] : []);
    const firstProduct = products[0] || {};
    
    setEditingOrder({
      ...order,
      // Product Information (using first product for editing)
      productName: firstProduct.name || '',
      productDescription: firstProduct.description || '',
      productQuantity: firstProduct.quantity || '',
      productValue: firstProduct.value || '',
      
      // Store all products for reference
      products: products,
      totalValue: order.totalValue || 0,
      
      // Shipping Information
      destination: order.shipping?.destination || '',
      shippingMethod: order.shipping?.method || 'Sea Freight',
      carrier: order.shipping?.carrier || '',
      estimatedArrival: formatDate(order.shipping?.estimatedArrival) || '',
      
      // Customer Location Information
      customerLocation: order.customerLocation || '',
      customerLocationArrivalDate: formatDate(order.customerLocationArrivalDate) || '',
      
      // Order Management
      status: order.status || 'Development',
      priority: order.priority || 'Medium',
      notes: order.notes || '',
      
      // Timeline
      timeline: order.timeline && Array.isArray(order.timeline) ? [...order.timeline] : []
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Handle shipping method change
    if (name === 'shippingMethod') {
      setEditingOrder(prev => ({
        ...prev,
        [name]: newValue,
        carrier: getDefaultCarrier(newValue)
      }));
    } else {
      setEditingOrder(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };

  const handleTimelineStepChange = (stepIndex, field, value) => {
    setEditingOrder(prev => ({
      ...prev,
      timeline: prev.timeline.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }));
  };

  // Product management functions
  const addProduct = () => {
    const newProductId = Math.max(...editingOrder.products.map(p => p.id), 0) + 1;
    setEditingOrder(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          id: newProductId,
          name: '',
          description: '',
          quantity: '',
          value: ''
        }
      ]
    }));
  };

  const removeProduct = (productId) => {
    if (editingOrder.products.length > 1) {
      setEditingOrder(prev => ({
        ...prev,
        products: prev.products.filter(product => product.id !== productId)
      }));
    }
  };

  const updateProduct = (productId, field, value) => {
    setEditingOrder(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === productId ? { ...product, [field]: value } : product
      )
    }));
  };

  // Calculate total order value
  const calculateTotalValue = () => {
    return editingOrder.products.reduce((total, product) => {
      const value = parseFloat(product.value) || 0;
      return total + value;
    }, 0);
  };

  const handleSaveChanges = async () => {
    try {
      // Use all products from the editing state
      const updatedProducts = editingOrder.products ? [...editingOrder.products] : [];
      
      // Filter out products with empty names (incomplete products)
      const validProducts = updatedProducts.filter(product => 
        product.name && product.name.trim() && 
        product.quantity && product.quantity.trim() && 
        product.value && product.value.trim()
      );

      if (validProducts.length === 0) {
        alert('Please add at least one complete product before saving.');
        return;
      }

      // Calculate total value
      const totalValue = validProducts.reduce((total, product) => {
        const value = parseFloat(product.value) || 0;
        return total + value;
      }, 0);

      const updatedOrderData = {
        orderId: editingOrder.orderId,
        products: validProducts,
        totalValue: totalValue,
        shipping: {
          destination: editingOrder.destination,
          method: editingOrder.shippingMethod,
          carrier: editingOrder.carrier,
          estimatedArrival: editingOrder.estimatedArrival
        },
        customerLocation: editingOrder.customerLocation,
        customerLocationArrivalDate: editingOrder.customerLocationArrivalDate,
        status: editingOrder.status,
        priority: editingOrder.priority,
        notes: editingOrder.notes,
        timeline: editingOrder.timeline,
        progress: {
          current: editingOrder.timeline?.length > 0 
            ? editingOrder.timeline.filter(step => step.isCompleted).length + 1
            : getProgressFromStatus(editingOrder.status),
          total: 7
        }
      };

      const result = await dispatch(updateOrder(editingOrder._id, updatedOrderData));
      
      if (result.success) {
        alert(`Order ${editingOrder.orderId} updated successfully!`);
        setEditingOrder(null);
        setShowTimelineEdit(false);
        // Refresh orders
        dispatch(fetchOrders());
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  const getProgressFromStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'development': return 1;
      case 'in progress': return 3;
      case 'production': return 5;
      case 'shipped': return 6;
      case 'delivered': return 7;
      default: return 1;
    }
  };

  const handleAdvancePhase = async (order) => {
    try {
      const currentProgress = order.progress?.current || 1;
      if (currentProgress < 7) {
        const newProgress = currentProgress + 1;
        const updatedData = {
          progress: {
            current: newProgress,
            total: 7
          },
          status: newProgress >= 7 ? 'Delivered' : 
                  newProgress >= 6 ? 'Shipped' : 
                  newProgress >= 5 ? 'Production' : 'In Progress'
        };

        const result = await dispatch(updateOrder(order._id, updatedData));
        
        if (result.success) {
          alert(`Order ${order.orderId} advanced to phase ${newProgress}!`);
          dispatch(fetchOrders());
        }
      }
    } catch (error) {
      console.error('Error advancing order phase:', error);
      alert('Failed to advance order phase. Please try again.');
    }
  };

  if (editingOrder) {
    return (
      <div className={styles.orderManager}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => setEditingOrder(null)}>
            <span className={styles.backIcon}>←</span>
            Back to Orders
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Edit Order {editingOrder.orderId}</h1>
            <p className={styles.subtitle}>Update comprehensive order details and progress</p>
          </div>
        </div>

        <div className={styles.editForm}>
          <div className={styles.editGrid}>
            {/* Product Information */}
            <div className={styles.editSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.editSectionTitle}>Product Information</h3>
                <button
                  type="button"
                  onClick={addProduct}
                  className={styles.addProductButton}
                >
                  <span className={styles.addIcon}>+</span>
                  Add Product
                </button>
              </div>

              <div className={styles.productsList}>
                {editingOrder.products.map((product, index) => (
                  <div key={product.id} className={styles.productCard}>
                    <div className={styles.productHeader}>
                      <h4 className={styles.productTitle}>
                        Product {index + 1}
                        {editingOrder.products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className={styles.removeProductButton}
                            title="Remove Product"
                          >
                            <span className={styles.removeIcon}>×</span>
                          </button>
                        )}
                      </h4>
                    </div>

                    <div className={styles.productForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Product Name</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                          className={styles.input}
                          placeholder="e.g., Custom Injection Parts"
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Product Description</label>
                        <textarea
                          value={product.description}
                          onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                          className={styles.textarea}
                          rows="2"
                          placeholder="Detailed product description..."
                        />
                      </div>
                      
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Quantity</label>
                          <input
                            type="text"
                            value={product.quantity}
                            onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                            className={styles.input}
                            placeholder="e.g., 5,000 units"
                          />
                        </div>
                        
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Product Value</label>
                          <input
                            type="text"
                            value={product.value}
                            onChange={(e) => updateProduct(product.id, 'value', e.target.value)}
                            className={styles.input}
                            placeholder="e.g., €25,000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.totalValueSection}>
                <div className={styles.totalValueCard}>
                  <h4 className={styles.totalValueTitle}>Total Order Value</h4>
                  <div className={styles.totalValueAmount}>
                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(
                      calculateTotalValue()
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className={styles.editSection}>
              <h3 className={styles.editSectionTitle}>Shipping Information</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={editingOrder.destination}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g., Rotterdam, NL"
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Shipping Method</label>
                  <select
                    name="shippingMethod"
                    value={editingOrder.shippingMethod}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Sea Freight">Sea Freight</option>
                    <option value="Air Freight">Air Freight</option>
                    <option value="Road Transport">Road Transport</option>
                    <option value="Express Delivery">Express Delivery</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Carrier</label>
                  <input
                    type="text"
                    name="carrier"
                    value={editingOrder.carrier}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Carrier name"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Estimated Arrival</label>
                <input
                  type="date"
                  name="estimatedArrival"
                  value={editingOrder.estimatedArrival}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Customer Location Information */}
            <div className={styles.editSection}>
              <h3 className={styles.editSectionTitle}>Customer Location Information</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Customer Location</label>
                <input
                  type="text"
                  name="customerLocation"
                  value={editingOrder.customerLocation}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g., Amsterdam, Netherlands"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Customer Location Arrival Date</label>
                <input
                  type="date"
                  name="customerLocationArrivalDate"
                  value={editingOrder.customerLocationArrivalDate}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Order Status & Priority */}
            <div className={styles.editSection}>
              <h3 className={styles.editSectionTitle}>Order Management</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Status</label>
                  <select
                    name="status"
                    value={editingOrder.status}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Development">Development</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Production">Production</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Priority</label>
                  <select
                    name="priority"
                    value={editingOrder.priority}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Notes</label>
                <textarea
                  name="notes"
                  value={editingOrder.notes}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows="4"
                  placeholder="Special instructions, notes, or updates..."
                />
              </div>
            </div>

            {/* Timeline Management */}
            <div className={styles.editSection}>
              <h3 className={styles.editSectionTitle}>Timeline Management</h3>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showTimelineEdit}
                    onChange={(e) => setShowTimelineEdit(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Edit detailed timeline phases</span>
                </label>
              </div>

              {showTimelineEdit && editingOrder.timeline && editingOrder.timeline.length > 0 && (
                <div className={styles.timelineEdit}>
                  <h4 className={styles.timelineSubtitle}>Timeline Phases</h4>
                  <div className={styles.timelineSteps}>
                    {editingOrder.timeline.map((step, index) => (
                      <div key={step.id || index} className={styles.timelineStep}>
                        <div className={styles.stepHeader}>
                          <h5 className={styles.stepTitle}>
                            Phase {step.id || (index + 1)}: {step.title}
                          </h5>
                        </div>
                        
                        <div className={styles.stepForm}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Description</label>
                            <textarea
                              value={step.description || ''}
                              onChange={(e) => handleTimelineStepChange(index, 'description', e.target.value)}
                              className={styles.textarea}
                              rows="2"
                            />
                          </div>
                          
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Duration</label>
                              <input
                                type="text"
                                value={step.estimatedDuration || ''}
                                onChange={(e) => handleTimelineStepChange(index, 'estimatedDuration', e.target.value)}
                                className={styles.input}
                                placeholder="e.g., 14 days"
                              />
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Start Date</label>
                              <input
                                type="date"
                                value={formatDate(step.startDate) || ''}
                                onChange={(e) => handleTimelineStepChange(index, 'startDate', e.target.value)}
                                className={styles.input}
                              />
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Finish Date</label>
                              <input
                                type="date"
                                value={formatDate(step.finishDate) || ''}
                                onChange={(e) => handleTimelineStepChange(index, 'finishDate', e.target.value)}
                                className={styles.input}
                              />
                            </div>
                          </div>
                          
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label className={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  checked={step.isCompleted || false}
                                  onChange={(e) => handleTimelineStepChange(index, 'isCompleted', e.target.checked)}
                                  className={styles.checkbox}
                                />
                                <span>Completed</span>
                              </label>
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label className={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  checked={step.isInProgress || false}
                                  onChange={(e) => handleTimelineStepChange(index, 'isInProgress', e.target.checked)}
                                  className={styles.checkbox}
                                />
                                <span>In Progress</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.editActions}>
            <button
              onClick={() => setEditingOrder(null)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className={styles.saveButton}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.orderManager}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <span className={styles.backIcon}>←</span>
          Back to Dashboard
        </button>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Manage Orders</h1>
          <p className={styles.subtitle}>
            View and update the status of all customer orders with comprehensive details
          </p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search orders by ID, customer, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="All">All Status</option>
          <option value="Development">Development</option>
          <option value="In Progress">In Progress</option>
          <option value="Production">Production</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {loading.orders ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
        {filteredOrders.map((order) => (
          <div key={order._id} className={styles.orderCard}>
            <div className={styles.cardHeader}>
              <div className={styles.orderInfo}>
                <h3 className={styles.orderId}>{order.orderId}</h3>
                <p className={styles.customerName}>{order.customer?.name}</p>
              </div>
              <span className={`${styles.statusBadge} ${styles.blue}`}>
                {order.status}
              </span>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.contentRow}>
                <span className={styles.contentLabel}>Product:</span>
                <span className={styles.contentValue}>{(() => {
                  const products = order.products || (order.product ? [order.product] : []);
                  const productCount = products.length;
                  const productNames = products.map(p => p.name).filter(Boolean);
                  return productCount > 1 ? 
                    `${productCount} Products: ${productNames.slice(0, 2).join(', ')}${productNames.length > 2 ? '...' : ''}` : 
                    (productNames[0] || 'N/A');
                })()}</span>
              </div>
              <div className={styles.contentRow}>
                <span className={styles.contentLabel}>Quantity:</span>
                <span className={styles.contentValue}>{(() => {
                  const products = order.products || (order.product ? [order.product] : []);
                  const productCount = products.length;
                  const totalQuantity = products.reduce((sum, p) => {
                    const qty = parseInt(p.quantity) || 0;
                    return sum + qty;
                  }, 0);
                  return productCount > 1 ? `${totalQuantity.toLocaleString()} total` : (products[0]?.quantity || 'N/A');
                })()}</span>
              </div>
              <div className={styles.contentRow}>
                <span className={styles.contentLabel}>Progress:</span>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${(((order.progress?.current || 1) / (order.progress?.total || 7)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>{order.progress?.current || 1}/{order.progress?.total || 7}</span>
                </div>
              </div>
              <div className={styles.contentRow}>
                <span className={styles.contentLabel}>Value:</span>
                <span className={`${styles.contentValue} ${styles.value}`}>{order.totalValue ? `€${order.totalValue.toLocaleString()}` : (order.product?.value || 'N/A')}</span>
              </div>
              <div className={styles.contentRow}>
                <span className={styles.contentLabel}>Destination:</span>
                <span className={styles.contentValue}>{order.shipping?.destination}</span>
              </div>
              <div className={styles.contentRow}>
                <span className={styles.contentLabel}>Customer Location:</span>
                <span className={styles.contentValue}>{order.customerLocation || 'N/A'}</span>
              </div>
              <div className={styles.contentRow}>
                <span className={styles.contentLabel}>Customer Location Arrival:</span>
                <span className={styles.contentValue}>
                  {order.customerLocationArrivalDate 
                    ? formatDate(order.customerLocationArrivalDate) 
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                onClick={() => handleEditOrder(order)}
                className={styles.editButton}
              >
                Edit Details
              </button>
              <button
                onClick={() => handleAdvancePhase(order)}
                className={styles.advanceButton}
                disabled={(order.progress?.current || 1) >= (order.progress?.total || 7)}
              >
                Advance Phase
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`Permanently delete order ${order.orderId}? This cannot be undone.`)) return;
                  const result = await dispatch(hardDeleteOrder(order.orderId));
                  if (result.success) {
                    alert(`Order ${order.orderId} was permanently deleted.`);
                    dispatch(fetchOrders());
                  } else {
                    alert(result.error || 'Failed to permanently delete order.');
                  }
                }}
                className={styles.deleteButton}
                title="Delete Permanently"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {!loading.orders && filteredOrders.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3 className={styles.emptyTitle}>No orders found</h3>
          <p className={styles.emptyText}>
            {orders.length === 0 
              ? "No orders have been created yet. Create your first order to get started."
              : "Try adjusting your search terms or filters"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderManager; 
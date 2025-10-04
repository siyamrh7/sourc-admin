import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from '../../store/actions/customerActions';
import { createOrder } from '../../store/actions/orderActions';
import styles from './OrderCreator.module.css';

const OrderCreator = ({ onBack, preselectedCustomerId }) => {
  const dispatch = useDispatch();
  const { customers, loading } = useSelector(state => state.customers);
  const { loading: orderLoading, error } = useSelector(state => state.orders);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    // Products Information - now supports multiple products
    products: [
      {
        id: 1,
        name: '',
        description: '',
        quantity: '',
        value: ''
      }
    ],
    
    // Shipping Information
    destination: '',
    shippingMethod: 'Sea Freight',
    carrier: '',
    estimatedArrival: '',
    
    // Order Management
    priority: 'Medium',
    status: 'Development',
    notes: '',
    
    // Timeline Management
    enableTimelineCustomization: false,
    timelineSteps: [
      {
        id: 1,
        title: 'Offer Accepted',
        description: 'Customer has approved the offer; order has been initiated.',
        estimatedDuration: '1 day',
        startDate: '',
        finishDate: '',
        status: 'Completed',
        isCompleted: true,
        isInProgress: false,
        isLocked: false
      },
      {
        id: 2,
        title: 'Mold / Product in Development',
        description: 'Product or mold is being created.',
        estimatedDuration: '14 days',
        startDate: '',
        finishDate: '',
        status: 'In Progress',
        isCompleted: false,
        isInProgress: true,
        isLocked: false
      },
      {
        id: 3,
        title: 'Sample Sent to Client',
        description: 'Customer receives a sample. Approval required.',
        estimatedDuration: '3 days',
        startDate: '',
        finishDate: '',
        status: 'Locked',
        isCompleted: false,
        isInProgress: false,
        isLocked: true
      },
      {
        id: 4,
        title: 'Sample Approved',
        description: 'Customer has approved the sample. Mass production begins.',
        estimatedDuration: '2 days',
        startDate: '',
        finishDate: '',
        status: 'Locked',
        isCompleted: false,
        isInProgress: false,
        isLocked: true
      },
      {
        id: 5,
        title: 'Production Phase',
        description: 'Final product is being manufactured.',
        estimatedDuration: '21 days',
        startDate: '',
        finishDate: '',
        status: 'Locked',
        isCompleted: false,
        isInProgress: false,
        isLocked: true
      },
      {
        id: 6,
        title: 'Transport Phase',
        description: 'Order has shipped. In transit to the destination country.',
        estimatedDuration: '7 days',
        startDate: '',
        finishDate: '',
        status: 'Locked',
        isCompleted: false,
        isInProgress: false,
        isLocked: true
      },
      {
        id: 7,
        title: 'Delivered to Final Location',
        description: 'Order has been delivered to the specified location.',
        estimatedDuration: '1 day',
        startDate: '',
        finishDate: '',
        status: 'Locked',
        isCompleted: false,
        isInProgress: false,
        isLocked: true
      }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-generate estimated arrival date based on timeline
  const calculateEstimatedArrival = () => {
    const today = new Date();
    const totalDays = formData.timelineSteps.reduce((total, step) => {
      const days = parseInt(step.estimatedDuration) || 0;
      return total + days;
    }, 0);
    
    const arrivalDate = new Date(today.getTime() + (totalDays * 24 * 60 * 60 * 1000));
    return arrivalDate.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Auto-set carrier based on shipping method
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

  // Fetch customers on component mount
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // When customers load and a preselected ID exists, select that customer
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      const exists = customers.find(c => c._id === preselectedCustomerId);
      if (exists) {
        setSelectedCustomerId(preselectedCustomerId);
        setSelectedCustomer(exists);
      }
    }
  }, [preselectedCustomerId, customers]);

  // Auto-calculate estimated arrival when timeline changes
  useEffect(() => {
    if (!formData.estimatedArrival) {
      setFormData(prev => ({
        ...prev,
        estimatedArrival: calculateEstimatedArrival()
      }));
    }
  }, [formData.timelineSteps]);

  // Handle customer selection
  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    
    if (customerId) {
      const customer = customers.find(c => c._id === customerId);
      setSelectedCustomer(customer);
      
      // Auto-fill destination if customer has address
      if (customer?.address?.city && customer?.address?.country) {
        setFormData(prev => ({
          ...prev,
          destination: `${customer.address.city}, ${customer.address.country}`
        }));
      }
    } else {
      setSelectedCustomer(null);
      setFormData(prev => ({
        ...prev,
        destination: ''
      }));
    }

    // Clear validation error
    if (validationErrors.customer) {
      setValidationErrors(prev => ({
        ...prev,
        customer: ''
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Handle shipping method change
    if (name === 'shippingMethod') {
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        carrier: getDefaultCarrier(newValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTimelineStepChange = (stepIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      timelineSteps: prev.timelineSteps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }));
  };

  // Product management functions
  const addProduct = () => {
    const newProductId = Math.max(...formData.products.map(p => p.id), 0) + 1;
    setFormData(prev => ({
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
    if (formData.products.length > 1) {
      setFormData(prev => ({
        ...prev,
        products: prev.products.filter(product => product.id !== productId)
      }));
    }
  };

  const updateProduct = (productId, field, value) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === productId ? { ...product, [field]: value } : product
      )
    }));
  };

  // Calculate total order value
  const calculateTotalValue = () => {
    return formData.products.reduce((total, product) => {
      const value = parseFloat(product.value) || 0;
      return total + value;
    }, 0);
  };

  const validateForm = () => {
    const errors = {};

    if (!selectedCustomerId) errors.customer = 'Please select a customer';
    if (!formData.destination.trim()) errors.destination = 'Destination is required';
    if (!formData.estimatedArrival.trim()) errors.estimatedArrival = 'Estimated arrival date is required';

    // Validate products
    const productErrors = {};
    formData.products.forEach((product) => {
      const pErrors = {};
      const name = (product.name || '').trim();
      if (!name) {
        pErrors.name = 'Product name is required';
      } else if (name.length < 2 || name.length > 200) {
        pErrors.name = 'Product name must be between 2 and 200 characters';
      }

      if (!String(product.quantity || '').trim()) pErrors.quantity = 'Product quantity is required';
      if (!String(product.value || '').trim()) pErrors.value = 'Order value is required';
      
      if (Object.keys(pErrors).length > 0) {
        errors[`product_${product.id}`] = pErrors;
      }
    });

    // Check if at least one product has all required fields
    const hasValidProduct = formData.products.some(product => {
      const name = (product.name || '').trim();
      return name && name.length >= 2 && name.length <= 200 && String(product.quantity || '').trim() && String(product.value || '').trim();
    });
    
    if (!hasValidProduct) {
      errors.products = 'At least one complete product is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        customer: {
          customerId: selectedCustomer._id,
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          company: selectedCustomer.company
        },
        products: formData.products.filter(product => 
          product.name.trim() && product.quantity.trim() && product.value.trim()
        ),
        totalValue: calculateTotalValue(),
        shipping: {
          destination: formData.destination,
          method: formData.shippingMethod,
          carrier: formData.carrier,
          estimatedArrival: formData.estimatedArrival
        },
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes,
        timeline: formData.enableTimelineCustomization ? formData.timelineSteps : undefined,
        // Set initial progress based on status
        progress: {
          current: formData.status === 'Development' ? 1 : 
                  formData.status === 'In Progress' ? 2 : 1,
          total: 7
        }
      };

      const result = await dispatch(createOrder(orderData));
      
      if (result.success) {
        alert(`Order created successfully and assigned to ${selectedCustomer.name}!`);
        onBack();
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.orderCreator}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <span className={styles.backIcon}>←</span>
          Back to Dashboard
        </button>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Create New Order</h1>
          <p className={styles.subtitle}>
            Set up a new order for a customer with comprehensive details and timeline
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Customer Selection */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Customer Assignment</h2>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="customer">
                Select Customer *
              </label>
              <select
                id="customer"
                value={selectedCustomerId}
                onChange={handleCustomerSelect}
                className={`${styles.select} ${validationErrors.customer ? styles.error : ''}`}
                required
              >
                <option value="">Choose a customer to assign this order to...</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.email}
                    {customer.company?.name && ` (${customer.company.name})`}
                  </option>
                ))}
              </select>
              {validationErrors.customer && (
                <span className={styles.errorMessage}>{validationErrors.customer}</span>
              )}
              {loading.customers && (
                <span className={styles.loadingText}>Loading customers...</span>
              )}
            </div>

            {selectedCustomer && (
              <div className={styles.customerPreview}>
                <h3 className={styles.previewTitle}>Selected Customer Details</h3>
                <div className={styles.customerInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Name:</span>
                    <span className={styles.infoValue}>{selectedCustomer.name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Phone:</span>
                      <span className={styles.infoValue}>{selectedCustomer.phone}</span>
                    </div>
                  )}
                  {selectedCustomer.company?.name && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Company:</span>
                      <span className={styles.infoValue}>{selectedCustomer.company.name}</span>
                    </div>
                  )}
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Total Orders:</span>
                    <span className={styles.infoValue}>{selectedCustomer.totalOrders || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Information */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Products Information</h2>
              <button
                type="button"
                onClick={addProduct}
                className={styles.addProductButton}
              >
                <span className={styles.addIcon}>+</span>
                Add Product
              </button>
            </div>

            {validationErrors.products && (
              <div className={styles.errorBanner}>
                <span className={styles.errorIcon}>❌</span>
                {validationErrors.products}
              </div>
            )}

            <div className={styles.productsList}>
              {formData.products.map((product, index) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productHeader}>
                    <h3 className={styles.productTitle}>
                      Product {index + 1}
                      {formData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className={styles.removeProductButton}
                          title="Remove Product"
                        >
                          <span className={styles.removeIcon}>×</span>
                        </button>
                      )}
                    </h3>
                  </div>

                  <div className={styles.productForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        className={`${styles.input} ${
                          validationErrors[`product_${product.id}`]?.name ? styles.error : ''
                        }`}
                        placeholder="e.g., Custom Injection Parts"
                      />
                      {validationErrors[`product_${product.id}`]?.name && (
                        <span className={styles.errorMessage}>
                          {validationErrors[`product_${product.id}`].name}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Product Description
                      </label>
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                        className={styles.textarea}
                        rows="2"
                        placeholder="Detailed description of the product specifications, materials, requirements..."
                      />
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Quantity *
                        </label>
                        <input
                          type="text"
                          value={product.quantity}
                          onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                          className={`${styles.input} ${
                            validationErrors[`product_${product.id}`]?.quantity ? styles.error : ''
                          }`}
                          placeholder="e.g., 5,000 units"
                        />
                        {validationErrors[`product_${product.id}`]?.quantity && (
                          <span className={styles.errorMessage}>
                            {validationErrors[`product_${product.id}`].quantity}
                          </span>
                        )}
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Product Value *
                        </label>
                        <input
                          type="text"
                          value={product.value}
                          onChange={(e) => updateProduct(product.id, 'value', e.target.value)}
                          className={`${styles.input} ${
                            validationErrors[`product_${product.id}`]?.value ? styles.error : ''
                          }`}
                          placeholder="e.g., €25,000"
                        />
                        {validationErrors[`product_${product.id}`]?.value && (
                          <span className={styles.errorMessage}>
                            {validationErrors[`product_${product.id}`].value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.totalValueSection}>
              <div className={styles.totalValueCard}>
                <h3 className={styles.totalValueTitle}>Total Order Value</h3>
                <div className={styles.totalValueAmount}>
                  €{calculateTotalValue().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="priority">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="status">
                  Initial Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
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
            </div>
          </div>

          {/* Shipping Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Shipping Information</h2>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="destination">
                Destination *
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className={`${styles.input} ${validationErrors.destination ? styles.error : ''}`}
                required
                placeholder="e.g., Rotterdam, NL"
              />
              {validationErrors.destination && (
                <span className={styles.errorMessage}>{validationErrors.destination}</span>
              )}
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="shippingMethod">
                  Shipping Method
                </label>
                <select
                  id="shippingMethod"
                  name="shippingMethod"
                  value={formData.shippingMethod}
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
                <label className={styles.label} htmlFor="carrier">
                  Carrier
                </label>
                <input
                  type="text"
                  id="carrier"
                  name="carrier"
                  value={formData.carrier}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Automatically set based on shipping method"
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="estimatedArrival">
                Estimated Arrival Date *
              </label>
              <input
                type="date"
                id="estimatedArrival"
                name="estimatedArrival"
                value={formData.estimatedArrival}
                onChange={handleInputChange}
                className={`${styles.input} ${validationErrors.estimatedArrival ? styles.error : ''}`}
                required
              />
              {validationErrors.estimatedArrival && (
                <span className={styles.errorMessage}>{validationErrors.estimatedArrival}</span>
              )}
              <small className={styles.helpText}>
                Auto-calculated based on timeline, but can be manually adjusted
              </small>
            </div>
          </div>

          {/* Timeline Management */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Timeline Management</h2>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="enableTimelineCustomization"
                  checked={formData.enableTimelineCustomization}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span>Customize timeline phases and durations</span>
              </label>
              <small className={styles.helpText}>
                Enable this to set specific dates and durations for each phase
              </small>
            </div>

            {formData.enableTimelineCustomization && (
              <div className={styles.timelineCustomization}>
                <h3 className={styles.subSectionTitle}>Timeline Phases</h3>
                <div className={styles.timelineSteps}>
                  {formData.timelineSteps.map((step, index) => (
                    <div key={step.id} className={styles.timelineStep}>
                      <div className={styles.stepHeader}>
                        <h4 className={styles.stepTitle}>
                          Phase {step.id}: {step.title}
                        </h4>
                      </div>
                      
                      <div className={styles.stepForm}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Description</label>
                          <textarea
                            value={step.description}
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
                              value={step.estimatedDuration}
                              onChange={(e) => handleTimelineStepChange(index, 'estimatedDuration', e.target.value)}
                              className={styles.input}
                              placeholder="e.g., 14 days"
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Start Date</label>
                            <input
                              type="date"
                              value={step.startDate}
                              onChange={(e) => handleTimelineStepChange(index, 'startDate', e.target.value)}
                              className={styles.input}
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Finish Date</label>
                            <input
                              type="date"
                              value={step.finishDate}
                              onChange={(e) => handleTimelineStepChange(index, 'finishDate', e.target.value)}
                              className={styles.input}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Additional Information</h2>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="notes">
                Notes & Special Instructions
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className={styles.textarea}
                rows="4"
                placeholder="Any special requirements, handling instructions, customer preferences, or additional notes..."
              />
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <span className={styles.errorIcon}>❌</span>
            {error}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onBack}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                Creating Order...
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>✨</span>
                Create Order
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderCreator; 
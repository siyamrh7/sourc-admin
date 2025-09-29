import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, deleteCustomer, updateCustomer } from '../../store/actions/customerActions';
import styles from './CustomerManager.module.css';

const CustomerManager = ({ onBack, onViewChange }) => {
  const dispatch = useDispatch();
  const { customers, loading } = useSelector(state => state.customers);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.company?.name && customer.company.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'active' && customer.accountStatus === 'active') ||
      (statusFilter === 'suspended' && customer.accountStatus === 'suspended') ||
      (statusFilter === 'pending' && customer.accountStatus === 'pending');
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await dispatch(deleteCustomer(customerId));
      dispatch(fetchCustomers()); // Refresh the list
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4ade80';
      case 'suspended': return '#f87171';
      case 'pending': return '#fbbf24';
      default: return '#9ca3af';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleStartEdit = (customer) => {
    setIsEditing(true);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      customerType: customer.customerType || 'individual',
      accountStatus: customer.accountStatus || 'active',
      company: {
        name: customer.company?.name || '',
        website: customer.company?.website || ''
      },
      address: customer.fullAddress || [
        customer.company?.address?.street,
        customer.company?.address?.city,
        customer.company?.address?.state,
        customer.company?.address?.zipCode,
        customer.company?.address?.country
      ].filter(Boolean).join(', ')
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('company.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        company: { ...prev.company, [key]: value }
      }));
    } else if (name === 'address') {
      setFormData(prev => ({ ...prev, address: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (customerId) => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
      };
      // Clean empty nested company fields
      if (payload.company && !payload.company.name && !payload.company.website) {
        delete payload.company;
      }
      // Map single-line address to backend structure: company.address.street
      if (typeof payload.address === 'string') {
        const trimmed = payload.address.trim();
        if (trimmed) {
          payload.company = {
            ...(payload.company || {}),
            address: {
              street: trimmed
            }
          };
        }
        delete payload.address;
      }
      const result = await dispatch(updateCustomer(customerId, payload));
      if (result?.success) {
        // Keep modal open but switch to view with updated data
        setSelectedCustomer(result.data);
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const CustomerDetailsModal = ({ customer, onClose }) => (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{isEditing ? 'Edit Customer' : 'Customer Details'}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          {isEditing ? (
            <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave(customer._id); }}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>Name</label>
                  <input name="name" className={styles.input} value={formData.name || ''} onChange={handleChange} required />
                </div>
                <div className={styles.formField}>
                  <label>Email</label>
                  <input type="email" name="email" className={styles.input} value={formData.email || ''} onChange={handleChange} required />
                </div>
                <div className={styles.formField}>
                  <label>Phone</label>
                  <input name="phone" className={styles.input} value={formData.phone || ''} onChange={handleChange} />
                </div>
                <div className={styles.formField}>
                  <label>Customer Type</label>
                  <select name="customerType" className={styles.select} value={formData.customerType || 'individual'} onChange={handleChange}>
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className={styles.formField}>
                  <label>Account Status</label>
                  <select name="accountStatus" className={styles.select} value={formData.accountStatus || 'active'} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className={styles.formField}>
                  <label>Company Name</label>
                  <input name="company.name" className={styles.input} value={formData.company?.name || ''} onChange={handleChange} />
                </div>
                <div className={styles.formField}>
                  <label>Company Website</label>
                  <input type="url" name="company.website" className={styles.input} value={formData.company?.website || ''} onChange={handleChange} />
                </div>
                <div className={styles.formField}>
                  <label>Address</label>
                  <input name="address" className={styles.input} value={formData.address || ''} onChange={handleChange} placeholder="Enter full address" />
                </div>
              </div>
            </form>
          ) : (
            <div className={styles.customerInfo}>
              <div className={styles.infoRow}>
                <label>Name:</label>
                <span>{customer.name}</span>
              </div>
              <div className={styles.infoRow}>
                <label>Email:</label>
                <span>{customer.email}</span>
              </div>
              <div className={styles.infoRow}>
                <label>Phone:</label>
                <span>{customer.phone || 'Not provided'}</span>
              </div>
              <div className={styles.infoRow}>
                <label>Customer Type:</label>
                <span className={styles.capitalize}>{customer.customerType}</span>
              </div>
              <div className={styles.infoRow}>
                <label>Account Status:</label>
                <span 
                  className={styles.status}
                  style={{ color: getStatusColor(customer.accountStatus) }}
                >
                  {customer.accountStatus}
                </span>
              </div>
              {customer.company?.name && (
                <>
                  <div className={styles.infoRow}>
                    <label>Company:</label>
                    <span>{customer.company.name}</span>
                  </div>
                  {customer.company.website && (
                    <div className={styles.infoRow}>
                      <label>Website:</label>
                      <a href={customer.company.website} target="_blank" rel="noopener noreferrer">
                        {customer.company.website}
                      </a>
                    </div>
                  )}
                </>
              )}
              <div className={styles.infoRow}>
                <label>Total Orders:</label>
                <span>{customer.totalOrders || 0}</span>
              </div>
              <div className={styles.infoRow}>
                <label>Total Spent:</label>
                <span>€{(customer.totalSpent || 0).toLocaleString()}</span>
              </div>
              <div className={styles.infoRow}>
                <label>Member Since:</label>
                <span>{formatDate(customer.createdAt)}</span>
              </div>
              {customer.lastLoginDate && (
                <div className={styles.infoRow}>
                  <label>Last Login:</label>
                  <span>{formatDate(customer.lastLoginDate)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={styles.modalActions}>
          {isEditing ? (
            <>
              <button 
                className={styles.editButton}
                onClick={() => handleSave(customer._id)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className={styles.viewButton}
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              className={styles.editButton}
              onClick={() => handleStartEdit(customer)}
            >
              Edit Customer
            </button>
          )}
          <button 
            className={styles.deleteButton}
            onClick={() => {
              handleDeleteCustomer(customer._id);
              onClose();
            }}
          >
            Delete Customer
          </button>
        </div>
      </div>
    </div>
  );

  if (loading.customers && !customers.length) {
    return (
      <div className={styles.customerManager}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.customerManager}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <span className={styles.backIcon}>←</span>
          Back to Dashboard
        </button>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Manage Customers</h1>
          <p className={styles.subtitle}>
            View and manage customer accounts, track their orders and activity
          </p>
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={() => onViewChange('createCustomer')}
          >
            <span className={styles.buttonIcon}>👤</span>
            Create New Customer
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name, email, or company..."
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
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className={styles.customerGrid}>
        {filteredCustomers.map((customer) => (
          <div key={customer._id} className={styles.customerCard}>
            <div className={styles.customerHeader}>
              <div className={styles.customerInfo}>
                <h3 className={styles.customerName}>{customer.name}</h3>
                <p className={styles.customerEmail}>{customer.email}</p>
                {customer.company?.name && (
                  <p className={styles.companyName}>{customer.company.name}</p>
                )}
              </div>
              <div 
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(customer.accountStatus) }}
              >
                {customer.accountStatus}
              </div>
            </div>
            
            <div className={styles.customerStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Orders</span>
                <span className={styles.statValue}>{customer.totalOrders || 0}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total Spent</span>
                <span className={styles.statValue}>€{(customer.totalSpent || 0).toLocaleString()}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Member Since</span>
                <span className={styles.statValue}>{formatDate(customer.createdAt)}</span>
              </div>
            </div>
            
            <div className={styles.customerActions}>
              <button 
                className={styles.viewButton}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowCustomerModal(true);
                }}
              >
                View Details
              </button>
              <button 
                className={styles.createOrderButton}
                onClick={() => onViewChange('createOrder', customer._id)}
              >
                Create Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <h3>No customers found</h3>
          <p>
            {searchTerm || statusFilter !== 'All' 
              ? 'Try adjusting your search criteria or filters'
              : 'Start by creating your first customer account'
            }
          </p>
          {!searchTerm && statusFilter === 'All' && (
            <button 
              className={styles.primaryButton}
              onClick={() => onViewChange('createCustomer')}
            >
              Create First Customer
            </button>
          )}
        </div>
      )}

      {showCustomerModal && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerModal(false);
            setSelectedCustomer(null);
            setIsEditing(false);
            setFormData({});
          }}
        />
      )}
    </div>
  );
};

export default CustomerManager; 
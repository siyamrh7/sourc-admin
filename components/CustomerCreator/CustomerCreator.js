import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCustomer } from '../../store/actions/customerActions';
import styles from './CustomerCreator.module.css';

const CustomerCreator = ({ onBack, onViewChange }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.customers);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    customerType: 'business',
    accountStatus: 'active',
    company: {
      name: '',
      taxId: '',
      website: ''
    },
    address: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirm password is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation (if provided)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Company name required for business customers
    if (formData.customerType === 'business' && !formData.company.name.trim()) {
      errors.companyName = 'Company name is required for business customers';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Remove confirmPassword from data
      const { confirmPassword, ...rawData } = formData;
      // Map single string address to backend company.address.street if provided
      const customerData = {
        ...rawData,
        ...(rawData.address?.trim()
          ? { company: { ...rawData.company, address: { street: rawData.address.trim() } } }
          : { company: rawData.company })
      };
      if (!rawData.address?.trim()) delete customerData.address;
      
      const result = await dispatch(createCustomer(customerData));
      
      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          customerType: 'business',
          accountStatus: 'active',
          company: { name: '', taxId: '', website: '' },
          address: ''
        });
        
        // Show success message or redirect
        alert('Customer created successfully!');
        onViewChange('manageCustomers');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));
  };

  return (
    <div className={styles.customerCreator}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <span className={styles.backIcon}>←</span>
          Back to Dashboard
        </button>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Create New Customer</h1>
          <p className={styles.subtitle}>
            Add a new customer account to the system
          </p>
        </div>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Basic Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Full Name *
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors.name ? styles.error : ''}`}
                    placeholder="Enter customer's full name"
                  />
                  {validationErrors.name && (
                    <span className={styles.errorMessage}>{validationErrors.name}</span>
                  )}
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email Address *
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors.email ? styles.error : ''}`}
                    placeholder="customer@example.com"
                  />
                  {validationErrors.email && (
                    <span className={styles.errorMessage}>{validationErrors.email}</span>
                  )}
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Phone Number
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors.phone ? styles.error : ''}`}
                    placeholder="+1 234 567 8900"
                  />
                  {validationErrors.phone && (
                    <span className={styles.errorMessage}>{validationErrors.phone}</span>
                  )}
                </label>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Customer Type *
                    <select
                      name="customerType"
                      value={formData.customerType}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="business">Business</option>
                      <option value="individual">Individual</option>
                    </select>
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Account Status *
                    <select
                      name="accountStatus"
                      value={formData.accountStatus}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Login Credentials</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Password *
                  <div className={styles.passwordInput}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${styles.input} ${validationErrors.password ? styles.error : ''}`}
                      placeholder="Enter a secure password"
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <span className={styles.errorMessage}>{validationErrors.password}</span>
                  )}
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Confirm Password *
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors.confirmPassword ? styles.error : ''}`}
                    placeholder="Confirm the password"
                  />
                  {validationErrors.confirmPassword && (
                    <span className={styles.errorMessage}>{validationErrors.confirmPassword}</span>
                  )}
                </label>
              </div>

              <button
                type="button"
                className={styles.generateButton}
                onClick={generatePassword}
              >
                🎲 Generate Secure Password
              </button>
            </div>

            {/* Company Information (conditional) */}
            {formData.customerType === 'business' && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Company Information</h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Company Name *
                    <input
                      type="text"
                      name="company.name"
                      value={formData.company.name}
                      onChange={handleInputChange}
                      className={`${styles.input} ${validationErrors.companyName ? styles.error : ''}`}
                      placeholder="Company name"
                    />
                    {validationErrors.companyName && (
                      <span className={styles.errorMessage}>{validationErrors.companyName}</span>
                    )}
                  </label>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Address
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="Enter full address"
                      />
                    </label>
                  </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Tax ID / VAT Number
                      <input
                        type="text"
                        name="company.taxId"
                        value={formData.company.taxId}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="Tax identification number"
                      />
                    </label>
                  </div>
                
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Website
                      <input
                        type="url"
                        name="company.website"
                        value={formData.company.website}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="https://company-website.com"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

         
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}>❌</span>
              {error}
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onBack}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Creating Customer...
                </>
              ) : (
                <>
                  <span className={styles.buttonIcon}>👤</span>
                  Create Customer Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerCreator; 
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from 'react-redux';
import Head from "next/head";
import { getCurrentCustomer, loginCustomer, clearCustomerAuthError } from '../store/actions/customerAuthActions';
import styles from '../styles/CustomerPortal.module.css';

export default function CustomerPortal() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, customer, isLoading, error } = useSelector(state => state.customerAuth);
  
  // Login form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('customerToken');
      if (token) {
        dispatch(getCurrentCustomer());
      } else {
        setIsAuthenticating(false);
      }
    } else {
      setIsAuthenticating(false);
    }
  }, [dispatch]);

  // Update authenticating state when auth check completes
  useEffect(() => {
    if (!isLoading) {
      setIsAuthenticating(false);
    }
  }, [isLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) {
      dispatch(clearCustomerAuthError());
    }
    
    const result = await dispatch(loginCustomer(formData));
    
    if (result.success) {
      // Redirect will happen automatically via useEffect below
      console.log('Login successful');
    }
  };

  // Redirect to customer dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && customer && !isAuthenticating) {
      router.push('/customer-dashboard');
    }
  }, [isAuthenticated, customer, isAuthenticating, router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Loading state during initial auth check
  if (isAuthenticating) {
    return (
      <>
        <Head>
          <title>Customer Portal - SOURC</title>
          <meta name="description" content="Customer portal for order management" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  // If authenticated, this will redirect to customer-dashboard
  // This is just a fallback while redirecting
  if (isAuthenticated && customer) {
    return (
      <>
        <Head>
          <title>Customer Portal - SOURC</title>
          <meta name="description" content="Customer portal for order management" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Redirecting to dashboard...</p>
        </div>
      </>
    );
  }

  // Show login form for non-authenticated users
  return (
    <>
      <Head>
        <title>Customer Portal - SOURC</title>
        <meta name="description" content="Customer portal for order management and tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <main className={styles.main}>
          {/* Login Card */}
          <div className={styles.loginCard}>
            <div className={styles.header}>
              <div className={styles.logo}>
                <h1>SOURC</h1>
              </div>
              <h2 className={styles.title}>Customer Portal</h2>
              <p className={styles.subtitle}>
                Access your orders and track delivery progress
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && (
                <div className={styles.error}>
                  <span className={styles.errorIcon}>⚠️</span>
                  {error}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p className={styles.adminLink}>
                Are you an administrator?{' '}
                <a href="/login" className={styles.link}>
                  Sign in here
                </a>
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className={styles.features}>
            <h3 className={styles.featuresTitle}>Customer Portal Features</h3>
            <ul className={styles.featuresList}>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>📦</span>
                <span>View your assigned orders</span>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>📍</span>
                <span>Track delivery progress in real-time</span>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>📋</span>
                <span>Access order details and timeline</span>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>🔔</span>
                <span>Get notified of status updates</span>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>👤</span>
                <span>Manage your profile information</span>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>🔒</span>
                <span>Secure access to your data</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}

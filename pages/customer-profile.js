import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import Head from 'next/head';
import styles from '../styles/CustomerProfile.module.css';
import dashboardStyles from '../styles/CustomerDashboard.module.css';
import Footer from '../components/Footer/Footer';
import { logout, getCurrentCustomer ,logoutCustomer} from '../store/actions/customerAuthActions';
import API, { customerAuthAPI } from '../services/api';
import loginStyles from '../styles/Login.module.css';

const CustomerProfile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { customer, isAuthenticated } = useSelector(state => state.customerAuth);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    company: {
      name: '',
      kvk: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [changeEmail, setChangeEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [address, setAddress] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      try {
        // Fetch fresh customer data from backend
        await dispatch(getCurrentCustomer());
      } catch (error) {
        router.push('/login');
      }
    };
    
    if (mounted) {
      checkAuthentication();
    }
  }, [dispatch, router, mounted]);

  useEffect(() => {
    if (customer) {
      setProfileData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: {
          name: customer.company?.name || customer.name || '',
          kvk: customer.company?.kvk || ''
        },
        address: customer.address || {}
      });
      setResetEmail(customer.email || '');
      setChangeEmail(customer.email || '');
      // Use fullAddress field from customer
      setAddress(customer.fullAddress || '');
    }
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });

      // Update customer.fullAddress field
      const payload = {
        ...profileData,
        fullAddress: address?.trim() || '',
        company: {
          ...(profileData.company || {})
        }
      };

      const { data } = await customerAuthAPI.updateProfile(payload);

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        // Update local state from server response
        const updated = data.data || {};
        setProfileData({
          name: updated.name || '',
          email: updated.email || '',
          phone: updated.phone || '',
          company: {
            name: updated.company?.name || updated.name || '',
            kvk: updated.company?.kvk || ''
          },
          address: updated.address || {}
        });
        // Use fullAddress from response
        setAddress(updated.fullAddress || '');
        // Refresh Redux customer state
        dispatch(getCurrentCustomer());
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setResetLoading(true);
      setMessage({ type: '', text: '' });

      const { data } = await API.post('/customer-auth/forgot-password', { email: resetEmail });

      if (data.success) {
        setMessage({ type: 'success', text: 'Password reset email sent successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send reset email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send reset email. Please try again.' });
    } finally {
      setResetLoading(false);
    }
  };

  const handleChangePasswordByEmail = async () => {
    try {
      setChangeLoading(true);
      setMessage({ type: '', text: '' });

      const payload = { email: changeEmail, currentPassword, newPassword };
      const { data } = await customerAuthAPI.changePasswordByEmail(payload);

      if (data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.error || 'Failed to update password. Please try again.' });
    } finally {
      setChangeLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutCustomer());
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  const formatAddress = () => {
    return address || '';
  };

  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Profile & Settings - Sourc</title>
        <meta name="description" content="Manage your profile and account settings" />
      </Head>

      <div className={dashboardStyles.dashboardContainer}>
        {/* Header (kept layout) with drawer trigger */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <button className={loginStyles.mobileMenuButton} onClick={() => setIsDrawerOpen(true)} aria-label="Open menu">
              <img src="/icons/menu.svg" alt="Menu" className={loginStyles.hamburger} />
            </button>
            <div className={styles.logo}>sourc.</div>
            <nav className={styles.nav}>
              <a href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer">About Us</a>
              <a href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer">Services</a>
              <a href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer">Process</a>
              <a href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer">Team</a>
            </nav>
            <div className={styles.headerActions}>
              <span className={styles.userIcon}><img src="icons/user-circle.svg" alt="User" /></span>
              <a href="https://sourc.nl/#contact" target="_blank" rel="noopener noreferrer" className={styles.sourceButton}>START WITH SOURCES</a>
              <div className={styles.languageSelector}>
                <span>EN 🇬🇧</span>
              </div>
            </div>
          </div>
        </header>

        {/* Drawer - reuse login drawer styles for consistency */}
        {isDrawerOpen && (
          <>
            <div className={loginStyles.drawerOverlay} onClick={() => setIsDrawerOpen(false)} />
            <div className={`${loginStyles.drawer} ${loginStyles.drawerOpen}`} role="dialog" aria-modal="true">
              <div className={loginStyles.drawerHeader}>
                <div className={loginStyles.drawerTitle}>Menu</div>
                <button className={loginStyles.drawerCloseBtn} onClick={() => setIsDrawerOpen(false)} aria-label="Close menu">×</button>
              </div>
              <nav className={loginStyles.drawerNav}>
                <a href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer" className={loginStyles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>About Us</a>
                <a href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer" className={loginStyles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Services</a>
                <a href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer" className={loginStyles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Process</a>
                <a href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer" className={loginStyles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Team</a>
              </nav>
              <div className={loginStyles.drawerActions}>
                <span className={styles.userIcon}><img src="icons/user-circle.svg" alt="User" /></span>
                <a href="https://sourc.nl/#contact" target="_blank" rel="noopener noreferrer" className={styles.sourceButton}>START WITH SOURCES</a>
                <div className={styles.languageSelector}>EN 🇬🇧</div>
              </div>
            </div>
          </>
        )}

        <div className={dashboardStyles.dashboardLayout}>
          {/* Sidebar (dashboard styles) */}
          <aside className={dashboardStyles.sidebar}>
            <div className={dashboardStyles.sidebarContent}>
              <div className={dashboardStyles.navigation}>
                <div 
                  className={dashboardStyles.navItem}
                  onClick={() => router.push('/customer-dashboard')}
                >
                  <span className={dashboardStyles.icon}><img src="icons/grid-01.svg" alt="Order Dashboard" /></span>
                  <span>Order Dashboard</span>
                </div>
                <div className={`${dashboardStyles.navItem} ${dashboardStyles.active}`}>
                  <span className={dashboardStyles.icon}><img src="icons/settings-01.svg" alt="Profile & Settings" /></span>
                  <span>Profile & Settings</span>
                </div>
              </div>
              
              <div className={dashboardStyles.sidebarFooter}>
                <div className={dashboardStyles.logoutItem} onClick={handleLogout}>
                  <span className={dashboardStyles.icon}><img src="icons/logout.svg" alt="Logout" /></span>
                  <span>Log out</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={dashboardStyles.mainContent}>
            <div className={styles.profileContainer}>
              <h1 className={styles.pageTitle}>{profileData.company.name}&apos;s info</h1>
              
              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              <div className={styles.contentGrid}>
                {/* Profile Information Section */}
                <div className={styles.profileSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{profileData.company.name}</h2>
                    <button 
                      className={styles.editButton}
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      disabled={isLoading}
                    >
                      {isEditing ? (isLoading ? 'Saving...' : 'Save') : 'Edit'}
                    </button>
                  </div>

                  <div className={styles.profileInfo}>
                    {isEditing ? (
                      <div className={styles.editForm}>
                        <div className={styles.formGroup}>
                          <label>Company Name</label>
                          <input
                            type="text"
                            name="company.name"
                            value={profileData.company.name}
                            onChange={handleInputChange}
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>KVK Number</label>
                          <input
                            type="text"
                            name="company.kvk"
                            value={profileData.company.kvk}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="Enter KVK number"
                          />
                        </div>
                        
                        <div className={styles.formGroup}>
                          <label>Contact Name</label>
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Address</label>
                          <input
                            type="text"
                            name="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={styles.input}
                            placeholder="Enter full address"
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            className={styles.input}
                            readOnly
                          />
                          <small>Email cannot be changed</small>
                        </div>

                        <div className={styles.editActions}>
                          <button 
                            className={styles.cancelButton}
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.displayInfo}>
                        <div className={styles.infoItem}>
                          <span className={styles.address}>{formatAddress()}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.phone}>{profileData.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.kvk}>kvk: {profileData.company.kvk}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.phone}>{profileData.phone}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.email}>{profileData.email}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Reset Section */}
                {/* <div className={styles.passwordSection}>
                  <h2 className={styles.sectionTitle}>Reset password</h2>
                  <p className={styles.resetDescription}>
                    You&apos;ll receive an email to reset your password.
                  </p>
                  
                  <div className={styles.resetForm}>
                    <input
                      type="email"
                      placeholder="Email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className={styles.emailInput}
                    />
                    <button 
                      className={styles.sendButton}
                      onClick={handlePasswordReset}
                      disabled={resetLoading || !resetEmail}
                    >
                      {resetLoading ? 'SENDING...' : 'SEND'}
                    </button>
                  </div>
                </div> */}

                {/* Change Password Section */}
                <div className={styles.passwordSection}>
                  <h2 className={styles.sectionTitle}>Change password</h2>
                  <p className={styles.resetDescription}>
                    Change your password using your email, current password and new password.
                  </p>
                  <div className={styles.resetForm}>
                    <input
                      type="email"
                      placeholder="Email"
                      value={changeEmail}
                      onChange={(e) => setChangeEmail(e.target.value)}
                      className={styles.emailInput}
                    />
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={styles.emailInput}
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.emailInput}
                    />
                    <button 
                      className={styles.sendButton}
                      onClick={handleChangePasswordByEmail}
                      disabled={changeLoading || !changeEmail || !currentPassword || !newPassword}
                    >
                      {changeLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Footer aligned with main content */}
        <div className={dashboardStyles.footerContainer}>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default CustomerProfile; 
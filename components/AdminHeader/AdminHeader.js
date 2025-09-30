import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { logoutUser } from '../../store/actions/authActions';
import styles from './AdminHeader.module.css';

const AdminHeader = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      router.push('/login');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link href="/admin" className={styles.logo}>
            <span className={styles.logoText}>sourc.</span>
            <span className={styles.adminBadge}>Admin</span>
          </Link>
        </div>
        
        <div className={styles.rightSection}>
          <div className={styles.userInfo}>
            <span className={styles.adminText}>Welcome, {user?.name || 'Admin'}</span>
            <div className={styles.userProfile} onClick={toggleUserMenu}>
              <div className={styles.userIcon}>
                <span><img src="icons/user-circle.svg" alt="User" /></span>
              </div>
              <span className={styles.userName}>{user?.name || 'Admin'}</span>
              <span className={styles.dropdown}>▼</span>
            </div>
            
            {isUserMenuOpen && (
              <div className={styles.userMenu}>
                <div className={styles.userMenuHeader}>
                  <div className={styles.userMenuName}>{user?.name || 'Admin'}</div>
                  <div className={styles.userMenuEmail}>{user?.email || ''}</div>
                  <div className={styles.userMenuRole}>{user?.role || 'admin'}</div>
                </div>
                <hr className={styles.userMenuDivider} />
                <button 
                  className={styles.userMenuItem}
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    // Could add profile editing here
                  }}
                >
                  Profile Settings
                </button>
                <button 
                  className={styles.userMenuItem}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          
          <Link href="/" className={styles.switchButton}>
            Switch to User View
          </Link>
        </div>
        
        <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
          <span className={styles.hamburger}>≡</span>
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileUserInfo}>
            <div className={styles.mobileUserName}>{user?.name || 'Admin'}</div>
            <div className={styles.mobileUserEmail}>{user?.email || ''}</div>
          </div>
          <div className={styles.mobileActions}>
            <Link href="/" className={styles.mobileSwitchButton}>
              Switch to User View
            </Link>
            <button className={styles.mobileLogoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader; 
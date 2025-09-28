import { useState } from 'react';
import styles from './Header.module.css';

const Header = ({ onMobileMenuToggle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMobileMenuToggle) {
      onMobileMenuToggle(!isMobileMenuOpen);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.mobileLeft}>
          <div className={styles.userIconMobile}>
            <span>😊</span>
          </div>
        </div>
        
        <div className={styles.logo}>
          <span className={styles.logoText}>sourc.</span>
        </div>
        
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>About Us</a>
          <a href="#" className={styles.navLink}>Services</a>
          <a href="#" className={styles.navLink}>Process</a>
          <a href="#" className={styles.navLink}>Team</a>
          <a href="/login" className={`${styles.navLink} ${styles.adminPortal}`}>Admin Portal</a>
        </nav>
        
        <div className={styles.actions}>
          <div className={styles.userIcon}>
            <span>😊</span>
          </div>
          <button className={styles.ctaButton}>
            START WITH SOURCES
          </button>
          <div className={styles.language}>
            EN 🇬🇧
          </div>
        </div>
        
        <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
          <span className={styles.hamburger}>≡</span>
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <a href="#" className={styles.mobileNavLink}>About Us</a>
            <a href="#" className={styles.mobileNavLink}>Services</a>
            <a href="#" className={styles.mobileNavLink}>Process</a>
            <a href="#" className={styles.mobileNavLink}>Team</a>
            <a href="/login" className={`${styles.mobileNavLink} ${styles.adminPortal}`}>Admin Portal</a>
          </nav>
          <div className={styles.mobileActions}>
            <button className={styles.mobileCtaButton}>
              START WITH SOURCES
            </button>
            <div className={styles.mobileLanguage}>
              EN 🇬🇧
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 
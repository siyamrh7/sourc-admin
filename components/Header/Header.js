import { useState } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
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
          <Link href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer" className={styles.navLink}>About Us</Link>
          <Link href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Services</Link>
          <Link href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Process</Link>
          <Link href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Team</Link>
          <Link href="/login" className={`${styles.navLink} ${styles.adminPortal}`}>Admin Portal</Link>
        </nav>
        
        <div className={styles.actions}>
          <div className={styles.userIcon}>
            <span>😊</span>
          </div>
          <a href="https://sourc.nl/#contact" target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
            START WITH SOURCES
          </a>
          <div className={styles.language}>
            EN 🇬🇧
          </div>
        </div>
        
        <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
          <span className={styles.hamburger}>≡</span>
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <>
          <div className={styles.drawerOverlay} onClick={toggleMobileMenu} />
          <div className={`${styles.drawer} ${styles.drawerOpen}`} role="dialog" aria-modal="true">
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitle}>Menu</div>
              <button className={styles.drawerCloseBtn} onClick={toggleMobileMenu} aria-label="Close menu">×</button>
            </div>
            <nav className={styles.drawerNav}>
              <Link href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={toggleMobileMenu}>About Us</Link>
              <Link href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={toggleMobileMenu}>Services</Link>
              <Link href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={toggleMobileMenu}>Process</Link>
              <Link href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={toggleMobileMenu}>Team</Link>
              <Link href="/login" className={`${styles.drawerNavLink} ${styles.adminPortal}`} onClick={toggleMobileMenu}>Admin Portal</Link>
            </nav>
            <div className={styles.drawerActions}>
              <a href="https://sourc.nl/#contact" target="_blank" rel="noopener noreferrer" className={styles.mobileCtaButton}>
                START WITH SOURCES
              </a>
              <div className={styles.mobileLanguage}>EN 🇬🇧</div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header; 
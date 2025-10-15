import styles from './Footer.module.css';
import Link from 'next/link';
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <div className={styles.logo}>
              <span className={styles.logoText}>sourc.</span>
            </div>
            
            <nav className={styles.nav}>
              <Link href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer" className={styles.navLink}>About Us</Link>
              <Link href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Services</Link>
              <Link href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Process</Link>
              <Link href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Team</Link>
            </nav>
            
            <div className={styles.contact}>
              <div className={styles.contactItem}>
                <img src="icons/phone.svg" alt="Phone" />
                <span>+31 9701281543</span>
              </div>
              <div className={styles.contactItem}>
                <img src="icons/mail.svg" alt="Email" />
                <span>info@sourc.nl</span>
              </div>
            </div>
          </div>
          
          <div className={styles.rightSection}>
            <div className={styles.newsletter}>
              <h3 className={styles.newsletterTitle}>Stay informed</h3>
              <div className={styles.newsletterForm}>
                <input 
                  type="email" 
                  placeholder="Please add your email address.." 
                  className={styles.emailInput}
                />
                <button className={styles.sendButton}>Send</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <div className={styles.copyright}>
            © Sourc. All rights reserved.
          </div>
          <div className={styles.legal}>
              <Link href="#" className={styles.legalLink}>Terms</Link>
            <Link href="#" className={styles.legalLink}>Privacy</Link>
            <Link href="#" className={styles.legalLink}>Cookies</Link>
            <div className={styles.language}>
              EN 🇬🇧
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
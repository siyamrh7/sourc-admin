import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import Head from 'next/head';
import Link from 'next/link';
import { loginUser, clearAuthError } from '../store/actions/authActions';
import styles from '../styles/Login.module.css';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await dispatch(loginUser(formData));
      
      if (result.success) {
        // Redirect to admin dashboard
        router.push('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Head>
        <title>Log in - sourc.</title>
        <meta name="description" content="Login to sourc admin dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* Header with drawer trigger (keeps current layout) */}
        <header className={styles.header}>
          <div className={styles.headerContainer}>
            <button className={styles.mobileMenuButton} onClick={() => setIsDrawerOpen(true)} aria-label="Open menu">
              <img src="/icons/menu.svg" alt="Menu" className={styles.hamburger} />
            </button>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoText}>sourc.</span>
            </Link>
            
            <nav className={styles.nav}>
              <Link href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer" className={styles.navLink}>About Us</Link>
              <Link href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Services</Link>
              <Link href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Process</Link>
              <Link href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Team</Link>
            </nav>
            
            <div className={styles.headerActions}>
              <div className={styles.userIcon}>
                <span><img src="icons/user-circle.svg" alt="User" /></span>
              </div>
              <a href="https://sourc.nl/#contact" target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
                START WITH SOURCES
              </a>
              <div className={styles.language}>
                <span>EN 🇬🇧</span>
              </div>
            </div>
          </div>
        </header>

        {/* Drawer - mobile only */}
        {isDrawerOpen && (
          <>
            <div className={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)} />
            <div className={`${styles.drawer} ${styles.drawerOpen}`} role="dialog" aria-modal="true">
              <div className={styles.drawerHeader}>
                <div className={styles.drawerTitle}>Menu</div>
                <button className={styles.drawerCloseBtn} onClick={() => setIsDrawerOpen(false)} aria-label="Close menu">×</button>
              </div>
              <nav className={styles.drawerNav}>
                <Link href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>About Us</Link>
                <Link href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Services</Link>
                <Link href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Process</Link>
                <Link href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer" className={styles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Team</Link>
                <Link href="/login" className={styles.drawerNavLink} onClick={() => setIsDrawerOpen(false)}>Admin Portal</Link>
              </nav>
              <div className={styles.drawerActions}>
                <div className={styles.userIcon}><span><img src="icons/user-circle.svg" alt="User" /></span></div>
                <a href="https://sourc.nl/#contact" target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
                  START WITH SOURCES
                </a>
                <div className={styles.language}>EN 🇬🇧</div>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
              <h1 className={styles.title}>Log in</h1>
              
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={styles.input}
                    required
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter"
                      className={styles.input}
                      required
                      disabled={isSubmitting || isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className={styles.passwordToggle}
                      disabled={isSubmitting || isLoading}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={isSubmitting || isLoading || !formData.email || !formData.password}
                >
                  {isSubmitting || isLoading ? 'Logging in...' : 'Log in'}
                </button>

                <div className={styles.forgotPassword}>
                  <Link href="#" className={styles.forgotLink}>
                    Forgot password?
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.footerContent}>
              <div className={styles.footerLeft}>
                <Link href="/" className={styles.footerLogo}>
                  <span className={styles.logoText}>sourc.</span>
                </Link>
                
                <nav className={styles.footerNav}>
                  <Link href="https://sourc.nl/#over-ons" target="_blank" rel="noopener noreferrer" className={styles.footerNavLink}>About Us</Link>
                  <Link href="https://sourc.nl/#diensten" target="_blank" rel="noopener noreferrer" className={styles.footerNavLink}>Services</Link>
                  <Link href="https://sourc.nl/#proces" target="_blank" rel="noopener noreferrer" className={styles.footerNavLink}>Process</Link>
                  <Link href="https://sourc.nl/#team" target="_blank" rel="noopener noreferrer" className={styles.footerNavLink}>Team</Link>
                </nav>
                
                <div className={styles.contact}>
                  <div className={styles.contactItem}>
                    <img src="icons/phone.svg" alt="Phone" />
                    <span>+31 9701281543</span>
                  </div>
                  <div className={styles.contactItem}>
                    <img src="icons/mail.svg" alt="Email" />
                    <span>contact@sourc.nl</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.footerRight}>
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
            
            <div className={styles.footerBottom}>
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
      </div>
    </>
  );
}
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/ResetPassword.module.css';

const ResetPassword = () => {
  const router = useRouter();
  const { token } = router.query;
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setMessage({ type: 'error', text: 'Invalid reset link. Please request a new password reset.' });
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setMessage({ type: 'error', text: 'Invalid reset token' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(`/api/customer-auth/reset-password/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: formData.password })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Password reset failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password - Sourc</title>
        <meta name="description" content="Reset your password" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>sourc.</div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.resetContainer}>
            <div className={styles.resetCard}>
              <h1 className={styles.title}>Reset Your Password</h1>
              <p className={styles.subtitle}>
                Please enter your new password below.
              </p>

              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              {isTokenValid ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>
                      New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your new password"
                      className={styles.input}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.label}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your new password"
                      className={styles.input}
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading || !formData.password || !formData.confirmPassword}
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              ) : (
                <div className={styles.invalidToken}>
                  <p>This reset link is invalid or has expired.</p>
                  <button 
                    className={styles.backButton}
                    onClick={() => router.push('/login')}
                  >
                    Back to Login
                  </button>
                </div>
              )}

              <div className={styles.footer}>
                <p>
                  Remember your password?{' '}
                  <span 
                    className={styles.link}
                    onClick={() => router.push('/login')}
                  >
                    Sign in here
                  </span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ResetPassword; 
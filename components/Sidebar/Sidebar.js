import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.navigation}>
        <div className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.icon}>📊</span>
          <span>Order Dashboard</span>
        </div>
        <div className={styles.navItem}>
          <span className={styles.icon}>⚙️</span>
          <span>Profile & Settings</span>
        </div>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.logoutItem}>
          <span className={styles.icon}>🚪</span>
          <span>Log out</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 
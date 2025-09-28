import styles from './AdminSidebar.module.css';

const AdminSidebar = ({ currentView, onViewChange }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: '📊',
      view: 'dashboard'
    },
    {
      id: 'createOrder',
      label: 'Create New Order',
      icon: '➕',
      view: 'createOrder'
    },
    {
      id: 'manageOrders',
      label: 'Manage Orders',
      icon: '📦',
      view: 'manageOrders'
    },
    {
      id: 'manageCustomers',
      label: 'Manage Customers',
      icon: '👥',
      view: 'manageCustomers'
    },
    {
      id: 'createCustomer',
      label: 'Create Customer',
      icon: '👤',
      view: 'createCustomer'
    }
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.navigation}>
        <div className={styles.sectionTitle}>Order Management</div>
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.navItem} ${currentView === item.view ? styles.active : ''}`}
            onClick={() => onViewChange(item.view)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className={styles.footer}>
        <div className={styles.adminInfo}>
          <div className={styles.adminCard}>
            <div className={styles.adminIcon}>👨‍💼</div>
            <div className={styles.adminDetails}>
              <div className={styles.adminName}>Admin User</div>
              <div className={styles.adminRole}>System Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar; 
import styles from './AdminLayout.module.css';
import AdminHeader from '../AdminHeader/AdminHeader';
import AdminSidebar from '../AdminSidebar/AdminSidebar';

const AdminLayout = ({ children, currentView, onViewChange }) => {
  return (
    <div className={styles.layout}>
      <AdminHeader />
      <div className={styles.container}>
        <AdminSidebar currentView={currentView} onViewChange={onViewChange} />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 
/*
import styles from './Dashboard.module.css';
import StatsCard from '../StatsCard/StatsCard';
import OrderTable from '../OrderTable/OrderTable';

const Dashboard = ({ onViewOrderDetails }) => {
  const statsData = [
    {
      title: 'Total Orders',
      value: '5',
      icon: '📦',
      iconColor: 'brown'
    },
    {
      title: 'Delivered',
      value: '1',
      icon: '✅',
      iconColor: 'green'
    },
    {
      title: 'In Progress',
      value: '3',
      icon: '🕒',
      iconColor: 'blue'
    },
    {
      title: 'Delayed',
      value: '1',
      icon: '⚠️',
      iconColor: 'red'
    }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>ZUNGO Pest Control B.V.'s dashboard</h1>
        <p className={styles.subtitle}>Overview of all your orders and their current status</p>
      </div>
      
      <div className={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>
      
      <div className={styles.tableSection}>
        <OrderTable onViewOrderDetails={onViewOrderDetails} />
      </div>
    </div>
  );
};

export default Dashboard;
*/
import styles from './AdminStatsCard.module.css';

const AdminStatsCard = ({ title, value, icon, color, trend, trendDirection }) => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <span className={styles.title}>{title}</span>
            {trend && (
              <div className={`${styles.trend} ${styles[trendDirection]}`}>
                <span className={styles.trendIcon}>
                  {trendDirection === 'up' ? '↗️' : '↘️'}
                </span>
                {trend}
              </div>
            )}
          </div>
          <div className={`${styles.iconContainer} ${styles[color]}`}>
            <span className={styles.icon}>{icon}</span>
          </div>
        </div>
        <div className={styles.value}>{value}</div>
      </div>
      <div className={`${styles.accent} ${styles[color]}`}></div>
    </div>
  );
};

export default AdminStatsCard;
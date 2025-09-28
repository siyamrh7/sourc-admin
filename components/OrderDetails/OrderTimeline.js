import styles from './OrderTimeline.module.css';

const OrderTimeline = ({ timelineData }) => {
  return (
    <div className={styles.timeline}>
      {timelineData.map((item, index) => (
        <div key={item.id} className={styles.timelineItem}>
          {/* Icon */}
          <div className={`${styles.timelineIcon} ${
            item.isCompleted ? styles.completed : 
            item.isInProgress ? styles.inProgress : 
            styles.locked
          }`}>
            {item.isCompleted ? (
              <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : item.isInProgress ? (
              <svg className={styles.clockIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className={styles.lockIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Connecting line */}
          {index < timelineData.length - 1 && (
            <div className={`${styles.connector} ${
              item.isCompleted ? styles.connectorCompleted : styles.connectorIncomplete
            }`} />
          )}

          {/* Content */}
          <div className={styles.timelineContent}>
            <div className={styles.timelineHeader}>
              <h3 className={styles.timelineTitle}>{item.title}</h3>
              <span className={`${styles.statusBadge} ${
                item.isCompleted ? styles.completedBadge : 
                item.isInProgress ? styles.inProgressBadge : 
                styles.lockedBadge
              }`}>
                {item.status}
              </span>
            </div>
            
            <p className={styles.timelineDescription}>{item.description}</p>
            
            <div className={styles.timelineDetails}>
              {item.estimatedDuration && (
                <div className={styles.timelineDetail}>
                  <span className={styles.detailLabel}>Estimated Duration:</span> {item.estimatedDuration}
                </div>
              )}
              {item.startDate && (
                <div className={styles.timelineDetail}>
                  <span className={styles.detailLabel}>Start Date:</span> {item.startDate}
                </div>
              )}
              {item.finishDate && (
                <div className={styles.timelineDetail}>
                  <span className={styles.detailLabel}>Finish Date:</span> {item.finishDate}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline; 
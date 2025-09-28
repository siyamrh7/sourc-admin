import styles from './OrderInfoCards.module.css';

const OrderInfoCards = ({ orderData }) => {
  return (
    <div className={styles.infoCardsGrid}>
      <div className={styles.infoCard}>
        <h3 className={styles.cardTitle}>Order Details</h3>
        <div className={styles.cardContent}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Order ID:</span>
            <span className={styles.value}>{orderData.id}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Product:</span>
            <span className={styles.value}>{orderData.product}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Quantity:</span>
            <span className={styles.value}>{orderData.quantity}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Order Value:</span>
            <span className={styles.value}>{orderData.value}</span>
          </div>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h3 className={styles.cardTitle}>Estimated Arrival:</h3>
        <div className={styles.cardContent}>
          <div className={styles.arrivalDate}>{orderData.estimatedArrival}</div>
          <div className={styles.arrivalNote}>
            Your order is progressing as scheduled
          </div>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h3 className={styles.cardTitle}>Shipping Info</h3>
        <div className={styles.cardContent}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Method:</span>
            <span className={styles.value}>{orderData.shippingMethod}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Destination:</span>
            <span className={styles.value}>{orderData.destination}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Carrier:</span>
            <span className={styles.value}>{orderData.carrier}</span>
          </div>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h3 className={styles.cardTitle}>Support</h3>
        <div className={styles.cardContent}>
          <button className={styles.contactButton}>
            Contact Email
            <span className={styles.emailIcon}>✉️</span>
          </button>
          <div className={styles.supportNote}>
            Need help? Our team is available 24/7 to assist you with your order.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoCards; 
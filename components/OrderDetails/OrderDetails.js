import { useState } from 'react';
import styles from './OrderDetails.module.css';
import OrderInfoCards from './OrderInfoCards';
import OrderTimeline from './OrderTimeline';

const OrderDetails = ({ orderData = null, onBack }) => {
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get default carrier based on shipping method
  const getDefaultCarrier = (shippingMethod) => {
    switch (shippingMethod) {
      case 'Sea Freight':
        return 'COSCO';
      case 'Air Freight':
        return 'DHL Express';
      case 'Road Transport':
        return 'European Transport';
      case 'Express Delivery':
        return 'FedEx';
      default:
        return 'COSCO';
    }
  };

  // Helper function to generate estimated arrival date
  const getEstimatedArrival = () => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    return futureDate.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Transform real order data into expected format with fallbacks
  const products = orderData?.products || (orderData?.product ? [orderData.product] : []);
  const productCount = products.length;
  const productNames = products.map(p => p.name).filter(Boolean);
  const totalQuantity = products.reduce((sum, p) => {
    const qty = parseInt(p.quantity) || 0;
    return sum + qty;
  }, 0);
  
  const transformedOrderData = {
    id: orderData?.orderId || orderData?._id || 'ORD-2024-001',
    customer: orderData?.customer || {},
    products: products,
    product: productCount > 1 ? 
      `${productCount} Products: ${productNames.slice(0, 2).join(', ')}${productNames.length > 2 ? '...' : ''}` : 
      (productNames[0] || 'Custom Injection Parts'),
    quantity: productCount > 1 ? `${totalQuantity.toLocaleString()} units total` : (products[0]?.quantity || '5,000 units'),
    value: orderData?.totalValue ? `€${orderData.totalValue.toLocaleString()}` : (products[0]?.value || '€25,000'),
    estimatedArrival: orderData?.shipping?.estimatedArrival || getEstimatedArrival(),
    shippingMethod: orderData?.shipping?.method || 'Sea Freight',
    destination: orderData?.shipping?.destination || 'Rotterdam, NL',
    carrier: orderData?.shipping?.carrier || getDefaultCarrier(orderData?.shipping?.method || 'Sea Freight')
  };

  // Default timeline data (preserving current static data)
  const defaultTimelineData = [
    {
      id: 1,
      title: 'Offer Accepted',
      description: 'Customer has approved the offer; order has been initiated.',
      estimatedDuration: '1 day',
      startDate: '6/20/2024',
      finishDate: '6/21/2024',
      status: 'Completed',
      icon: '✓',
      isCompleted: true,
      isInProgress: false,
      isLocked: false
    },
    {
      id: 2,
      title: 'Mold / Product in Development',
      description: 'Product or mold is being created.',
      estimatedDuration: '14 days',
      startDate: '6/21/2024',
      finishDate: '7/5/2024',
      status: 'Completed',
      icon: '✓',
      isCompleted: true,
      isInProgress: false,
      isLocked: false
    },
    {
      id: 3,
      title: 'Sample Sent to Client',
      description: 'Customer receives a sample. Approval required.',
      estimatedDuration: '3 days',
      startDate: '7/5/2024',
      finishDate: '7/8/2024',
      status: 'Completed',
      icon: '✓',
      isCompleted: true,
      isInProgress: false,
      isLocked: false
    },
    {
      id: 4,
      title: 'Sample Approved',
      description: 'Customer has approved the sample. Mass production begins.',
      estimatedDuration: '2 days',
      startDate: '7/8/2024',
      finishDate: '',
      status: 'In Progress',
      icon: '🕒',
      isCompleted: false,
      isInProgress: true,
      isLocked: false
    },
    {
      id: 5,
      title: 'Production Phase',
      description: 'Final product is being manufactured.',
      estimatedDuration: '',
      startDate: '',
      finishDate: '',
      status: 'Locked',
      icon: '🔒',
      isCompleted: false,
      isInProgress: false,
      isLocked: true
    },
    {
      id: 6,
      title: 'Transport Phase',
      description: 'Order has shipped. In transit to the destination country.',
      estimatedDuration: '',
      startDate: '',
      finishDate: '',
      status: 'Locked',
      icon: '🔒',
      isCompleted: false,
      isInProgress: false,
      isLocked: true
    },
    {
      id: 7,
      title: 'Delivered to Final Location',
      description: 'Order has been delivered to the specified location.',
      estimatedDuration: '',
      startDate: '',
      finishDate: '',
      status: 'Locked',
      icon: '🔒',
      isCompleted: false,
      isInProgress: false,
      isLocked: true
    }
  ];

  // Transform real timeline data or use defaults
  const transformedTimelineData = (() => {
    // Check if real timeline data exists and is valid
    if (orderData?.timeline && Array.isArray(orderData.timeline) && orderData.timeline.length > 0) {
      // Always derive visual state from progress to avoid mismatches
      const currentProgress = orderData?.progress?.current || 1;
      return orderData.timeline.slice(0, 7).map((step, index) => {
        const stepPosition = index + 1;
        const isCompleted = stepPosition < currentProgress;
        const isInProgress = stepPosition === currentProgress;
        const isLocked = stepPosition > currentProgress;

        const status = isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Locked';
        const icon = isCompleted ? '✓' : isInProgress ? '🕒' : '🔒';

        return {
          id: step.id || (index + 1),
          title: step.title || defaultTimelineData[index]?.title || `Step ${index + 1}`,
          description: step.description || defaultTimelineData[index]?.description || 'Order processing step.',
          estimatedDuration: step.estimatedDuration || defaultTimelineData[index]?.estimatedDuration || '',
          startDate: step.startDate ? formatDate(step.startDate) : (defaultTimelineData[index]?.startDate || ''),
          finishDate: step.finishDate ? formatDate(step.finishDate) : (defaultTimelineData[index]?.finishDate || ''),
          status,
          icon,
          isCompleted,
          isInProgress,
          isLocked
        };
      });
    } else {
      // Use default timeline data with dynamic progress based on order status or phase
      let currentPhaseIndex = 1; // Default to phase 1 (Offer Accepted)
      
      // Try to determine current phase from various order properties
      if (orderData?.progress?.current) {
        currentPhaseIndex = orderData.progress.current;
      } else if (orderData?.timeline?.currentPhaseIndex) {
        currentPhaseIndex = orderData.timeline.currentPhaseIndex;
      } else if (orderData?.status) {
        // Map order status to timeline phase
        switch (orderData.status.toLowerCase()) {
          case 'development':
            currentPhaseIndex = 2;
            break;
          case 'in progress':
            currentPhaseIndex = 4;
            break;
          case 'production':
            currentPhaseIndex = 5;
            break;
          case 'shipped':
            currentPhaseIndex = 6;
            break;
          case 'delivered':
            currentPhaseIndex = 7;
            break;
          default:
            currentPhaseIndex = 1;
        }
      }
      
      return defaultTimelineData.map((step, index) => {
        const stepIndex = index + 1;
        if (stepIndex < currentPhaseIndex) {
          return { ...step, isCompleted: true, isInProgress: false, isLocked: false, status: 'Completed', icon: '✓' };
        } else if (stepIndex === currentPhaseIndex) {
          return { ...step, isCompleted: false, isInProgress: true, isLocked: false, status: 'In Progress', icon: '🕒' };
        } else {
          return { ...step, isCompleted: false, isInProgress: false, isLocked: true, status: 'Locked', icon: '🔒' };
        }
      });
    }
  })();

  // Compute current step index and total for display
  const currentStep = (() => {
    if (orderData?.progress?.current) return Math.min(Math.max(orderData.progress.current, 1), 7);
    const activeIndex = transformedTimelineData.findIndex(step => step.isInProgress);
    return activeIndex !== -1 ? activeIndex + 1 : 1;
  })();
  const totalSteps = 7;

  return (
    <div className={styles.orderDetails}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <span className={styles.backIcon}>←</span>
          Back
        </button>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Order {transformedOrderData.id}</h1>
          <p className={styles.subtitle}>
            Track the progress of your custom order from approval to delivery
          </p>
        </div>
      </div>

      <OrderInfoCards orderData={transformedOrderData} />
      
      <div className={styles.timelineSection}>
        <div className={styles.timelineHeaderRow}>
          <h2 className={styles.timelineTitle}>Order Progress Timeline</h2>
          <span className={styles.stepBadge}>Step {currentStep} of {totalSteps}</span>
        </div>
        <OrderTimeline timelineData={transformedTimelineData} />
      </div>
    </div>
  );
};

export default OrderDetails; 
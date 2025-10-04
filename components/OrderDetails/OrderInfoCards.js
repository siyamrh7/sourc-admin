import styles from './OrderInfoCards.module.css';

// Generate a PDF invoice for the provided order data
const generateInvoicePdf = async (orderData) => {
  try {
    const [{ jsPDF }, autoTable] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const pageMargin = 40;
    const lineHeight = 16;
    let cursorY = pageMargin;

    const writeText = (text, x, y, options = {}) => {
      doc.text(String(text ?? ''), x, y, options);
    };

    // Header
    doc.setFontSize(18);
    writeText('Invoice', pageMargin, cursorY);
    doc.setFontSize(10);
    writeText(`Invoice ID: ${orderData.id || ''}`, pageMargin, (cursorY += lineHeight));
    writeText(`Date: ${new Date().toLocaleDateString()}`, pageMargin, (cursorY += lineHeight));

    // All sections aligned at same height with compact layout
    const sectionY = cursorY + 20;
    
    // From section (left) - compact
    doc.setFontSize(12);
    writeText('From:', pageMargin, sectionY);
    doc.setFontSize(10);
    writeText('Sourc B.V.', pageMargin, sectionY + 20);
    writeText('Logistics & Manufacturing', pageMargin, sectionY + 40);
    writeText('support@sourc.com', pageMargin, sectionY + 60);

    // Bill To section (middle) - moved left
    const billToX = 200;
    doc.setFontSize(12);
    writeText('Bill To:', billToX, sectionY);
    doc.setFontSize(10);
    
    // Customer details (if available) - limit to 3 lines max
    const customer = orderData.customer || {};
    let billToY = sectionY + 20;
    
    if (customer.name) {
      writeText(customer.name, billToX, billToY);
      billToY += 20;
    }
    if (customer.email) {
      writeText(`Email: ${customer.email}`, billToX, billToY);
      billToY += 20;
    }
    if (customer.phone) {
      writeText(`Phone: ${customer.phone}`, billToX, billToY);
      billToY += 20;
    }
    
    // Company details (if available) - limit to 2 lines max
    const company = customer.company || {};
    if (company.name) {
      writeText(`Company: ${company.name}`, billToX, billToY);
      billToY += 20;
    }
    if (company.website) {
      writeText(`Website: ${company.website}`, billToX, billToY);
      billToY += 20;
    }
    
    // Ship To section (right side) - moved left
    const shipToX = 380;
    doc.setFontSize(12);
    writeText('Ship To:', shipToX, sectionY);
    doc.setFontSize(10);
    
    let shipToY = sectionY + 20;
    writeText(orderData.destination || 'N/A', shipToX, shipToY);
    shipToY += 20;
    // writeText(`Method: ${orderData.shippingMethod || 'N/A'}`, shipToX, shipToY);
    // shipToY += 20;
    writeText(`Carrier: ${orderData.carrier || 'N/A'}`, shipToX, shipToY);
    shipToY += 20;
    writeText(`ETA: ${orderData.estimatedArrival || 'N/A'}`, shipToX, shipToY);

    // Calculate the maximum Y position used and set cursorY accordingly
    const maxY = Math.max(billToY, shipToY) + 20; // Add some padding
    cursorY = maxY;

    // Products table
    const products = Array.isArray(orderData.products) && orderData.products.length > 0
      ? orderData.products
      : [{ name: orderData.product || 'Product', description: '', quantity: orderData.quantity || '', value: orderData.value || '' }];

    const bodyRows = products.map((p, idx) => {
      const quantity = typeof p.quantity === 'number' ? p.quantity : parseInt(String(p.quantity || '0').replace(/[^0-9]/g, '')) || 0;
      const valueNum = typeof p.value === 'number' ? p.value : parseFloat(String(p.value || '0').replace(/[^0-9.\-]/g, '')) || 0;
      const unitPrice = quantity > 0 ? valueNum / quantity : valueNum;
      return [
        idx + 1,
        p.name || '-',
        p.description || '-',
        quantity.toLocaleString(),
        `€${unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `€${valueNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ];
    });

    autoTable.default(doc, {
      startY: cursorY,
      head: [["#", "Product", "Description", "Qty", "Unit Price", "Amount"]],
      body: bodyRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [3, 105, 161] },
      theme: 'striped',
      margin: { left: pageMargin, right: pageMargin }
    });

    const finalY = doc.lastAutoTable.finalY || cursorY + 24;

    // Totals
    const totalValue = products.reduce((sum, p) => {
      const valueNum = typeof p.value === 'number' ? p.value : parseFloat(String(p.value || '0').replace(/[^0-9.\-]/g, '')) || 0;
      return sum + valueNum;
    }, 0);

    const totalsX = 360;
    let totalsY = finalY + 20;
    doc.setFontSize(10);
    writeText('Subtotal:', totalsX, (totalsY += lineHeight));
    writeText(`€${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, totalsX + 120, totalsY, { align: 'right' });
    writeText('Tax (0%):', totalsX, (totalsY += lineHeight));
    writeText('€0.00', totalsX + 120, totalsY, { align: 'right' });
    doc.setFontSize(12);
    writeText('Total:', totalsX, (totalsY += lineHeight));
    writeText(`€${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, totalsX + 120, totalsY, { align: 'right' });

    // Footer note
    doc.setFontSize(9);
    writeText('Thank you for your business!', pageMargin, totalsY + 40);
    writeText('For support, contact support@sourc.com', pageMargin, totalsY + 56);

    // Save
    const fileName = `Invoice_${orderData.id || 'order'}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error('Failed to generate invoice PDF', err);
    alert('Failed to generate invoice. Please try again.');
  }
};

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
          <button
            className={styles.invoiceButton}
            onClick={() => generateInvoicePdf(orderData)}
            title="Download invoice PDF"
          >
            Download Invoice
            <span className={styles.emailIcon}>⬇️</span>
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
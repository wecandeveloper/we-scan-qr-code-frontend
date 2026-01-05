import jsPDF from "jspdf";

const handleExportSingleOrderPDF = async (order, restaurant) => {
  if (!order || !restaurant) return;

  // --- Settings ---
  const lineHeight = 5;
  const baseMargin = 10;
  let totalLines = 0;

  // --- Simulate render - count lines ---
  totalLines += 1; // Logo space
  totalLines += 1; // Restaurant Name
  totalLines += 1; // Address
  totalLines += 1; // Order Type
  totalLines += 1; // Separator

  totalLines += 1; // Order date + time
  totalLines += 1; // Order No
  totalLines += 1; // Waiter
  totalLines += 1; // Separator

  if (order?.orderType === "Dine-In") {
    totalLines += 1; // Table No
  } else {
    if (order?.deliveryAddress?.name) totalLines += 1;
    if (order?.deliveryAddress?.phone?.number) totalLines += 1;
    if (order?.orderType === "Home-Delivery") totalLines += 1;
    if (
      order?.orderType === "Take-Away" && 
      order?.deliveryAddress?.vehicleNo
    ) totalLines += 1;
  }
  totalLines += 1; // Separator

  totalLines += 1; // Items Header
  totalLines += 1; // Items header separator
  totalLines += order?.lineItems?.length > 0 ? order.lineItems.length : 1;
  totalLines += 1; // Thin line separator
  totalLines += 1; // Total row
  totalLines += 1; // After items separator

  totalLines += 1; // Thank you
  totalLines += 1; // Generated date

  // --- Calculate required height ---
  const logoHeight = restaurant?.theme?.logo?.url ? 17 : 0; // Reduce extra space for logo
  const contentHeight = baseMargin + totalLines * lineHeight + logoHeight + 10;
  const doc = new jsPDF({ unit: "mm", format: [80, contentHeight] });
  const width = doc.internal.pageSize.getWidth();
  let y = baseMargin;

  // --- Actual Render ---

  // --- Restaurant Logo ---
  if (restaurant?.theme?.logo?.url) {
    try {
      // Add logo at the top center
      const logoWidth = 40; // Adjust as needed
      const logoHeight = 20; // Adjust as needed
      const logoX = (width - logoWidth) / 2;
      
      // Add logo image - try different formats
      const logoFormat = restaurant.theme?.logo?.url.includes('data:image/') ? 
        restaurant.theme?.logo?.url.split(';')[0].split('/')[1].toUpperCase() : 'PNG';
      
      doc.addImage(restaurant.theme?.logo?.url, logoFormat, logoX, y, logoWidth, logoHeight);
      y += logoHeight + 2; // Reduce space after logo
    } catch (error) {
      console.warn('Could not load restaurant logo:', error);
      // Continue without logo if there's an error
    }
  }

  // --- Restaurant Header ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(restaurant?.name || "Restaurant Name", width / 2, y, { align: "center" });
  y += lineHeight;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const address = restaurant?.address
    ? `${restaurant.address.street || ""}, ${restaurant.address.area || ""}, ${restaurant.address.city || ""}`
    : "";
  doc.text(address, width / 2, y, { align: "center" });
  y += lineHeight;

  const orderTypeText = order?.orderType || "Take-Away";
  doc.text(orderTypeText, width / 2, y, { align: "center" });
  y += lineHeight;

  doc.line(5, y, width - 5, y);
  y += lineHeight;

  // --- Order Info ---
  const orderDate = order?.createdAt ? new Date(order.createdAt) : new Date();
  doc.text(orderDate.toLocaleDateString(), 5, y);
  doc.text(orderDate.toLocaleTimeString(), width - 5, y, { align: "right" });
  y += lineHeight;

  doc.text(`Order No: ${order?.orderNo || "N/A"}`, 5, y);
  y += lineHeight;

  const waiterName = order?.waiter?.name || "N/A";
  doc.text(`Waiter: ${waiterName}`, 5, y);
  y += lineHeight;

  doc.line(5, y, width - 5, y);
  y += lineHeight;

  // --- Customer / Table Info ---
  if (orderTypeText === "Dine-In") {
    doc.text(`Table No: ${order?.tableId?.tableNumber || "N/A"}`, 5, y);
    y += lineHeight;
  } else {
    const customer = order?.deliveryAddress || {};
    if (customer.name) {
      doc.text(`Customer: ${customer.name}`, 5, y);
      y += lineHeight;
    }
    if (customer.phone?.number) {
      doc.text(`Phone: ${customer.phone.countryCode || ""} ${customer.phone.number}`, 5, y);
      y += lineHeight;
    }
    if (orderTypeText === "Home-Delivery") {
      doc.text(
        `Address: ${customer.addressNo || ""}, ${customer.street || ""}, ${customer.city || ""}, ${customer.state || ""}, ${customer.pincode || ""}`,
        5,
        y
      );
      y += lineHeight;
    }
    if (orderTypeText === "Take-Away" && customer.vehicleNo) {
      doc.text(`Vehicle No: ${customer.vehicleNo}`, 5, y);
      y += lineHeight;
    }
  }

  doc.line(5, y, width - 5, y);
  y += lineHeight;

  // --- Items Header ---
  doc.setFont("helvetica", "bold");
  doc.text("Qty", 5, y);
  doc.text("Item Name", 20, y);
  doc.text("Amount", 60, y);
  y += lineHeight;

  doc.setFont("helvetica", "normal");
  doc.line(5, y, width - 5, y);
  y += lineHeight;

  // --- Items ---
  let totalAmount = 0;
  if (order?.lineItems?.length > 0) {
    order.lineItems.forEach((item) => {
      const quantity = item.quantity || 0;
      const price = item.productId?.price || 0;
      const itemAmount = quantity * price;
      totalAmount += itemAmount;
      
      doc.text(quantity.toString(), 5, y);
      doc.text(item.productId?.name || "", 20, y);
      doc.text(`AED ${itemAmount.toFixed(2)}`, 60, y);
      y += lineHeight;
    });
    
    // Add thin line separator before total
    doc.setLineWidth(0.2);
    doc.line(5, y, width - 5, y);
    y += lineHeight;
    
    // Add total row
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 20, y);
    doc.text(`AED ${totalAmount.toFixed(2)}`, 60, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
  } else {
    doc.text("No items found", 5, y);
    y += lineHeight;
  }

  doc.line(5, y, width - 5, y);
  y += lineHeight;

  // --- Footer ---
//   doc.setFont("helvetica", "bold");
//   doc.text("Thank you for your order!", width / 2, y, { align: "center" });
//   y += lineHeight;

  // Add generated date at the bottom
  const generatedDate = new Date();
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated On: ${generatedDate.toLocaleDateString()} ${generatedDate.toLocaleTimeString()}`,
    5,
    y
  );

  // Save PDF
  doc.save(`Order_${order?.orderNo || "N/A"}.pdf`);
};

export default handleExportSingleOrderPDF;
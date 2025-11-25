import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Format date helpers
const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleExportRestaurantOrderPDF = (
  orders,
  restaurantName = "Restaurant",
  selectedOrderType = "All",
  reportType = "Daily",
  startDate = null,
  endDate = null
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ====== HEADING BAR (Main + Restaurant) ======
  doc.setFillColor(230, 230, 230); // light gray background
  doc.rect(0, 0, pageWidth, 25, "F"); // full-width rectangle

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Orders Report", pageWidth / 2, 12, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(restaurantName, pageWidth / 2, 20, { align: "center" });

  // ====== REPORT DETAILS (below heading) ======
  let y = 35;
  doc.setFontSize(11);

  const orderTypeLabel = selectedOrderType === "All" ? "All Orders" : selectedOrderType;

  // Left side info
  doc.text(`Order Type: ${orderTypeLabel}`, 14, y);
  y += 6;
  doc.text(`Report Type: ${reportType}`, 14, y);

  // Right side info - From / To dates
  let rightY = 35;
  doc.text(`Report Date Range:`, pageWidth - 14, rightY, { align: "right" });
  rightY += 6;
  doc.text(`From: ${formatDate(startDate)}`, pageWidth - 14, rightY, { align: "right" });
  rightY += 6;
  doc.text(`To: ${formatDate(endDate)}`, pageWidth - 14, rightY, { align: "right" });

  // ====== TABLE ======
  // Dynamic column header based on order type
  let columnHeader = "Table / Address / Customer"; // Default for All orders
  
  if (selectedOrderType === "Dine-In") {
    columnHeader = "Table Number";
  } else if (selectedOrderType === "Home-Delivery") {
    columnHeader = "Customer Address";
  } else if (selectedOrderType === "Take-Away") {
    columnHeader = "Customer Details";
  }
  
  const columns = [
    "Order No",
    columnHeader,
    "No. of LineItems",
    "Total Amount",
    "Order Status",
  ];

  const rows = orders.map((order) => {
    let details = "";
    if (order.orderType === "Dine-In") {
      details = `Table: ${order.tableId?.tableNumber || ""}`;
    } else if (order.orderType === "Home-Delivery") {
      details =
        `Name: ${order.deliveryAddress?.name || ""}\n` +
        `Phone: ${order.deliveryAddress?.phone?.countryCode || ""} ${order.deliveryAddress?.phone?.number || ""}\n` +
        `Address: ${order.deliveryAddress?.addressNo || ""}, ${order.deliveryAddress?.street || ""}, ${order.deliveryAddress?.city || ""}, ${order.deliveryAddress?.state || ""}, ${order.deliveryAddress?.pincode || ""}`;
    } else if (order.orderType === "Take-Away") {
      details =
        `Name: ${order.deliveryAddress?.name || ""}\n` +
        `Phone: ${order.deliveryAddress?.phone?.countryCode || ""} ${order.deliveryAddress?.phone?.number || ""}` +
        (order.deliveryAddress?.vehicleNo ? `\nVehicle No: ${order.deliveryAddress.vehicleNo}` : "");
    }

    // Show order date for weekly, monthly, custom
    const orderDate =
      reportType === "Weekly" || reportType === "Monthly" || reportType === "Custom"
        ? `\nDate: ${formatDateTime(order.createdAt)}`
        : "";

    return [
      order.orderNo,
      details + orderDate,
      order.lineItems.length,
      order.totalAmount,
      order.status,
    ];
  });

  autoTable(doc, {
    startY: 60,
    head: [columns],
    body: rows,
    headStyles: {
      fillColor: [0, 0, 0], // black header
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      1: { cellWidth: 70 },
    },
  });

  // ====== FOOTER ======
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);

    // Generated On (bottom left)
    doc.setFontSize(9);
    doc.text(`Generated On: ${formatDateTime(new Date())}`, 12, pageHeight - 8);

    // Page number (bottom right)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 12, pageHeight - 8, { align: "right" });
  }

  // Save PDF
  doc.save(`${restaurantName}_Orders_Report.pdf`);
};

export default handleExportRestaurantOrderPDF;
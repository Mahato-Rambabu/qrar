import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates a PDF bill for an order
 * @param {Object} order - The order object to generate a bill for
 * @returns {void} - Triggers the download of the PDF
 */
export const generateOrderBill = (order) => {
  // Ensure all properties have default values to prevent errors
  const safeOrder = {
    orderNo: order.orderNo || "N/A",
    customerName: order.customerName || "Guest",
    items: order.items || [],
    status: order.status || "Pending",
    paymentMethod: order.paymentMethod || "Unpaid",
    paymentStatus: order.paymentStatus || "Unpaid",
    modeOfOrder: order.modeOfOrder || "Dine-in",
    tableNumber: order.tableNumber || "N/A",
    itemsTotal: order.itemsTotal || 0,
    discount: order.discount || 0,
    gst: order.gst || 0,
    serviceCharge: order.serviceCharge || 0,
    packingCharge: order.packingCharge || 0,
    deliveryCharge: order.deliveryCharge || 0,
    finalTotal: order.finalTotal || 0,
    orderNotes: order.orderNotes || "None",
    createdAt: order.createdAt || new Date()
  };

  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add restaurant logo/name at the top
  doc.setFontSize(20);
  doc.text("Restaurant Name", 105, 15, { align: "center" });
  
  // Add address and contact info
  doc.setFontSize(10);
  doc.text("123 Restaurant Street, City, Country", 105, 25, { align: "center" });
  doc.text("Phone: +1234567890 | Email: info@restaurant.com", 105, 30, { align: "center" });
  
  // Add a line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Add order details
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("BILL", 105, 45, { align: "center" });
  
  // Order information
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Order No: ${safeOrder.orderNo}`, 20, 55);
  doc.text(`Date: ${new Date(safeOrder.createdAt).toLocaleString()}`, 20, 60);
  doc.text(`Customer: ${safeOrder.customerName}`, 20, 65);
  doc.text(`Mode: ${safeOrder.modeOfOrder}`, 20, 70);
  if (safeOrder.tableNumber) {
    doc.text(`Table: ${safeOrder.tableNumber}`, 20, 75);
  }
  
  // Add a line
  doc.line(20, 80, 190, 80);
  
  // Table header
  doc.setFont(undefined, "bold");
  doc.text("Item", 20, 90);
  doc.text("Qty", 80, 90);
  doc.text("Price", 110, 90);
  doc.text("Total", 150, 90);
  
  // Add a line
  doc.line(20, 95, 190, 95);
  
  // Table content
  doc.setFont(undefined, "normal");
  let yPos = 105;
  
  // Prepare table data
  const tableData = safeOrder.items.map(item => {
    const safeItem = {
      productId: item.productId || {},
      quantity: item.quantity || 0,
      taxRate: item.taxRate || 0
    };
    
    const itemPrice = safeItem.productId.price || 0;
    const itemTotal = itemPrice * safeItem.quantity;
    
    return [
      safeItem.productId.name || "Unknown",
      safeItem.quantity.toString(),
      `₹${itemPrice.toFixed(2)}`,
      `₹${itemTotal.toFixed(2)}`
    ];
  });
  
  // Add table using autoTable with adjusted column widths
  autoTable(doc, {
    startY: 100,
    head: [["Item", "Qty", "Price", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 60 }, // Reduced from 70
      1: { cellWidth: 15, halign: "center" }, // Reduced from 20
      2: { cellWidth: 25, halign: "right" }, // Reduced from 30
      3: { cellWidth: 25, halign: "right" } // Reduced from 30
    },
    margin: { left: 20, right: 20 },
    // Add these options to ensure table fits within page width
    tableWidth: 'auto',
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 15, halign: "center" },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 25, halign: "right" }
    }
  });
  
  // Get the final Y position after the table
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Add a line
  doc.line(20, finalY, 190, finalY);
  
  // Add financial summary
  doc.setFont(undefined, "normal");
  doc.text("Subtotal:", 150, finalY + 10);
  doc.text(`₹${safeOrder.itemsTotal.toFixed(2)}`, 190, finalY + 10, { align: "right" });
  
  if (safeOrder.discount > 0) {
    doc.text("Discount:", 150, finalY + 20);
    doc.text(`-₹${safeOrder.discount.toFixed(2)}`, 190, finalY + 20, { align: "right" });
  }
  
  if (safeOrder.gst > 0) {
    doc.text("GST:", 150, finalY + 30);
    doc.text(`₹${safeOrder.gst.toFixed(2)}`, 190, finalY + 30, { align: "right" });
  }
  
  if (safeOrder.serviceCharge > 0) {
    doc.text("Service Charge:", 150, finalY + 40);
    doc.text(`₹${safeOrder.serviceCharge.toFixed(2)}`, 190, finalY + 40, { align: "right" });
  }
  
  if (safeOrder.packingCharge > 0) {
    doc.text("Packing Charge:", 150, finalY + 50);
    doc.text(`₹${safeOrder.packingCharge.toFixed(2)}`, 190, finalY + 50, { align: "right" });
  }
  
  if (safeOrder.deliveryCharge > 0) {
    doc.text("Delivery Charge:", 150, finalY + 60);
    doc.text(`₹${safeOrder.deliveryCharge.toFixed(2)}`, 190, finalY + 60, { align: "right" });
  }
  
  // Add a line
  doc.line(20, finalY + 70, 190, finalY + 70);
  
  // Add total
  doc.setFont(undefined, "bold");
  doc.text("Total:", 150, finalY + 80);
  doc.text(`₹${safeOrder.finalTotal.toFixed(2)}`, 190, finalY + 80, { align: "right" });
  
  // Add payment information
  doc.setFont(undefined, "normal");
  doc.text(`Payment Method: ${safeOrder.paymentMethod}`, 20, finalY + 100);
  doc.text(`Payment Status: ${safeOrder.paymentStatus}`, 20, finalY + 110);
  
  // Add order notes if available
  if (safeOrder.orderNotes) {
    doc.text("Notes:", 20, finalY + 130);
    doc.text(safeOrder.orderNotes, 20, finalY + 140);
  }
  
  // Add footer
  doc.setFontSize(8);
  doc.text("Thank you for dining with us!", 105, finalY + 160, { align: "center" });
  doc.text("Please visit again", 105, finalY + 165, { align: "center" });
  
  // Save the PDF
  doc.save(`bill-${safeOrder.orderNo}.pdf`);
}; 
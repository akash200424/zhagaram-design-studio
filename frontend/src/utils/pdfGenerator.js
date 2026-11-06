import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LOGO_BASE64 } from "../assets/logoBase64";

// Helper to render high-res native Rupee symbol as mini-PNG to avoid WinAnsiEncoding font issues in jsPDF
const getRupeeDataUrl = (textColor = "#0f172a") => {
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 50px "Segoe UI", Arial, sans-serif';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("\u20B9", 32, 33);
    return canvas.toDataURL("image/png");
  } catch (e) {
    return null;
  }
};

export const generateQuotePdf = async (enquiry, options = {}) => {
  const { returnBlob = false, autoDownload = true } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const services = enquiry.services || {
    plan: false,
    elevation: true,
    interior: false,
  };

  const pricing = enquiry.pricing || {};
  const grandTotal = Number(pricing.grandTotal || 0);

  // Exact Tax Invoice calculation matching user screenshot
  // Total = Subtotal + CGST(9%) + SGST(9%) => Subtotal = Total / 1.18
  const subtotalBeforeGst = Math.round((grandTotal / 1.18) * 100) / 100;
  const totalTax = grandTotal - subtotalBeforeGst;
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Math.round((totalTax - cgst) * 100) / 100;

  const formatNumber = (num) => {
    return Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const rupeeImg = getRupeeDataUrl("#0f172a");

  // ==========================================
  // LEFT COLUMN (Sidebar Layout ~ 52mm width)
  // ==========================================
  const leftX = 14;
  const leftWidth = 48;
  const leftRight = leftX + leftWidth;

  // 1. Company Logo (Updated to Zhagaram Design Studio logo)
  if (LOGO_BASE64) {
    try {
      const logoW = 46;
      const logoH = 26.3;
      doc.addImage(LOGO_BASE64, "JPEG", leftX, 12, logoW, logoH);
    } catch (err) {
      console.warn("Logo render fallback:", err);
    }
  }

  // Divider below logo
  doc.setDrawColor(218, 224, 233);
  doc.setLineWidth(0.3);
  doc.line(leftX, 42, leftRight, 42);

  // 2. INVOICE FROM
  let currentY = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("INVOICE FROM", leftX, currentY);

  currentY += 4.5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Zhagaram Design Studio", leftX, currentY);

  currentY += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text("Reg. Address : ", leftX, currentY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  const regAddressLines = doc.splitTextToSize(
    "175/4, Trichy main road, Near alagu nagar, Seelanaickenpatty, Salem- 636201.",
    leftWidth,
  );
  doc.text(regAddressLines, leftX, currentY + 3.5);

  currentY += 3.5 + regAddressLines.length * 3.2 + 3;

  // Divider
  doc.line(leftX, currentY, leftRight, currentY);
  currentY += 5;

  // 3. INVOICE TO (Use actual client details, NO dummy fallbacks like 'Arun Kumar')
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("INVOICE TO", leftX, currentY);

  currentY += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(enquiry.clientName || "Valued Client", leftX, currentY);

  if (enquiry.projectName) {
    currentY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(enquiry.projectName, leftX, currentY);
  }

  if (enquiry.mobileNo) {
    currentY += 4;
    doc.setFont("helvetica", "bold");
    doc.text("P : ", leftX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(enquiry.mobileNo, leftX + 5, currentY);
  }

  if (enquiry.email) {
    currentY += 4;
    doc.setFont("helvetica", "bold");
    doc.text("M : ", leftX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(enquiry.email, leftX + 6, currentY);
  }

  currentY += 5;
  // Divider
  doc.line(leftX, currentY, leftRight, currentY);
  currentY += 5;

  // 4. TERMS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("TERMS", leftX, currentY);

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const termsText =
    "By paying, you agree to our terms and conditions in our website, two free revisions are included, with a 30% fee for additional revisions. No refunds will be provided after payment. We deliver only floor plans and elevations, without any technical construction details. It is the client's responsibility to ensure compliance with local building codes.";
  const termsLines = doc.splitTextToSize(termsText, leftWidth);
  doc.text(termsLines, leftX, currentY, { lineHeightFactor: 1.35 });

  // 5. THANK YOU FOR YOUR BUSINESS (bottom of left column)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("THANK YOU FOR", leftX, 260);
  doc.text("YOUR BUSINESS", leftX, 264.5);

  // ==========================================
  // RIGHT COLUMN (Tax Invoice & Table)
  // ==========================================
  const rightX = 72;
  const rightMargin = 14;
  const rightWidth = 210 - rightX - rightMargin; // ~124mm
  const tableEndX = 210 - rightMargin;

  // 1. TAX INVOICE Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("TAX", tableEndX, 20, { align: "right" });
  doc.text("INVOICE", tableEndX, 28, { align: "right" });

  // Quote / Invoice number
  const quoteNo =
    enquiry.quoteNumber ||
    `ZDS-QT-${new Date().getFullYear()}-${String(enquiry.sno || 1).padStart(3, "0")}`;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Invoice #${quoteNo}`, tableEndX, 35, { align: "right" });

  // 2. Date Bar (User: "remove the total and price which is unnecessarily mentioned just below the date")
  const invoiceDate = enquiry.enquiryDate
    ? new Date(enquiry.enquiryDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Date : ", rightX, 60);
  doc.setFont("helvetica", "normal");
  doc.text(invoiceDate, rightX + 12, 60);

  // 3. Project Type clean name (User: "change 3d to 2d and dont mention square feet")
  let projectServiceTitle = "Elevation";
  if (services.plan && services.interior && services.plan) {
    projectServiceTitle = "Floor Plan , Elevation & Interior Design";
  } else if (services.plan && services.elevation) {
    projectServiceTitle = "Floor Plan & Elevation";
  } else if (services.plan && services.interior) {
    projectServiceTitle = "Floor Plan & Interior Design";
  } else if (services.elevation && services.interior) {
    projectServiceTitle = "Elevation & Interior Design";
  } else if (services.plan) {
    projectServiceTitle = "Architectural Floor Plan";
  } else if (services.interior) {
    projectServiceTitle = "Interior Design Visualization";
  }

  // 4. Clean Table matching Screenshot 3
  autoTable(doc, {
    startY: 68,
    margin: { left: rightX, right: rightMargin },
    head: [["Project Type", "Total"]],
    body: [[projectServiceTitle, formatNumber(grandTotal)]],
    theme: "plain",
    headStyles: {
      fillColor: false,
      textColor: [0, 0, 0],
      fontSize: 8.5,
      fontStyle: "bold",
      halign: "left",
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      lineColor: [218, 224, 233],
      lineWidth: { top: 0.3, bottom: 0.3, left: 0.3, right: 0.3 },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: { top: 4.5, bottom: 4.5, left: 3, right: 3 },
      lineColor: [218, 224, 233],
      lineWidth: { top: 0, bottom: 0.3, left: 0.3, right: 0.3 },
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 34, halign: "left" },
    },
  });

  const tableBottomY = doc.lastAutoTable.finalY + 4;

  // 5. Commercial Summary on Right Side (Subtotal, CGST 9%, SGST 9%, Total)
  const summaryXLabel = 145;
  const summaryValX = tableEndX;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);

  // Subtotal
  let sumY = tableBottomY + 3;
  doc.text("Subtotal", summaryXLabel, sumY);
  if (rupeeImg) {
    doc.addImage(rupeeImg, "PNG", summaryXLabel + 22, sumY - 2.7, 2.7, 2.7);
    doc.text(formatNumber(subtotalBeforeGst), summaryValX, sumY, {
      align: "right",
    });
  } else {
    doc.text(`Rs. ${formatNumber(subtotalBeforeGst)}`, summaryValX, sumY, {
      align: "right",
    });
  }

  // CGST (9.00%)
  sumY += 5;
  doc.text("CGST(9.00%)", summaryXLabel, sumY);
  if (rupeeImg) {
    doc.addImage(rupeeImg, "PNG", summaryXLabel + 22, sumY - 2.7, 2.7, 2.7);
    doc.text(formatNumber(cgst), summaryValX, sumY, { align: "right" });
  } else {
    doc.text(`Rs. ${formatNumber(cgst)}`, summaryValX, sumY, {
      align: "right",
    });
  }

  // SGST (9.00%)
  sumY += 5;
  doc.text("SGST(9.00%)", summaryXLabel, sumY);
  if (rupeeImg) {
    doc.addImage(rupeeImg, "PNG", summaryXLabel + 22, sumY - 2.7, 2.7, 2.7);
    doc.text(formatNumber(sgst), summaryValX, sumY, { align: "right" });
  } else {
    doc.text(`Rs. ${formatNumber(sgst)}`, summaryValX, sumY, {
      align: "right",
    });
  }

  // Total
  sumY += 6;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Total", summaryXLabel, sumY);
  if (rupeeImg) {
    doc.addImage(rupeeImg, "PNG", summaryXLabel + 22, sumY - 2.7, 2.7, 2.7);
    doc.text(formatNumber(grandTotal), summaryValX, sumY, { align: "right" });
  } else {
    doc.text(`Rs. ${formatNumber(grandTotal)}`, summaryValX, sumY, {
      align: "right",
    });
  }

  // 6. Business Address & Contacts Section at Bottom of Right Column
  const footerDividerY = 198;
  doc.setDrawColor(218, 224, 233);
  doc.setLineWidth(0.3);
  doc.line(rightX, footerDividerY, tableEndX, footerDividerY);

  let contactY = footerDividerY + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Business Address:", rightX, contactY);

  contactY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  // Address
  doc.text(
    "175/4, Trichy main road, Near alagu nagar, Seelanaickenpatty, Salem- 636201.",
    rightX + 4,
    contactY,
  );

  // Phone: 8489904344
  contactY += 5;
  doc.text("+91 8489904344", rightX + 4, contactY);

  // Email: zhagaramprojects@gmail.com
  contactY += 5;
  doc.text("zhagaramprojects@gmail.com", rightX + 4, contactY);

  // Instagram Web Address
  contactY += 5;
  doc.text(
    "https://www.instagram.com/zhagaram_design_studio/",
    rightX + 4,
    contactY,
  );

  // 7. Computer generated footnote
  contactY += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const noteX = rightX + rightWidth / 2;
  doc.text(
    "This is a computer generated invoice no signature required.",
    noteX,
    contactY,
    {
      align: "center",
    },
  );

  const filename = `Zhagaram_Invoice_${enquiry.projectName ? enquiry.projectName.replace(/\s+/g, "_") : "Quote"}_${quoteNo}.pdf`;

  if (autoDownload) {
    doc.save(filename);
  }

  const blob = doc.output("blob");

  return {
    filename,
    blob,
    doc,
  };
};

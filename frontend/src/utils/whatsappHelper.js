import { generateQuotePdf } from "./pdfGenerator";

/**
 * Format WhatsApp message matching the requested format.
 * Subtotal is hidden from the customer.
 */
export const formatWhatsAppMessage = (enquiry) => {
  const pricing = enquiry.pricing || {};
  const grandTotal = Number(pricing.grandTotal || 12000);

  const services = enquiry.services || {
    plan: false,
    elevation: true,
    interior: false,
  };

  const formatINR = (val) => {
    return (
      "₹" +
      Number(val || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  let serviceDetails = "";

  const isElevationOnly =
    services.elevation && !services.plan && !services.interior;

  const isPlanOnly = services.plan && !services.elevation && !services.interior;

  const isInteriorOnly =
    services.interior && !services.plan && !services.elevation;

  if (isElevationOnly) {
    const elevSqft =
      pricing.elevationSqft ||
      enquiry.elevationDetails?.elevationSqft ||
      enquiry.siteDetails?.builtUpArea ||
      0;

    serviceDetails = `Elevation Details

Elevation Area : ${elevSqft} Sq ft
Total : ${formatINR(grandTotal)}`;
  } else if (isPlanOnly) {
    const planSqft = pricing.planSqft || enquiry.siteDetails?.builtUpArea || 0;

    serviceDetails = `Planning Details

Built-up Area : ${planSqft} Sq ft
Total : ${formatINR(grandTotal)}`;
  } else if (isInteriorOnly) {
    const intSqft =
      pricing.interiorSqft || enquiry.interiorDetails?.interiorSqft || 0;

    serviceDetails = `Interior Details

Interior Area : ${intSqft} Sq ft
Total : ${formatINR(grandTotal)}`;
  } else {
    // Multi-service (e.g. Plan + Elevation)
    const lines = [];

    if (services.plan) {
      const pSqft = pricing.planSqft || enquiry.siteDetails?.builtUpArea || 0;

      lines.push(`• Planning Area : ${pSqft} Sq ft`);
    }

    if (services.elevation) {
      const eSqft =
        pricing.elevationSqft || enquiry.elevationDetails?.elevationSqft || 0;

      lines.push(`• Elevation Area : ${eSqft} Sq ft`);
    }

    if (services.interior) {
      const iSqft =
        pricing.interiorSqft || enquiry.interiorDetails?.interiorSqft || 0;

      lines.push(`• Interior Area : ${iSqft} Sq ft`);
    }

    serviceDetails = `Project Scope & Pricing Details

${lines.join("\n")}
Total : ${formatINR(grandTotal)}`;
  }

  const message = `Hello sir,

We appreciate your patience. After carefully reviewing your project requirements, we have customized a quote just for you based on the details provided:

${serviceDetails}

Your personalized quote is ready for review. Should you have any queries or wish to delve deeper into the details, please don't hesitate to contact us.

Thank you for selecting Zhagaram Design Studio; we are excited to assist in turning your project vision into reality!

Best Regards,
Zhagaram Design Studio.`;

  return message;
};

/**
 * Open WhatsApp and attach/share PDF if supported (via Web Share API),
 * or automatically download PDF and open WhatsApp Web with pre-filled message.
 */
export const openWhatsApp = async (enquiry) => {
  const messageText = formatWhatsAppMessage(enquiry);

  let phone = enquiry.mobileNo ? enquiry.mobileNo.replace(/[^0-9]/g, "") : "";

  if (phone.length === 10) {
    phone = "91" + phone;
  }

  let pdfResult = null;

  try {
    // Generate the PDF
    pdfResult = await generateQuotePdf(enquiry, {
      autoDownload: false,
      returnBlob: true,
    });
  } catch (err) {
    console.warn("PDF generation in WhatsApp workflow:", err);
  }

  // 1. Mobile & Web Share API support
  // Share PDF with WhatsApp message through native share dialog
  if (
    pdfResult?.blob &&
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({
      files: [
        new File([pdfResult.blob], pdfResult.filename, {
          type: "application/pdf",
        }),
      ],
    })
  ) {
    try {
      const pdfFile = new File([pdfResult.blob], pdfResult.filename, {
        type: "application/pdf",
      });

      await navigator.share({
        files: [pdfFile],
        title: `Zhagaram Invoice - ${enquiry.projectName || "Quote"}`,
        text: messageText,
      });

      return;
    } catch (shareErr) {
      if (shareErr.name !== "AbortError") {
        console.warn(
          "Web Share failed, falling back to WhatsApp Web URL:",
          shareErr,
        );
      } else {
        // User dismissed share dialog
        return;
      }
    }
  }

  // 2. Desktop fallback
  // Automatically download PDF so it is ready to attach in WhatsApp
  if (pdfResult?.doc && pdfResult?.filename) {
    try {
      pdfResult.doc.save(pdfResult.filename);
    } catch (e) {
      console.warn("Auto download error:", e);
    }
  }

  // Copy quote message to clipboard
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(messageText);
    }
  } catch (clipErr) {
    // Ignore clipboard error
  }

  // Open WhatsApp Web with pre-filled message
  const encodedText = encodeURIComponent(messageText);

  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

  window.open(url, "_blank");
};

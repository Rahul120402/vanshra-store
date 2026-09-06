/**
 * ==============================================================================
 * VANSHRA STORE - AUTOMATIC GOOGLE SHEETS & LUXURY EMAIL AUTOMATION SCRIPT
 * Custom tailored for Google Sheet: "Email for VanshRa Orders"
 * Spreadsheet ID: 1jrNAvjCEAt8GTM6KilZ2WTM93QVhqNC1OGNjUBRbopY
 * ==============================================================================
 */

// Target Google Spreadsheet ID
var SPREADSHEET_ID = "1jrNAvjCEAt8GTM6KilZ2WTM93QVhqNC1OGNjUBRbopY";

var HEADERS = [
  "Timestamp",
  "Order ID",
  "Customer Name",
  "Phone / WhatsApp",
  "Customer Email",
  "Items Ordered",
  "Total Amount (₹)",
  "Payment Mode",
  "Delivery Address",
  "City",
  "State",
  "Pincode",
  "Customer Note",
  "Status"
];

/**
 * Clean and normalize any Indian phone number format into strict WhatsApp format (e.g. 917665740403)
 * Strips leading 0s (07665740403 -> 917665740403) and removes invalid spaces/dashes.
 */
function cleanWhatsAppPhone(phone) {
  if (!phone) return "";
  var cleaned = String(phone).replace(/[^0-9]/g, "");
  // Strip all leading zeros (e.g. 07665740403 -> 7665740403, 0091... -> 91...)
  while (cleaned.indexOf("0") === 0) {
    cleaned = cleaned.substring(1);
  }
  // If Indian 10-digit number without country code, add 91
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  // If starts with 910 and has 13 digits (e.g. 9107665740403), remove the extra 0
  if (cleaned.indexOf("910") === 0 && cleaned.length === 13) {
    cleaned = "91" + cleaned.substring(3);
  }
  return cleaned;
}

/**
 * Format phone number for clean human display (e.g. +91 76657 40403)
 */
function formatPhoneDisplay(phone) {
  var wpPhone = cleanWhatsAppPhone(phone);
  if (wpPhone.length === 12 && wpPhone.indexOf("91") === 0) {
    return "+91 " + wpPhone.substring(2, 7) + " " + wpPhone.substring(7);
  }
  return phone || "N/A";
}

/**
 * Helper to get the correct active sheet directly from your spreadsheet
 */
function getTargetSheet() {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // fallback
  }
  if (!ss && SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      Logger.log("Error opening by ID: " + e.toString());
    }
  }
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  var sheet = ss.getActiveSheet();
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

/**
 * 1-Click Run Function: Sheet par turant headers create aur style karne ke liye
 * (Apps Script me dropdown se 'setupHeaders' select karke 'Run' daba sakte hain)
 */
function setupHeaders() {
  var sheet = getTargetSheet();
  initializeHeadersIfNeeded(sheet);
  Logger.log("✅ Headers created successfully on sheet: " + sheet.getName());
}

/**
 * Handle HTTP GET Requests (Health Check & Testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "VANSHRA Store Google Apps Script Webhook is Live and Ready!",
    sheetId: SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST Requests (Incoming Orders from Website)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Acquire lock for 10 seconds to avoid race conditions when multiple orders arrive
    lock.waitLock(10000);

    var data;
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    } else {
      throw new Error("No data payload received.");
    }

    var sheet = getTargetSheet();

    // Initialize Headers automatically if sheet is new or empty
    initializeHeadersIfNeeded(sheet);

    // Prepare order data values
    var orderId = data.orderId || ("VAN-" + Math.floor(1000 + Math.random() * 9000));
    var timestamp = new Date();
    var customer = data.customer || {};
    var custName = customer.fullName || "Valued Customer";
    var rawPhone = customer.phone || "";
    var custPhoneDisplay = formatPhoneDisplay(rawPhone);
    var custPhoneForSheet = "'" + custPhoneDisplay;
    var custEmail = customer.email || "";
    var custAddress = customer.address || "";
    var custCity = customer.city || "";
    var custState = customer.state || "";
    var custPincode = customer.pincode || "";
    var custNotes = customer.notes || "";
    var totalAmount = data.total || 0;
    var paymentMethod = data.paymentMethod || "Prepaid (UPI)";
    var status = data.status || "New";

    // Format items list for spreadsheet
    var items = data.items || [];
    var itemsSummary = items.map(function(item, idx) {
      return (idx + 1) + ". " + item.name + " [Size: " + (item.size || "Free") + ", Qty: " + (item.quantity || 1) + "] - ₹" + (item.price || 0);
    }).join("\n");

    // Append Order Row to Spreadsheet
    var newRow = [
      timestamp,
      orderId,
      custName,
      custPhoneForSheet,
      custEmail,
      itemsSummary,
      totalAmount,
      paymentMethod,
      custAddress,
      custCity,
      custState,
      custPincode,
      custNotes,
      status
    ];

    sheet.appendRow(newRow);

    // Style the newly inserted row
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange(lastRow, 1, 1, HEADERS.length);
    range.setFontFamily("Plus Jakarta Sans, Arial, sans-serif");
    range.setFontSize(10);
    range.setVerticalAlignment("middle");
    
    // Format timestamp, phone & currency columns
    sheet.getRange(lastRow, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    sheet.getRange(lastRow, 4).setNumberFormat("@");
    sheet.getRange(lastRow, 7).setNumberFormat("₹#,##0.00");
    
    // Alternate row shading
    if (lastRow % 2 === 0) {
      range.setBackground("#fdfcf9");
    } else {
      range.setBackground("#ffffff");
    }

    // -------------------------------------------------------------
    // SEND AUTOMATIC EMAILS
    // -------------------------------------------------------------
    var settings = data.settings || {};
    var brandName = settings.brandName || "VANSHRA";
    var currency = settings.currencySymbol || "₹";
    var adminEmail = settings.adminEmail || Session.getEffectiveUser().getEmail();
    var adminWhatsApp = cleanWhatsAppPhone(settings.adminWhatsApp || "919876543210");
    var adminUpiId = settings.adminUpiId || "918769102796@paytm";
    var storeAddress = settings.storeAddress || "Jaipur, Rajasthan - 302001";

    // 1. Send Alert Email to Store Owner / Admin
    sendOwnerAlertEmail({
      adminEmail: adminEmail,
      brandName: brandName,
      currency: currency,
      orderId: orderId,
      customer: customer,
      items: items,
      total: totalAmount,
      paymentMethod: paymentMethod,
      notes: custNotes,
      adminWhatsApp: adminWhatsApp
    });

    // 2. Send Confirmation Email to Customer (if customer provided an email)
    if (custEmail && custEmail.trim().indexOf("@") > 0) {
      sendCustomerConfirmationEmail({
        customerEmail: custEmail.trim(),
        customerName: custName,
        customerPhone: custPhoneDisplay,
        brandName: brandName,
        currency: currency,
        orderId: orderId,
        items: items,
        total: totalAmount,
        subtotal: data.subtotal || totalAmount,
        shippingFee: data.shippingFee || 0,
        address: custAddress + ", " + custCity + ", " + custState + " - " + custPincode,
        adminWhatsApp: adminWhatsApp,
        adminUpiId: adminUpiId,
        storeAddress: storeAddress
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Order #" + orderId + " recorded in Google Sheets and notification emails dispatched.",
      orderId: orderId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Automatically create and style headers if not already present
 */
function initializeHeadersIfNeeded(sheet) {
  var lastRow = sheet.getLastRow();
  var firstCell = "";
  if (lastRow > 0) {
    firstCell = sheet.getRange(1, 1).getValue();
  }

  if (lastRow === 0 || firstCell === "" || String(firstCell).trim() !== HEADERS[0]) {
    sheet.clear();
    sheet.appendRow(HEADERS);
    
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#181512"); // Royal Dark Velvet Black
    headerRange.setFontColor("#d4af37"); // Luxe Warm Gold
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setFontFamily("Plus Jakarta Sans, Arial, sans-serif");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 42);

    // Freeze header row so it stays fixed on top when scrolling
    sheet.setFrozenRows(1);

    // Format Column D (Phone / WhatsApp) as Plain Text
    sheet.getRange(1, 4, sheet.getMaxRows(), 1).setNumberFormat("@");

    // Auto-adjust column widths
    for (var col = 1; col <= HEADERS.length; col++) {
      sheet.autoResizeColumn(col);
      var width = sheet.getColumnWidth(col);
      if (width < 120) {
        sheet.setColumnWidth(col, 130);
      }
    }
  }
}

/**
 * ----------------------------------------------------------------------
 * 1. OWNER / ADMIN ORDER NOTIFICATION EMAIL TEMPLATE
 * ----------------------------------------------------------------------
 */
function sendOwnerAlertEmail(params) {
  var customerRawPhone = params.customer.phone || "";
  var wpPhone = cleanWhatsAppPhone(customerRawPhone);
  var displayPhone = formatPhoneDisplay(customerRawPhone);

  var itemsTableRows = params.items.map(function(item) {
    return '<tr style="border-bottom: 1px solid #e5e7eb;">' +
      '<td style="padding: 10px 12px; font-weight: 600; color: #111827;">' + item.name + '</td>' +
      '<td style="padding: 10px 12px; text-align: center;"><span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px; color: #111827;">' + (item.size || "Free") + '</span></td>' +
      '<td style="padding: 10px 12px; text-align: center; font-weight: 700;">' + (item.quantity || 1) + '</td>' +
      '<td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #b45309;">' + params.currency + (item.price * (item.quantity || 1)) + '</td>' +
    '</tr>';
  }).join("");

  var htmlBody = '<!DOCTYPE html>' +
  '<html>' +
  '<head><meta charset="utf-8"></head>' +
  '<body style="font-family: \'Plus Jakarta Sans\', Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 24px; color: #1f2937;">' +
    '<div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1.5px solid #d4af37; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">' +
      
      '<!-- Header -->' +
      '<div style="background: linear-gradient(180deg, #181512 0%, #0d0b09 100%); padding: 26px 24px; text-align: center; border-bottom: 2px solid #d4af37;">' +
        '<h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.12em; text-transform: uppercase;">' + params.brandName + '</h1>' +
        '<div style="display: inline-block; background: #d4af37; color: #181512; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 10px;">' +
          '🚨 New Customer Order Received' +
        '</div>' +
      '</div>' +

      '<!-- Body Content -->' +
      '<div style="padding: 24px;">' +
        '<div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">' +
          '<div><span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Order ID</span><div style="font-size: 18px; font-weight: 800; color: #b45309;">#' + params.orderId + '</div></div>' +
          '<div style="text-align: right;"><span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Total Payable</span><div style="font-size: 20px; font-weight: 800; color: #111827;">' + params.currency + params.total + '</div></div>' +
        '</div>' +

        '<!-- Customer Details Card -->' +
        '<div style="background: #fdfbf7; border: 1px solid #e7e0d3; border-radius: 8px; padding: 16px; margin-bottom: 20px;">' +
          '<h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #92400e; margin: 0 0 10px 0; font-weight: 800;">👤 Customer Information</h3>' +
          '<div style="font-size: 14px; line-height: 1.6; color: #374151;">' +
            '<strong>Name:</strong> ' + (params.customer.fullName || "Guest") + '<br/>' +
            '<strong>Phone / WhatsApp:</strong> ' + displayPhone + '<br/>' +
            (params.customer.email ? '<strong>Email:</strong> ' + params.customer.email + '<br/>' : '') +
            '<strong>Shipping Address:</strong> ' + (params.customer.address || "") + ', ' + (params.customer.city || "") + ', ' + (params.customer.state || "") + ' - ' + (params.customer.pincode || "") + '<br/>' +
            (params.notes ? '<div style="margin-top: 6px; padding: 6px 10px; background: #fef3c7; border-radius: 4px; font-size: 12px; color: #92400e;"><strong>Delivery Note:</strong> ' + params.notes + '</div>' : '') +
          '</div>' +
        '</div>' +

        '<!-- Items Table -->' +
        '<h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #111827; margin: 0 0 10px 0; font-weight: 800;">🛍️ Ordered Items (' + params.items.length + ')</h3>' +
        '<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">' +
          '<thead>' +
            '<tr style="background: #181512; color: #ffffff;">' +
              '<th style="padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase;">Item Name</th>' +
              '<th style="padding: 8px 12px; text-align: center; font-size: 11px; text-transform: uppercase;">Size</th>' +
              '<th style="padding: 8px 12px; text-align: center; font-size: 11px; text-transform: uppercase;">Qty</th>' +
              '<th style="padding: 8px 12px; text-align: right; font-size: 11px; text-transform: uppercase;">Price</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            itemsTableRows +
          '</tbody>' +
        '</table>' +

        '<!-- 1-Click Action Buttons for Store Owner -->' +
        '<div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid #e5e7eb;">' +
          '<a href="https://wa.me/' + wpPhone + '?text=Hello%20' + encodeURIComponent(params.customer.fullName || "Customer") + ',%20we%20received%20your%20order%20%23' + params.orderId + '%20on%20' + encodeURIComponent(params.brandName) + '.%20Let%20us%20confirm%20your%20fit!" style="display: inline-block; background: #25d366; color: #ffffff; padding: 12px 22px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; margin-right: 10px; margin-bottom: 8px;">' +
            '💬 Chat with Customer on WhatsApp' +
          '</a>' +
          (wpPhone ? '<a href="tel:+' + wpPhone + '" style="display: inline-block; background: #181512; color: #d4af37; border: 1px solid #d4af37; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; margin-bottom: 8px;">📞 Call Customer</a>' : '') +
        '</div>' +
      '</div>' +

      '<!-- Footer -->' +
      '<div style="background: #f9fafb; padding: 14px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">' +
        'Logged automatically into Google Sheets: ' + params.brandName + ' Orders.' +
      '</div>' +
    '</div>' +
  '</body>' +
  '</html>';

  MailApp.sendEmail({
    to: params.adminEmail,
    subject: "🚨 New Order Alert #" + params.orderId + " from " + (params.customer.fullName || "Customer") + " (" + params.currency + params.total + ")",
    htmlBody: htmlBody
  });
}

/**
 * ----------------------------------------------------------------------
 * 2. CUSTOMER LUXURY ORDER CONFIRMATION EMAIL TEMPLATE
 * ----------------------------------------------------------------------
 */
function sendCustomerConfirmationEmail(params) {
  var wpAdminPhone = cleanWhatsAppPhone(params.adminWhatsApp);

  var itemsTableRows = params.items.map(function(item) {
    return '<tr style="border-bottom: 1px solid #f3f4f6;">' +
      '<td style="padding: 12px 14px; font-weight: 600; color: #111827;">' + item.name + '</td>' +
      '<td style="padding: 12px 14px; text-align: center;"><span style="background: #faf8f5; border: 1px solid #e5e7eb; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; color: #111827;">' + (item.size || "Free") + '</span></td>' +
      '<td style="padding: 12px 14px; text-align: center; font-weight: 700; color: #111827;">' + (item.quantity || 1) + '</td>' +
      '<td style="padding: 12px 14px; text-align: right; font-weight: 700; color: #b45309;">' + params.currency + (item.price * (item.quantity || 1)) + '</td>' +
    '</tr>';
  }).join("");

  var htmlBody = '<!DOCTYPE html>' +
  '<html>' +
  '<head><meta charset="utf-8"></head>' +
  '<body style="font-family: \'Plus Jakarta Sans\', Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 24px; color: #1f2937;">' +
    '<div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1.5px solid #d4af37; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">' +
      
      '<!-- Royal Luxury Brand Header -->' +
      '<div style="background: linear-gradient(180deg, #181512 0%, #0d0b09 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #d4af37;">' +
        '<h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 0.16em; text-transform: uppercase; font-family: Georgia, serif;">' + params.brandName + '</h1>' +
        '<p style="color: #d4af37; font-size: 12px; margin: 6px 0 0 0; letter-spacing: 0.08em; text-transform: uppercase;">Crafted for Comfort, Worn with Grace</p>' +
      '</div>' +

      '<!-- Welcome Banner -->' +
      '<div style="padding: 28px 24px 20px;">' +
        '<h2 style="font-size: 20px; color: #111827; margin: 0 0 8px 0; font-family: Georgia, serif;">Thank You for Your Order, ' + params.customerName + '!</h2>' +
        '<p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">' +
          'We have received your order <strong>#' + params.orderId + '</strong>. Our master artisans are preparing your silhouettes with utmost care and precision.' +
        '</p>' +

        '<!-- UPI Payment Box -->' +
        '<div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, #ffffff 100%); border: 1.5px solid #d4af37; border-radius: 10px; padding: 18px; margin-bottom: 24px;">' +
          '<div style="font-size: 12px; text-transform: uppercase; font-weight: 800; color: #b45309; letter-spacing: 0.05em; margin-bottom: 4px;">' +
            '💳 UPI Payment Details' +
          '</div>' +
          '<div style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 6px;">' +
            'UPI ID: <span style="font-family: monospace; background: #ffffff; padding: 2px 8px; border: 1px dashed #d4af37; border-radius: 4px; color: #b45309;">' + params.adminUpiId + '</span>' +
          '</div>' +
          '<div style="font-size: 13px; color: #4b5563; line-height: 1.5;">' +
            'Please complete the payment of <strong>' + params.currency + params.total + '</strong> via UPI and share a screenshot on our official WhatsApp for priority express dispatch.' +
          '</div>' +
        '</div>' +

        '<!-- Items Table -->' +
        '<h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #111827; margin: 0 0 12px 0; font-weight: 800;">Order Receipt</h3>' +
        '<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">' +
          '<thead>' +
            '<tr style="background: #181512; color: #ffffff;">' +
              '<th style="padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase;">Product</th>' +
              '<th style="padding: 10px 14px; text-align: center; font-size: 11px; text-transform: uppercase;">Size</th>' +
              '<th style="padding: 10px 14px; text-align: center; font-size: 11px; text-transform: uppercase;">Qty</th>' +
              '<th style="padding: 10px 14px; text-align: right; font-size: 11px; text-transform: uppercase;">Total</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            itemsTableRows +
          '</tbody>' +
          '<tfoot>' +
            '<tr style="background: #faf8f5;">' +
              '<td colspan="3" style="padding: 10px 14px; text-align: right; font-weight: 600; color: #6b7280;">Subtotal:</td>' +
              '<td style="padding: 10px 14px; text-align: right; font-weight: 700; color: #111827;">' + params.currency + params.subtotal + '</td>' +
            '</tr>' +
            '<tr style="background: #faf8f5;">' +
              '<td colspan="3" style="padding: 6px 14px; text-align: right; font-weight: 600; color: #6b7280;">Shipping:</td>' +
              '<td style="padding: 6px 14px; text-align: right; font-weight: 700; color: #10b981;">' + (params.shippingFee === 0 ? "FREE" : params.currency + params.shippingFee) + '</td>' +
            '</tr>' +
            '<tr style="background: #181512; color: #ffffff;">' +
              '<td colspan="3" style="padding: 12px 14px; text-align: right; font-weight: 800; font-size: 14px;">Total Amount:</td>' +
              '<td style="padding: 12px 14px; text-align: right; font-weight: 800; font-size: 16px; color: #d4af37;">' + params.currency + params.total + '</td>' +
            '</tr>' +
          '</tfoot>' +
        '</table>' +

        '<!-- Delivery Address -->' +
        '<div style="background: #faf8f5; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">' +
          '<div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; margin-bottom: 4px;">Shipping Address</div>' +
          '<div style="font-size: 13.5px; line-height: 1.5; color: #1f2937;">' +
            '<strong>' + params.customerName + '</strong><br/>' +
            params.address + '<br/>' +
            'Phone: ' + params.customerPhone +
          '</div>' +
        '</div>' +

        '<!-- WhatsApp Stylist Help CTA -->' +
        '<div style="text-align: center; margin-top: 10px;">' +
          '<a href="https://wa.me/' + wpAdminPhone + '?text=Hello%20' + encodeURIComponent(params.brandName) + '%20Team,%20I%20have%20placed%20order%20%23' + params.orderId + '%20and%20would%20like%20fit%20verification." style="display: inline-block; background: #25d366; color: #ffffff; padding: 13px 26px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);">' +
            '💬 Connect with Stylist on WhatsApp' +
          '</a>' +
        '</div>' +

      '</div>' +

      '<!-- Footer -->' +
      '<div style="background: #181512; padding: 22px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #d4af37;">' +
        '<p style="margin: 0 0 6px 0; color: #d4af37; font-weight: 700;">' + params.brandName + ' Atelier & Boutique</p>' +
        '<p style="margin: 0 0 6px 0;">' + params.storeAddress + '</p>' +
        '<p style="margin: 0; font-size: 11px; color: #6b7280;">Support WhatsApp: +' + wpAdminPhone + ' • All rights reserved.</p>' +
      '</div>' +
    '</div>' +
  '</body>' +
  '</html>';

  MailApp.sendEmail({
    to: params.customerEmail,
    subject: "Order Confirmation #" + params.orderId + " - " + params.brandName + " Couture",
    htmlBody: htmlBody
  });
}

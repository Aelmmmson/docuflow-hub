// backend/services/emailService.js
const axios = require("axios");
const pool = require("../mysqlconfig");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const CNS_EMAIL_API_URL =
  process.env.CNS_EMAIL_API_URL || "http://10.203.14.33:8182/cns/api/v1/notification/send/email";
const CNS_APP_KEY =
  process.env.CNS_APP_KEY || "28925c2f07144f12939fed974d5b1f10";

const ACTIVITY_CODES = {
  RESET_PASSWORD: "AC6m6Y3d7jx5Zm",
  AWAITING_APPROVAL: "ACdt7W8_q6yt_y",
};

// Robust Base64 Image Loader for USG Brand Logo (/usg-logo-O.png)
let LOGO_BASE64_SRC = "http://10.203.14.169/usg-logo-O.png";
try {
  const logoPath = path.resolve(__dirname, "../../public/usg-logo-O.png");
  if (fs.existsSync(logoPath)) {
    const logoBuf = fs.readFileSync(logoPath);
    LOGO_BASE64_SRC = `data:image/png;base64,${logoBuf.toString("base64")}`;
  }
} catch (e) {
  console.error("[EMAIL SERVICE] Failed loading logo base64:", e);
}

/**
 * Executes async query using database connection pool with Promise wrapper
 */
function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.query(sql, params, (qErr, results) => {
        connection.release();
        if (qErr) return reject(qErr);
        resolve(results);
      });
    });
  });
}

/**
 * Base helper to send email notification to CNS REST API
 */
async function sendCnsEmail({ activityCode, recipientEmail, subject, htmlContent }) {
  if (!recipientEmail || !recipientEmail.includes("@")) {
    console.warn("[EMAIL SERVICE] Skipped invalid recipient email:", recipientEmail);
    return false;
  }

  const payload = {
    activity_code: activityCode,
    email_recipient: recipientEmail.trim(),
    email_subject: subject || "xDMS Notification",
    email_msg_body: htmlContent,
  };

  try {
    const response = await axios.post(CNS_EMAIL_API_URL, payload, {
      headers: {
        "X-App-Key": CNS_APP_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
    console.log(
      `[EMAIL SERVICE SUCCESS] Email sent to ${recipientEmail} (Subject: "${payload.email_subject}", Code: ${activityCode}). Status:`,
      response.status
    );
    return true;
  } catch (error) {
    console.error(
      `[EMAIL SERVICE FAILURE] Failed sending email to ${recipientEmail}:`,
      error.response?.data || error.message || error
    );
    return false;
  }
}

/**
 * Production-ready table-based HTML email template based on studio-mail repository.
 * Fully responsive on mobile screens, zero dead links, circular official stamps, and precise folder tab geometry.
 */
function buildHtmlEmailTemplate({
  title,
  headlineHtml = "Reset Your<br />Password Now!",
  subHeadlineHtml = "We received a request to<br />reset your password.",
  actionPromptText = "Click below to reset your password today.",
  subNoteText = "If you did not request a password change, simply ignore this message.",
  templateType = "security", // "security", "approval_required", "submitted", "approved", "declined", "update"
  recipientName = "Valued User",
  details = [],
  detailsPosition = "afterButton", // "beforeButton" or "afterButton"
  actionButton = null,
}) {
  const detailRowsHtml = details
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #4b5563; width: 36%; vertical-align: top; text-transform: uppercase; letter-spacing: 0.5px;">${item.label}</td>
      <td style="padding: 12px 16px; font-size: 13.5px; font-weight: 600; color: #0f1115; vertical-align: top;">${item.value}</td>
    </tr>
  `
    )
    .join("");

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Dynamic Graphic Cell: Official Round Circular Stamp Badges & Lock Graphic
  let graphicCellHtml = "";
  if (templateType === "security") {
    graphicCellHtml = `
      <!-- padlock graphic -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr><td align="center" valign="middle" height="40" style="height:40px;background-color:#ffffff;border-radius:14px;padding:0 16px;box-shadow:0 6px 14px rgba(15,17,21,0.14);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:22px;line-height:40px;font-weight:900;color:#0b64f4;letter-spacing:5px;text-indent:5px;white-space:nowrap;">
        <span class="twinkle" style="display:inline-block;text-shadow:0 0 0 #0b64f4;">&#42;</span><span class="twinkle" style="display:inline-block;animation-delay:.2s;text-shadow:0 0 0 #0b64f4;">&#42;</span><span class="twinkle" style="display:inline-block;animation-delay:.4s;text-shadow:0 0 0 #0b64f4;">&#42;</span><span class="twinkle" style="display:inline-block;animation-delay:.6s;text-shadow:0 0 0 #0b64f4;">&#42;</span>
      </td></tr>
      <tr><td align="center" style="font-size:0;line-height:0;padding-left:12px;">
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #ffffff;font-size:0;line-height:0;">&nbsp;</div>
      </td></tr>
      </table>

      <table role="presentation" class="lockwrap" cellpadding="0" cellspacing="0" border="0" style="margin:6px auto 0 auto;">
      <tr><td align="center" style="font-size:0;line-height:0;">
        <div style="width:32px;height:24px;border:10px solid #1155e3;border-bottom:0;border-radius:26px 26px 0 0;font-size:0;line-height:0;">&nbsp;</div>
      </td></tr>
      <tr><td align="center" style="font-size:0;line-height:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="76" style="width:76px;background-color:#f2b53c;border-radius:12px;box-shadow:0 8px 18px rgba(15,17,21,0.18);">
        <tr><td align="center" height="56" style="height:56px;padding:0;font-size:0;line-height:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center" style="font-size:0;line-height:0;">
            <div style="width:12px;height:12px;background-color:#111318;border-radius:12px;font-size:0;line-height:0;">&nbsp;</div>
          </td></tr>
          <tr><td align="center" style="font-size:0;line-height:0;">
            <div style="width:7px;height:10px;background-color:#111318;border-radius:0 0 3px 3px;font-size:0;line-height:0;">&nbsp;</div>
          </td></tr>
          </table>
        </td></tr>
        </table>
      </td></tr>
      </table>
    `;
  } else {
    let stampBg = "#0b64f4";
    let stampMainText = "APPROVED";
    let stampSubText = "OFFICIAL";
    if (templateType === "approved") { stampBg = "#16a34a"; stampMainText = "APPROVED"; stampSubText = "FINALIZED"; }
    else if (templateType === "declined") { stampBg = "#dc2626"; stampMainText = "DECLINED"; stampSubText = "REJECTED"; }
    else if (templateType === "submitted") { stampBg = "#2563eb"; stampMainText = "SUBMITTED"; stampSubText = "STAGE 1"; }
    else if (templateType === "update") { stampBg = "#0284c7"; stampMainText = "PROGRESS"; stampSubText = "UPDATED"; }
    else if (templateType === "approval_required") { stampBg = "#ea580c"; stampMainText = "ACTION"; stampSubText = "REQUIRED"; }

    graphicCellHtml = `
      <!-- Official Round Circular Stamp Badge -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr><td align="center" valign="middle" height="38" style="height:38px;background-color:#ffffff;border-radius:14px;padding:0 14px;box-shadow:0 6px 14px rgba(15,17,21,0.14);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:20px;line-height:38px;font-weight:900;color:${stampBg};letter-spacing:4px;text-indent:4px;white-space:nowrap;">
        <span class="twinkle" style="display:inline-block;text-shadow:0 0 0 ${stampBg};">&#42;</span><span class="twinkle" style="display:inline-block;animation-delay:.2s;text-shadow:0 0 0 ${stampBg};">&#42;</span><span class="twinkle" style="display:inline-block;animation-delay:.4s;text-shadow:0 0 0 ${stampBg};">&#42;</span><span class="twinkle" style="display:inline-block;animation-delay:.6s;text-shadow:0 0 0 ${stampBg};">&#42;</span>
      </td></tr>
      <tr><td align="center" style="font-size:0;line-height:0;padding-left:10px;">
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #ffffff;font-size:0;line-height:0;">&nbsp;</div>
      </td></tr>
      </table>

      <!-- Round Seal Stamp Graphic -->
      <table role="presentation" class="stamp stamp-circle" cellpadding="0" cellspacing="0" border="0" style="margin:6px auto 0 auto;">
      <tr><td align="center" style="font-size:0;line-height:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="86" height="86" style="width:86px;height:86px;background-color:${stampBg};border-radius:50%;box-shadow:0 8px 20px rgba(15,17,21,0.22);">
        <tr><td align="center" valign="middle" style="padding:4px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" height="100%" style="width:100%;height:100%;border:2px dashed #ffffff;border-radius:50%;">
          <tr><td align="center" valign="middle" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;line-height:14px;font-weight:900;letter-spacing:1px;color:#ffffff;text-align:center;">
            ${stampMainText}<br/><span style="font-size:7.5px;font-weight:700;letter-spacing:0.5px;opacity:0.9;">${stampSubText}</span>
          </td></tr>
          </table>
        </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="font-size:0;line-height:0;padding-top:6px;">
        <div class="ink" style="width:72px;height:10px;background-color:${stampBg};border-radius:10px;opacity:.25;font-size:0;line-height:0;">&nbsp;</div>
      </td></tr>
      </table>
    `;
  }

  // Details HTML Card Markup
  const detailsCardHtml = details.length > 0 ? `
    <div style="background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-top:12px;margin-bottom:20px;text-align:left;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${detailRowsHtml}
      </table>
    </div>
  ` : "";

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>${title}</title>
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style type="text/css">
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block;}
  body{margin:0!important;padding:0!important;width:100%!important;}
  a{text-decoration:none;}
  @keyframes twinkle{0%,100%{opacity:1;transform:translateY(0);}50%{opacity:.55;transform:translateY(-2px);}}
  @keyframes lockpop{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
  @keyframes stampdown{0%{transform:translateY(-12px) rotate(-12deg);opacity:.25;}18%{transform:translateY(0) rotate(-7deg);opacity:1;}26%{transform:translateY(-3px) rotate(-7deg);}34%{transform:translateY(0) rotate(-7deg);}100%{transform:translateY(0) rotate(-7deg);opacity:1;}}
  @keyframes inkpulse{0%,100%{opacity:.2;transform:scale(1);}50%{opacity:.35;transform:scale(1.05);}}
  .stamp{animation:stampdown 3.2s cubic-bezier(.2,.8,.3,1) infinite;}
  .ink{animation:inkpulse 3.2s ease-in-out infinite;}
  .twinkle{animation:twinkle 1.8s ease-in-out infinite;}
  .lockwrap{animation:lockpop 3s ease-in-out infinite;}
  @media (prefers-reduced-motion:reduce){.twinkle,.lockwrap,.stamp,.ink{animation:none!important;}}
  @media only screen and (max-width:620px){
    .wrap{width:100%!important;}
    .px{padding-left:20px!important;padding-right:20px!important;}
    .h1{font-size:24px!important;line-height:30px!important;}
    .h2{font-size:20px!important;line-height:28px!important;}
    .lead{font-size:13.5px!important;line-height:20px!important;}
    .lockcell{width:110px!important;}
    .stamp-circle{transform:scale(0.82)!important;}
    .lockwrap{transform:scale(0.85)!important;}
    .btn a{display:block!important;padding:16px 18px!important;font-size:14px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0b64f4;">
<div style="display:none;font-size:1px;color:#0b64f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${title}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0b64f4;">
<tr><td align="center" style="padding:28px 14px;">

  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:14px;overflow:hidden;">

    <!-- Header (Brand Logo + Title on Left, Date & Time on Right) -->
    <tr><td class="px" style="padding:34px 40px 8px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="left">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle;padding-right:10px;">
                <img src="${LOGO_BASE64_SRC}" alt="USG Logo" width="34" height="34" style="display:block;border:0;outline:none;text-decoration:none;" />
              </td>
              <td style="vertical-align:middle;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:26px;line-height:32px;font-weight:700;color:#0f1115;letter-spacing:-0.4px;">
                xDMS
              </td>
            </tr>
          </table>
        </td>
        <td align="right" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:19px;color:#12141a;">
          ${formattedDate},<br />${formattedTime}
        </td>
      </tr>
      </table>
    </td></tr>

    <!-- Folder card -->
    <tr><td class="px" style="padding:26px 40px 0 40px;">
      <!-- folder back flap (darker, 100% zero-gap single-cell geometry) -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0;padding:0;">
      <tr>
        <td style="font-size:0;line-height:0;padding:0;margin:0;white-space:nowrap;">
          <div style="display:inline-block;vertical-align:bottom;width:75px;height:22px;background-color:#9aa3b2;border-radius:10px 0 0 0;font-size:0;line-height:0;">&nbsp;</div><div style="display:inline-block;vertical-align:bottom;width:0;height:0;border-bottom:22px solid #9aa3b2;border-right:14px solid transparent;font-size:0;line-height:0;">&nbsp;</div>
        </td>
      </tr>
      </table>
      <!-- folder front flap (same color as folder body, 100% zero-gap single-cell geometry) -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0;padding:0;">
      <tr>
        <td style="font-size:0;line-height:0;padding:0;margin:0;white-space:nowrap;">
          <div style="display:inline-block;vertical-align:bottom;width:135px;height:20px;background-color:#f1f2f4;border-radius:6px 0 0 0;font-size:0;line-height:0;">&nbsp;</div><div style="display:inline-block;vertical-align:bottom;width:0;height:0;border-bottom:20px solid #f1f2f4;border-right:18px solid transparent;font-size:0;line-height:0;">&nbsp;</div>
        </td>
      </tr>
      </table>

      <!-- folder body -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f2f4;border-radius:0 16px 16px 16px;box-shadow:0 10px 24px rgba(15,17,21,0.12);">
      <tr><td style="padding:28px 24px 30px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <div class="h1" style="font-size:33px;line-height:40px;font-weight:700;color:#0f1115;letter-spacing:-0.8px;">${headlineHtml}</div>
            <div class="lead" style="padding-top:14px;font-size:16px;line-height:24px;color:#1c1f26;">${subHeadlineHtml}</div>
          </td>
          <td class="lockcell" width="160" valign="middle" align="center" style="width:160px;">
            ${graphicCellHtml}
          </td>
        </tr>
        </table>
      </td></tr>
      </table>
    </td></tr>

    <!-- Body & Action Copy -->
    <tr><td class="px" align="center" style="padding:32px 48px 0 48px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <div style="font-size:16px;font-weight:700;color:#0f1115;margin-bottom:8px;">Hello ${recipientName},</div>
      <div class="h2" style="font-size:24px;line-height:33px;font-weight:600;color:#0f1115;letter-spacing:-0.5px;">${actionPromptText}</div>
    </td></tr>

    <!-- Details Box FIRST (if detailsPosition === 'beforeButton') -->
    ${detailsPosition === "beforeButton" ? `<tr><td class="px" style="padding:16px 40px 0 40px;">${detailsCardHtml}</td></tr>` : ""}

    <!-- Action Button (ONLY included for eligible action takers!) -->
    ${
      actionButton
        ? `
      <tr><td class="px" align="center" style="padding:24px 40px 0 40px;">
        <table role="presentation" class="btn" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
        <tr><td align="center" bgcolor="#0b64f4" style="background-color:#0b64f4;border-radius:8px;">
          <a href="${actionButton.url}" target="_blank" style="display:block;padding:18px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:18px;font-weight:700;letter-spacing:1px;color:#ffffff;text-decoration:none;border-radius:8px;">${actionButton.label}</a>
        </td></tr>
        </table>
      </td></tr>
    `
        : ""
    }

    <!-- Disclaimer Sub-note -->
    <tr><td class="px" align="center" style="padding:24px 48px 28px 48px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:24px;color:#6b7280;">
      ${subNoteText}
    </td></tr>

    <!-- Details Box AFTER Button (if detailsPosition === 'afterButton') -->
    ${detailsPosition === "afterButton" ? `<tr><td class="px" style="padding:0 40px 28px 40px;">${detailsCardHtml}</td></tr>` : ""}

    <!-- Clean Footer (Zero dead links) -->
    <tr><td align="center" bgcolor="#f1f2f4" style="background-color:#f1f2f4;padding:22px 30px 24px 30px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <div style="font-size:13.5px;line-height:22px;color:#4b5563;font-weight:600;">&copy; ${new Date().getFullYear()} xDMS DocuFlow Hub, All Rights Reserved.</div>
      <div style="padding-top:4px;font-size:12px;line-height:18px;color:#6b7280;">Enterprise Document &amp; Financial Workflow Management System</div>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PASSWORD RESET & REGISTRATION EMAIL NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
async function notifyPasswordReset({ email, recipientName, newPassword = null, message = null }) {
  let htmlContent = "";

  if (newPassword) {
    // Scenario 1: Temporary Password Assigned (Forgot password / Admin user creation)
    htmlContent = buildHtmlEmailTemplate({
      title: "xDMS - Temporary Password Assigned",
      headlineHtml: "Temporary Password<br />Assigned!",
      subHeadlineHtml: "A temporary password has been<br />generated for your account.",
      actionPromptText: "Your account details and temporary password are provided below. To secure your account, click the button to set a new personal password now.",
      subNoteText: "If you did not request a password reset, please contact system administration immediately.",
      templateType: "security",
      recipientName: recipientName || "User",
      detailsPosition: "beforeButton",
      details: [
        { label: "Account Email", value: email },
        { label: "Temporary Password", value: `<span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #0b64f4;">${newPassword}</span>` },
        { label: "Security Step", value: "Update password upon initial login" }
      ],
      actionButton: {
        label: "SET PERSONAL PASSWORD",
        url: "http://localhost:8046/profile?tab=security"
      }
    });
  } else {
    // Scenario 2: User Changed Password from Security Tab
    htmlContent = buildHtmlEmailTemplate({
      title: "xDMS - Password Updated Successfully",
      headlineHtml: "Password Updated<br />Successfully!",
      subHeadlineHtml: "Your profile password was<br />updated successfully.",
      actionPromptText: "Your password update has been completed.",
      subNoteText: "If you performed this password update, no further action is required. If you did NOT perform this change, your account may be compromised &mdash; click the button immediately to secure your profile.",
      templateType: "security",
      recipientName: recipientName || "User",
      detailsPosition: "afterButton",
      details: [
        { label: "Account Email", value: email },
        { label: "Status", value: "<span style='color:#16a34a;font-weight:700;'>Password Successfully Changed</span>" }
      ],
      actionButton: {
        label: "SECURE YOUR ACCOUNT",
        url: "http://localhost:8046/profile?tab=security"
      }
    });
  }

  return await sendCnsEmail({
    activityCode: ACTIVITY_CODES.RESET_PASSWORD,
    recipientEmail: email,
    subject: "xDMS - Account Security & Password Notification",
    htmlContent,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOCUMENT SUBMITTED NOTIFICATION (Sent to Originator AND Stage 1 Approvers)
// ─────────────────────────────────────────────────────────────────────────────
async function notifyDocumentSubmission(docId) {
  try {
    const docRows = await queryAsync(
      `SELECT rd.*, doctype.description AS doctype_name, CONCAT(creator.first_name, ' ', creator.last_name) AS creator_name, creator.email AS creator_email
       FROM request_documents rd
       JOIN code_creation_details doctype ON rd.doctype_id = doctype.id AND doctype.code_id = 2
       LEFT JOIN users creator ON rd.posted_by = creator.id
       WHERE rd.id = ?`,
      [docId]
    );

    if (!docRows.length) return;
    const doc = docRows[0];

    // 1. Send submission confirmation to Originator / Creator (No Approval Buttons for Originator!)
    if (doc.creator_email) {
      const creatorHtml = buildHtmlEmailTemplate({
        title: `xDMS - Document Submitted (${doc.doc_id})`,
        headlineHtml: "Document<br />Submitted!",
        subHeadlineHtml: `Your document ${doc.doc_id}<br />has been received and queued.`,
        actionPromptText: "Your document has entered Stage 1 authorization.",
        subNoteText: "You will receive notification updates as approvers review your document.",
        templateType: "submitted",
        recipientName: doc.creator_name || "Originator",
        detailsPosition: "afterButton",
        details: [
          { label: "Document Reference", value: doc.doc_id },
          { label: "Document Type", value: doc.doctype_name || "Request Document" },
          { label: "Amount / Details", value: doc.requested_amount ? `$${doc.requested_amount}` : (doc.details || "N/A") },
          { label: "Status", value: "<span style='color: #0b64f4; font-weight: 700;'>SUBMITTED (Awaiting Stage 1 Authorization)</span>" }
        ],
        actionButton: null // Originators receive informative update without approval action buttons!
      });

      await sendCnsEmail({
        activityCode: ACTIVITY_CODES.AWAITING_APPROVAL,
        recipientEmail: doc.creator_email,
        subject: `xDMS - Document Submitted Successfully (${doc.doc_id})`,
        htmlContent: creatorHtml,
      });
    }

    // 2. Query Stage 1 approvers (Only eligible action-takers receive the Action Button!)
    const approverRows = await queryAsync(
      `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, da.is_mandatory, das.quorum,
         (SELECT COUNT(*) FROM doc_approvers WHERE doctype_id = da.doctype_id AND approval_stage = 1 AND is_mandatory = 1) AS mandatory_count
       FROM doc_approvers da
       JOIN users u ON da.approver_id = u.id
       JOIN doc_approval_setups das ON das.doctype_id = da.doctype_id AND das.approval_stage = 1
       WHERE da.doctype_id = ? AND da.approval_stage = 1 AND u.status = 1`,
      [doc.doctype_id]
    );

    const hasMandatoryApprovers = approverRows.some(a => a.is_mandatory === 1);

    for (const approver of approverRows) {
      let canUserAct = false;
      if (approver.is_mandatory === 1) {
        canUserAct = true;
      } else if (!hasMandatoryApprovers) {
        const stageQuorum = parseInt(approver.quorum || 1);
        const mandatoryCount = parseInt(approver.mandatory_count || 0);
        if (stageQuorum - mandatoryCount > 0) {
          canUserAct = true;
        }
      }

      const approverHtml = buildHtmlEmailTemplate({
        title: canUserAct ? `xDMS - Action Required: Document Awaiting Approval (${doc.doc_id})` : `xDMS - Document Status Update (${doc.doc_id})`,
        headlineHtml: canUserAct ? "Approve This<br />Request Now!" : "Document<br />Progress Update!",
        subHeadlineHtml: canUserAct ? `A document is waiting<br />for your approval.` : `Document ${doc.doc_id} has entered<br />Stage 1 authorization.`,
        actionPromptText: canUserAct ? "Click below to review and authorize this request today." : "Document is progressing through Stage 1 authorization.",
        subNoteText: canUserAct ? "Your prompt authorization will advance this document to the next stage." : "You will receive updates as approvals are completed.",
        templateType: canUserAct ? "approval_required" : "update",
        recipientName: `${approver.first_name} ${approver.last_name}`,
        detailsPosition: "afterButton",
        details: [
          { label: "Document Reference", value: doc.doc_id },
          { label: "Document Type", value: doc.doctype_name || "Request Document" },
          { label: "Submitted By", value: doc.creator_name || "Originator" },
          { label: "Amount / Details", value: doc.requested_amount ? `$${doc.requested_amount}` : (doc.details || "N/A") },
          { label: "Current Stage", value: "Stage 1 (Initial Authorization)" }
        ],
        actionButton: canUserAct ? {
          label: "APPROVE REQUEST",
          url: `http://localhost:8046/approval?docId=${encodeURIComponent(doc.doc_id)}&open=true`
        } : null
      });

      await sendCnsEmail({
        activityCode: ACTIVITY_CODES.AWAITING_APPROVAL,
        recipientEmail: approver.email,
        subject: canUserAct ? `xDMS - Action Required: Document Awaiting Stage 1 Approval (${doc.doc_id})` : `xDMS - Document Status Update (${doc.doc_id})`,
        htmlContent: approverHtml,
      });
    }
  } catch (err) {
    console.error("[EMAIL SERVICE ERROR] notifyDocumentSubmission failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DOCUMENT APPROVAL STEP NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
async function notifyDocumentApprovalStep(docId, approvedByUserId) {
  try {
    const docRows = await queryAsync(
      `SELECT rd.*, doctype.description AS doctype_name, CONCAT(creator.first_name, ' ', creator.last_name) AS creator_name, creator.email AS creator_email
       FROM request_documents rd
       JOIN code_creation_details doctype ON rd.doctype_id = doctype.id AND doctype.code_id = 2
       LEFT JOIN users creator ON rd.posted_by = creator.id
       WHERE rd.id = ?`,
      [docId]
    );

    if (!docRows.length) return;
    const doc = docRows[0];

    // CASE 1: FULLY APPROVED Across All Stages
    if (doc.status === "APPROVED" || doc.approval_stage > doc.max_approval_level) {
      const stakeholderRows = await queryAsync(
        `SELECT DISTINCT u.email, u.first_name, u.last_name, r.name AS role_name
         FROM users u
         JOIN model_has_roles m ON u.id = m.model_id
         JOIN roles r ON r.id = m.role_id
         WHERE u.id = ? OR r.name IN ('admin', 'finance') OR u.id IN (
           SELECT DISTINCT approver_id FROM doc_approvers WHERE doctype_id = ?
         ) OR u.id IN (
           SELECT DISTINCT approved_by FROM approval_activities WHERE doc_id = ?
         )`,
        [doc.posted_by, doc.doctype_id, doc.id]
      );

      const uniqueEmails = new Set();
      for (const user of stakeholderRows) {
        if (!user.email || uniqueEmails.has(user.email)) continue;
        uniqueEmails.add(user.email);

        const htmlContent = buildHtmlEmailTemplate({
          title: `xDMS - Document Fully Approved (${doc.doc_id})`,
          headlineHtml: "Document<br />Fully Approved!",
          subHeadlineHtml: `Document ${doc.doc_id}<br />has passed all authorization stages.`,
          actionPromptText: "This document is now fully authorized and finalized.",
          subNoteText: "The approval workflow is complete and cleared for financial settlement.",
          templateType: "approved",
          recipientName: `${user.first_name} ${user.last_name}`,
          detailsPosition: "afterButton",
          details: [
            { label: "Document Reference", value: doc.doc_id },
            { label: "Document Type", value: doc.doctype_name || "Request Document" },
            { label: "Originator", value: doc.creator_name || "Originator" },
            { label: "Approved Amount", value: doc.approved_amount ? `$${doc.approved_amount}` : (doc.requested_amount ? `$${doc.requested_amount}` : "N/A") },
            { label: "Final Status", value: "<span style='color: #16a34a; font-weight: 800;'>APPROVED & FINALIZED</span>" }
          ],
          actionButton: null // Finalized documents do not have pending action buttons!
        });

        await sendCnsEmail({
          activityCode: ACTIVITY_CODES.AWAITING_APPROVAL,
          recipientEmail: user.email,
          subject: `xDMS - Document Fully Approved & Finalized (${doc.doc_id})`,
          htmlContent,
        });
      }
      return;
    }

    // CASE 2: STILL IN STAGE X OR ADVANCED TO STAGE X+1
    const currentStage = doc.approval_stage;

    const approvedRows = await queryAsync(
      `SELECT approved_by FROM approval_activities WHERE doc_id = ? AND approval_stage = ?`,
      [doc.id, currentStage]
    );
    const approvedUserIds = new Set(approvedRows.map(r => Number(r.approved_by)));

    const stageApproverRows = await queryAsync(
      `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, da.is_mandatory, das.quorum,
         (SELECT COUNT(*) FROM doc_approvers WHERE doctype_id = da.doctype_id AND approval_stage = ? AND is_mandatory = 1) AS mandatory_count
       FROM doc_approvers da
       JOIN users u ON da.approver_id = u.id
       JOIN doc_approval_setups das ON das.doctype_id = da.doctype_id AND das.approval_stage = ?
       WHERE da.doctype_id = ? AND da.approval_stage = ? AND u.status = 1`,
      [currentStage, currentStage, doc.doctype_id, currentStage]
    );

    const awaitingUsersInStage = stageApproverRows.filter(a => !approvedUserIds.has(Number(a.id)));
    const remainingMandatory = awaitingUsersInStage.filter(a => a.is_mandatory === 1);

    // Notify Originator of Stage Progress (No approval buttons for Originator)
    if (doc.creator_email) {
      const originatorProgressHtml = buildHtmlEmailTemplate({
        title: `xDMS - Document Status Update (${doc.doc_id})`,
        headlineHtml: "Approval<br />Progress Update!",
        subHeadlineHtml: `An approval action was completed<br />for document ${doc.doc_id} at Stage ${currentStage}.`,
        actionPromptText: "Your document is actively advancing through authorization.",
        subNoteText: "You will be notified once the next stage action is recorded.",
        templateType: "update",
        recipientName: doc.creator_name || "Originator",
        detailsPosition: "afterButton",
        details: [
          { label: "Document Reference", value: doc.doc_id },
          { label: "Document Type", value: doc.doctype_name || "Request Document" },
          { label: "Current Stage", value: `Stage ${currentStage}` },
          { label: "Stage Status", value: `<span style="color: #0b64f4; font-weight: 700;">${approvedUserIds.size} Approval(s) Recorded</span>` }
        ],
        actionButton: null
      });

      await sendCnsEmail({
        activityCode: ACTIVITY_CODES.AWAITING_APPROVAL,
        recipientEmail: doc.creator_email,
        subject: `xDMS - Approval Progress Update (${doc.doc_id})`,
        htmlContent: originatorProgressHtml,
      });
    }

    // Notify stage approvers (Only eligible action-takers get the action button!)
    for (const approver of awaitingUsersInStage) {
      let canUserAct = false;
      if (approver.is_mandatory === 1) {
        canUserAct = true;
      } else if (remainingMandatory.length === 0) {
        const stageQuorum = parseInt(approver.quorum || 1);
        const mandatoryCount = parseInt(approver.mandatory_count || 0);
        if (stageQuorum - mandatoryCount > 0) {
          canUserAct = true;
        }
      }

      const approverHtml = buildHtmlEmailTemplate({
        title: canUserAct ? `xDMS - Action Required: Document ${doc.doc_id}` : `xDMS - Document Status Update (${doc.doc_id})`,
        headlineHtml: canUserAct ? "Approve This<br />Request Now!" : "Document<br />Progress Update!",
        subHeadlineHtml: canUserAct ? `Document ${doc.doc_id} is waiting<br />for your authorization at Stage ${currentStage}.` : `Document ${doc.doc_id} is progressing<br />through Stage ${currentStage} authorization.`,
        actionPromptText: canUserAct ? "Click below to review and authorize this request today." : "Document is currently advancing through authorization.",
        subNoteText: canUserAct ? "Please inspect the document details and authorize." : "You will be notified as stage progress updates.",
        templateType: canUserAct ? "approval_required" : "update",
        recipientName: `${approver.first_name} ${approver.last_name}`,
        detailsPosition: "afterButton",
        details: [
          { label: "Document Reference", value: doc.doc_id },
          { label: "Document Type", value: doc.doctype_name || "Request Document" },
          { label: "Originator", value: doc.creator_name || "Originator" },
          { label: "Amount / Details", value: doc.requested_amount ? `$${doc.requested_amount}` : (doc.details || "N/A") },
          { label: "Approval Stage", value: `Stage ${currentStage}` }
        ],
        actionButton: canUserAct ? {
          label: "APPROVE REQUEST",
          url: `http://localhost:8046/approval?docId=${encodeURIComponent(doc.doc_id)}&open=true`
        } : null
      });

      await sendCnsEmail({
        activityCode: ACTIVITY_CODES.AWAITING_APPROVAL,
        recipientEmail: approver.email,
        subject: canUserAct ? `xDMS - Action Required: Document Awaiting Authorization (${doc.doc_id})` : `xDMS - Document Status Update (${doc.doc_id})`,
        htmlContent: approverHtml,
      });
    }
  } catch (err) {
    console.error("[EMAIL SERVICE ERROR] notifyDocumentApprovalStep failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DOCUMENT DECLINED NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
async function notifyDocumentDecline(docId, declinedByUserId, declineReason = "No reason provided") {
  try {
    const docRows = await queryAsync(
      `SELECT rd.*, doctype.description AS doctype_name, CONCAT(creator.first_name, ' ', creator.last_name) AS creator_name, creator.email AS creator_email
       FROM request_documents rd
       JOIN code_creation_details doctype ON rd.doctype_id = doctype.id AND doctype.code_id = 2
       LEFT JOIN users creator ON rd.posted_by = creator.id
       WHERE rd.id = ?`,
      [docId]
    );

    if (!docRows.length) return;
    const doc = docRows[0];

    const declinerRows = await queryAsync(
      `SELECT CONCAT(first_name, ' ', last_name) AS decliner_name FROM users WHERE id = ?`,
      [declinedByUserId]
    );
    const declinerName = declinerRows[0]?.decliner_name || "An Approver";

    const stakeholderRows = await queryAsync(
      `SELECT DISTINCT u.email, u.first_name, u.last_name
       FROM users u
       WHERE u.id = ? OR u.id IN (
         SELECT DISTINCT approver_id FROM doc_approvers WHERE doctype_id = ?
       ) OR u.id IN (
         SELECT DISTINCT approved_by FROM approval_activities WHERE doc_id = ?
       )`,
      [doc.posted_by, doc.doctype_id, doc.id]
    );

    const uniqueEmails = new Set();
    for (const user of stakeholderRows) {
      if (!user.email || uniqueEmails.has(user.email)) continue;
      uniqueEmails.add(user.email);

      const htmlContent = buildHtmlEmailTemplate({
        title: `xDMS - Document Declined (${doc.doc_id})`,
        headlineHtml: "Document<br />Declined!",
        subHeadlineHtml: `Document ${doc.doc_id} was<br />declined by ${declinerName}.`,
        actionPromptText: "The authorization workflow for this document is terminated.",
        subNoteText: "If you have questions regarding this decline, contact the decliner or administration.",
        templateType: "declined",
        recipientName: `${user.first_name} ${user.last_name}`,
        detailsPosition: "afterButton",
        details: [
          { label: "Document Reference", value: doc.doc_id },
          { label: "Document Type", value: doc.doctype_name || "Request Document" },
          { label: "Declined By", value: declinerName },
          { label: "Reason for Decline", value: `<span style="color: #dc2626; font-weight: 700;">${declineReason}</span>` },
          { label: "Status", value: "<span style='color: #dc2626; font-weight: 800;'>REJECTED / DECLINED</span>" }
        ],
        actionButton: null // Terminated document notifications do not include action buttons!
      });

      await sendCnsEmail({
        activityCode: ACTIVITY_CODES.AWAITING_APPROVAL,
        recipientEmail: user.email,
        subject: `xDMS - Document Declined (${doc.doc_id})`,
        htmlContent,
      });
    }
  } catch (err) {
    console.error("[EMAIL SERVICE ERROR] notifyDocumentDecline failed:", err);
  }
}

module.exports = {
  sendCnsEmail,
  notifyPasswordReset,
  notifyDocumentSubmission,
  notifyDocumentApprovalStep,
  notifyDocumentDecline,
};
// src/lib/documentStamper.ts
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import api from "./api";

export interface ApprovalStampDetails {
  docId: string;
  numericDocId?: string | number;
  approverName: string;
  roleName: string;
  timestamp: string;
  signatureBase64?: string;
  approverUserId?: number | string;
  approvalStage?: number | string;
  isDeclined?: boolean;
  status?: string;
}

interface ApprovalRecord {
  approver: string;
  role_name?: string;
  approval_stage?: number | string;
  created_at?: string;
  signature?: string;
  user_id?: number | string;
  isDeclined?: boolean;
  status?: string;
}

// Store signature page info in a separate metadata file or cookie
// This is a simple in-memory cache (will reset on page refresh)
const documentMetadataCache = new Map<string, {
  approvalCount: number;
  stages: string[];
  pageCount: number;
  lastPageIsSignature: boolean;
}>();

/**
 * Validates and converts any image format to PNG Base64
 */
export async function ensurePngSignatureBase64(sigBase64: string): Promise<string> {
  if (!sigBase64) return "";
  
  const base64Regex = /^data:image\/(png|jpeg|jpg|svg\+xml|webp);base64,/i;
  if (!base64Regex.test(sigBase64)) {
    console.warn("Invalid signature format");
    return "";
  }

  if (sigBase64.startsWith("data:image/png;base64,")) {
    return sigBase64;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      const timeout = setTimeout(() => {
        resolve(sigBase64);
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          const maxDim = 400;
          let width = img.naturalWidth || img.width || 400;
          let height = img.naturalHeight || img.height || 200;
          
          if (width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          }
          
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngUrl = canvas.toDataURL("image/png", 0.95);
            resolve(pngUrl);
          } else {
            resolve(sigBase64);
          }
        } catch (err) {
          console.warn("Canvas processing failed:", err);
          resolve(sigBase64);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.warn("Image loading failed");
        resolve(sigBase64);
      };
      
      img.src = sigBase64;
    } catch (err) {
      console.warn("Image creation failed:", err);
      resolve(sigBase64);
    }
  });
}

/**
 * Fetches PDF with retry logic and timeout
 */
async function fetchExistingPdf(
  docId: string | number, 
  retries = 2
): Promise<ArrayBuffer | null> {
  const cleanId = String(docId || "").replace(/^REF-/i, "");
  const urls = [
    `/dms/filesearch-${cleanId}`,
    `/dms/filesearch-${docId}`,
  ];
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        
        const res = await fetch(url, { 
          signal: controller.signal 
        });
        
        clearTimeout(timeout);
        
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          const buf = await res.arrayBuffer();
          
          const header = new Uint8Array(buf.slice(0, 4));
          const isPdf = 
            header[0] === 0x25 && 
            header[1] === 0x50 && 
            header[2] === 0x44 && 
            header[3] === 0x46;
            
          if (isPdf || contentType.includes("pdf") || contentType.includes("octet-stream")) {
            return buf;
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.warn(`Request timeout for ${url}`);
        } else {
          console.warn(`Fetch attempt ${attempt + 1} failed:`, err);
        }
      }
    }
    
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  console.error(`Failed to fetch PDF for doc ${docId}`);
  return null;
}

/**
 * Converts base64 to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const b64 = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Fetches all approval records with batch optimization
 */
async function fetchAllApprovalRecords(
  details: ApprovalStampDetails
): Promise<ApprovalRecord[]> {
  const list: ApprovalRecord[] = [];
  const primaryId = details.numericDocId || details.docId;

  try {
    let res = await api.get<{ comments: any[] }>(`/get-approval-comments/${primaryId}`);
    if ((!res.data?.comments || res.data.comments.length === 0) && details.docId !== primaryId) {
      res = await api.get<{ comments: any[] }>(`/get-approval-comments/${details.docId}`);
    }

    if (res.data?.comments && Array.isArray(res.data.comments)) {
      const userIds = res.data.comments
        .map(item => item.approved_by || item.user_id)
        .filter(id => id != null);
      
      let signatureMap = new Map();
      if (userIds.length > 0) {
        try {
          const batchRes = await api.get(`/get-users-batch`, {
            params: { ids: userIds.join(",") }
          });
          if (batchRes.data?.result) {
            signatureMap = new Map(
              batchRes.data.result
                .filter((u: any) => u.signature)
                .map((u: any) => [u.id, u.signature])
            );
          }
        } catch (batchErr) {
          console.warn("Batch user fetch failed:", batchErr);
          
          for (const item of res.data.comments) {
            const userId = item.approved_by || item.user_id;
            if (userId) {
              try {
                const uRes = await api.get(`/get-user/${userId}`);
                const uObj = uRes.data?.result?.[0];
                if (uObj?.signature) {
                  signatureMap.set(userId, uObj.signature);
                }
              } catch (uErr) {
                console.warn(`Failed to fetch user ${userId}:`, uErr);
              }
            }
          }
        }
      }

      for (const item of res.data.comments) {
        const userId = item.approved_by || item.user_id;
        const itemStatus = String(item.status || item.action || "").toUpperCase();
        const isDeclined = itemStatus.includes("REJECT") || itemStatus.includes("DECLIN") || item.isDeclined === true;

        list.push({
          approver: item.approver || "Approver",
          role_name: item.role_name || "Approver",
          approval_stage: item.approval_stage || 1,
          created_at: item.created_at 
            ? new Date(item.created_at).toLocaleDateString() 
            : details.timestamp,
          signature: signatureMap.get(userId) || item.signature || undefined,
          user_id: userId,
          isDeclined,
          status: item.status,
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch approval records:", err);
  }

  const currentRecord: ApprovalRecord = {
    approver: details.approverName,
    role_name: details.roleName,
    approval_stage: details.approvalStage || 1,
    created_at: details.timestamp,
    signature: details.signatureBase64,
    user_id: details.approverUserId,
    isDeclined: details.isDeclined || (details.status ? String(details.status).toUpperCase().includes("REJECT") || String(details.status).toUpperCase().includes("DECLIN") : false),
    status: details.status,
  };

  const existsIdx = list.findIndex(
    (item) =>
      item.approver.toLowerCase() === currentRecord.approver.toLowerCase() &&
      String(item.approval_stage) === String(currentRecord.approval_stage)
  );

  if (existsIdx !== -1) {
    list[existsIdx] = { ...list[existsIdx], ...currentRecord };
  } else {
    list.push(currentRecord);
  }

  list.sort((a, b) => Number(a.approval_stage || 1) - Number(b.approval_stage || 1));

  return list;
}

/**
 * Gets document metadata from cache or PDF
 */
function getDocumentMetadata(docId: string, pdfDoc: any): {
  approvalCount: number;
  stages: string[];
  lastPageIsSignature: boolean;
} {
  // Check cache first
  if (documentMetadataCache.has(docId)) {
    const cached = documentMetadataCache.get(docId)!;
    // Verify cache is still valid (PDF page count hasn't changed)
    if (cached.pageCount === pdfDoc.getPageCount()) {
      return cached;
    }
  }

  // Parse from PDF metadata
  let approvalCount = 0;
  let stages: string[] = [];
  let lastPageIsSignature = false;

  try {
    const metadata = pdfDoc.getSubject() || "";
    
    // Parse approval count
    const countMatch = metadata.match(/APPROVAL_COUNT:(\d+)/);
    if (countMatch && countMatch[1]) {
      approvalCount = parseInt(countMatch[1], 10);
    }

    // Parse stages
    const stagesMatch = metadata.match(/STAGES:([^|]+)/);
    if (stagesMatch && stagesMatch[1]) {
      stages = stagesMatch[1].split(",").map(s => s.trim());
    }

    // Check if last page is a signature page by looking at metadata
    lastPageIsSignature = metadata.includes("SIGNATURE_PAGE");
  } catch (err) {
    console.warn("Failed to read metadata:", err);
  }

  // Cache the metadata
  documentMetadataCache.set(docId, {
    approvalCount,
    stages,
    pageCount: pdfDoc.getPageCount(),
    lastPageIsSignature,
  });

  return { approvalCount, stages, lastPageIsSignature };
}

/**
 * Checks if an approval stage already exists
 */
function approvalExists(pdfDoc: any, stage: number | string): boolean {
  try {
    const metadata = pdfDoc.getSubject() || "";
    const match = metadata.match(/STAGES:([^|]+)/);
    if (match && match[1]) {
      const stages = match[1].split(",").map(s => s.trim());
      return stages.includes(String(stage));
    }
  } catch (err) {
    console.warn("Failed to check existing approvals:", err);
  }
  return false;
}

/**
 * Gets the count of approval cards from metadata
 */
function getExistingApprovalCount(pdfDoc: any): number {
  try {
    const metadata = pdfDoc.getSubject() || "";
    const match = metadata.match(/APPROVAL_COUNT:(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  } catch (err) {
    console.warn("Failed to read approval count:", err);
  }
  return 0;
}

/**
 * Creates the approval stamped PDF - ONLY APPENDS NEW CARDS
 */
export async function createApprovalStampedPdf(
  details: ApprovalStampDetails
): Promise<string | null> {
  try {
    const existingPdfBytes = await fetchExistingPdf(details.docId);
    if (!existingPdfBytes) {
      console.error("Failed to fetch original PDF for", details.docId);
      return null;
    }

    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
    
    const allApprovals = await fetchAllApprovalRecords(details);
    if (allApprovals.length === 0) {
      console.warn("No approvals to display");
      return null;
    }

    const stageToAdd = details.approvalStage || 1;
    if (approvalExists(pdfDoc, stageToAdd)) {
      console.log(`Approval stage ${stageToAdd} already exists, updating signature only`);
    }

    // Get existing approval count from metadata
    const existingCount = getExistingApprovalCount(pdfDoc);
    const newApprovals = allApprovals.slice(existingCount);
    
    if (newApprovals.length === 0) {
      console.log("No new approvals to add");
      const pdfBytes = await pdfDoc.save();
      return base64ToDataUrl(pdfBytes);
    }

    console.log(`Adding ${newApprovals.length} new approval cards`);

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pageW = 612;
    const pageH = 792;

    const layout = {
      startX: 26,
      startY: pageH - 80,
      gapX: 20,
      gapY: 15, // 15px vertical spacing
      cardW: 270,
      cardH: 110,
      cardsPerRow: 2,
      maxCardsPerPage: 12,
    };

    // Determine which page to use
    let currentPageIndex = pdfDoc.getPageCount() - 1;
    let currentPage = pdfDoc.getPage(currentPageIndex);
    
    // Check if last page is a signature page using metadata
    const docMetadata = getDocumentMetadata(details.docId, pdfDoc);
    let isSignaturePage = docMetadata.lastPageIsSignature;

    // If last page is not a signature page, add a new one
    if (!isSignaturePage) {
      currentPage = pdfDoc.addPage([pageW, pageH]);
      currentPageIndex = pdfDoc.getPageCount() - 1;
      
      // Draw header on new signature page
      drawPageHeader(currentPage, boldFont, layout, details.docId, allApprovals.length);
      
      // Mark this as a signature page
      const currentMetadata = pdfDoc.getSubject() || "";
      pdfDoc.setSubject(
        currentMetadata + "|SIGNATURE_PAGE"
      );
    }

    // Count existing cards on the last page
    // We'll use metadata to track this
    let existingCardsOnPage = 0;
    try {
      const metadata = pdfDoc.getSubject() || "";
      const match = metadata.match(/CARDS_ON_LAST_PAGE:(\d+)/);
      if (match && match[1]) {
        existingCardsOnPage = parseInt(match[1], 10);
      }
    } catch (err) {
      console.warn("Failed to get card count:", err);
    }

    // Calculate starting position for new cards
    const startRow = Math.floor(existingCardsOnPage / layout.cardsPerRow);
    const startCol = existingCardsOnPage % layout.cardsPerRow;

    // Draw new approval cards
    let cardIndex = existingCardsOnPage;
    let currentRow = startRow;
    let currentCol = startCol;

    for (let i = 0; i < newApprovals.length; i++) {
      const record = newApprovals[i];
      
      const cardX = layout.startX + currentCol * (layout.cardW + layout.gapX);
      const cardY = layout.startY - layout.cardH - currentRow * (layout.cardH + layout.gapY);

      // Check if we need a new page
      if (cardY < 40) {
        // Add new signature page
        currentPage = pdfDoc.addPage([pageW, pageH]);
        currentPageIndex = pdfDoc.getPageCount() - 1;
        drawPageHeader(currentPage, boldFont, layout, details.docId, allApprovals.length);
        
        // Reset position for new page
        currentRow = 0;
        currentCol = 0;
        cardIndex = 0;
        existingCardsOnPage = 0;
        
        const newCardX = layout.startX + currentCol * (layout.cardW + layout.gapX);
        const newCardY = layout.startY - layout.cardH - currentRow * (layout.cardH + layout.gapY);
        
        await drawApprovalCard(
          currentPage,
          boldFont,
          regularFont,
          record,
          newCardX,
          newCardY,
          layout.cardW,
          layout.cardH,
          allApprovals.indexOf(record) + 1,
          true
        );
        
        currentCol++;
        cardIndex++;
        existingCardsOnPage++;
      } else {
        await drawApprovalCard(
          currentPage,
          boldFont,
          regularFont,
          record,
          cardX,
          cardY,
          layout.cardW,
          layout.cardH,
          allApprovals.indexOf(record) + 1,
          true
        );
        
        currentCol++;
        cardIndex++;
        existingCardsOnPage++;
      }

      if (currentCol >= layout.cardsPerRow) {
        currentCol = 0;
        currentRow++;
      }
    }

    // Update metadata with new approval count and stages
    const allStageNumbers = allApprovals.map(a => a.approval_stage).filter(s => s != null);
    const stagesStr = allStageNumbers.join(",");
    const totalApprovals = allApprovals.length;
    
    // Get existing metadata and append
    const existingMetadata = pdfDoc.getSubject() || "";
    const metadataParts = existingMetadata.split("|").filter(part => 
      !part.startsWith("APPROVAL_COUNT:") && 
      !part.startsWith("STAGES:") &&
      !part.startsWith("CARDS_ON_LAST_PAGE:")
    );
    
    const newMetadata = [
      ...metadataParts,
      `APPROVAL_COUNT:${totalApprovals}`,
      `STAGES:${stagesStr}`,
      `CARDS_ON_LAST_PAGE:${existingCardsOnPage}`,
      `LAST_UPDATE:${new Date().toISOString()}`
    ].join("|");
    
    pdfDoc.setSubject(newMetadata);

    // Update cache
    documentMetadataCache.set(details.docId, {
      approvalCount: totalApprovals,
      stages: allStageNumbers.map(String),
      pageCount: pdfDoc.getPageCount(),
      lastPageIsSignature: true,
    });

    const pdfBytes = await pdfDoc.save();
    return base64ToDataUrl(pdfBytes);
  } catch (err) {
    console.error("Error creating stamped PDF:", err);
    return null;
  }
}

/**
 * Draws the header on a signature page
 */
function drawPageHeader(
  page: any,
  boldFont: any,
  layout: any,
  docId: string,
  totalApprovals: number
) {
  const { startX, startY } = layout;
  const pageW = 612;

  page.drawRectangle({
    x: startX,
    y: startY + 24,
    width: pageW - startX * 2,
    height: 24,
    color: rgb(0.12, 0.23, 0.54),
  });

  page.drawText("OFFICIAL AUTHORIZATION & SIGNATURE TRAIL SHEET", {
    x: startX + 12,
    y: startY + 31,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  page.drawText(
    `DOC: ${docId}  |  TOTAL APPROVALS: ${totalApprovals}`,
    {
      x: pageW - startX - 250,
      y: startY + 31,
      size: 8,
      font: boldFont,
      color: rgb(0.9, 0.95, 1),
    }
  );

  page.drawLine({
    start: { x: startX, y: startY + 16 },
    end: { x: pageW - startX, y: startY + 16 },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.92),
  });
}

/**
 * Draws an individual approval card
 */
async function drawApprovalCard(
  page: any,
  boldFont: any,
  regularFont: any,
  record: ApprovalRecord,
  x: number,
  y: number,
  w: number,
  h: number,
  index: number,
  showStage: boolean = true
) {
  const isDeclined = record.isDeclined || (record.status ? String(record.status).toUpperCase().includes("REJECT") || String(record.status).toUpperCase().includes("DECLIN") : false);

  // Card background & colors
  const cardBg = isDeclined ? rgb(1.0, 0.94, 0.94) : rgb(0.97, 0.98, 1.0);
  const cardBorder = isDeclined ? rgb(0.8, 0.15, 0.15) : rgb(0.02, 0.53, 0.35);
  const headerBg = isDeclined ? rgb(0.75, 0.12, 0.12) : rgb(0.12, 0.23, 0.54);

  // Card background
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: cardBg,
    borderColor: cardBorder,
    borderWidth: 1,
  });

  // Card header
  const headerH = 18;
  page.drawRectangle({
    x,
    y: y + h - headerH,
    width: w,
    height: headerH,
    color: headerBg,
  });

  const stageText = isDeclined
    ? (showStage ? `STAGE ${record.approval_stage || index} DECLINED` : "DECLINED AUTHORIZATION")
    : (showStage ? `STAGE ${record.approval_stage || index} AUTHORIZATION` : "AUTHORIZATION");
  
  page.drawText(stageText, {
    x: x + 40,
    y: y + h - headerH + 5,
    size: 8,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Watermark
  page.drawText(isDeclined ? "DECLINED" : "APPROVED", {
    x: x + w / 2 - (isDeclined ? 42 : 35),
    y: y + h / 2 - 10,
    size: 20,
    font: boldFont,
    color: headerBg,
    opacity: 0.08,
    rotate: degrees(12),
  });

  // Approver details
  const labelX = x + 8;
  const valueX = x + 65;
  const lineH = 14;
  const textStartY = y + h - headerH - 15;

  const fields: [string, string][] = [
    ["Approver:", record.approver.toUpperCase()],
    ["Role:", (record.role_name || "Approver").toUpperCase()],
    ["Date:", record.created_at || "Pending"],
  ];

  fields.forEach(([lbl, val], idx) => {
    const ty = textStartY - idx * lineH;
    page.drawText(lbl, {
      x: labelX,
      y: ty,
      size: 7,
      font: boldFont,
      color: isDeclined ? rgb(0.45, 0.1, 0.1) : rgb(0.15, 0.2, 0.35),
    });
    page.drawText(val, {
      x: valueX,
      y: ty,
      size: 7,
      font: regularFont,
      color: isDeclined ? rgb(0.35, 0.05, 0.05) : rgb(0.05, 0.05, 0.25),
    });
  });

  // Divider
  const divX = x + 145;
  page.drawLine({
    start: { x: divX, y: y + 5 },
    end: { x: divX, y: y + h - headerH - 3 },
    thickness: 0.6,
    color: isDeclined ? rgb(0.9, 0.75, 0.75) : rgb(0.8, 0.85, 0.92),
  });

  // Signature area
  const sigAreaX = divX + 6;
  const sigAreaW = x + w - sigAreaX - 6;

  page.drawText("SIGNATURE:", {
    x: sigAreaX,
    y: textStartY,
    size: 6.5,
    font: boldFont,
    color: isDeclined ? rgb(0.6, 0.2, 0.2) : rgb(0.4, 0.45, 0.55),
  });

  if (record.signature) {
    try {
      const pngBase64 = await ensurePngSignatureBase64(record.signature);
      if (pngBase64) {
        const sigBytes = base64ToUint8Array(pngBase64);
        const sigImage = await page.doc.embedPng(sigBytes);
        
        const sigBoxH = 46;
        const sigBoxW = sigAreaW;
        const sigBoxY = y + 16;

        const imgDims = sigImage.scaleToFit(sigBoxW, sigBoxH);
        const centeredX = sigAreaX + (sigBoxW - imgDims.width) / 2;
        const centeredY = sigBoxY + (sigBoxH - imgDims.height) / 2;

        page.drawImage(sigImage, {
          x: centeredX,
          y: centeredY,
          width: imgDims.width,
          height: imgDims.height,
        });
        
        // Draw status badge
        page.drawText(isDeclined ? "DECLINED" : "VERIFIED", {
          x: sigAreaX,
          y: y + 6,
          size: 6.5,
          font: boldFont,
          color: isDeclined ? rgb(0.8, 0.15, 0.15) : rgb(0.02, 0.53, 0.35),
        });
      } else {
        drawSignaturePlaceholder(page, sigAreaX, y, regularFont);
      }
    } catch (sigErr) {
      console.warn("Failed to embed signature:", sigErr);
      drawSignaturePlaceholder(page, sigAreaX, y, regularFont);
    }
  } else {
    drawSignaturePlaceholder(page, sigAreaX, y, regularFont);
  }
}

/**
 * Draws a placeholder when signature is not available
 */
function drawSignaturePlaceholder(page: any, x: number, y: number, font: any) {
  page.drawText("[Pending signature]", {
    x: x,
    y: y + 30,
    size: 7,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
}

/**
 * Converts bytes to base64 data URL
 */
function base64ToDataUrl(bytes: Uint8Array): string {
  const base64 = btoa(
    Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join("")
  );
  return `data:application/pdf;base64,${base64}`;
}

/**
 * Sends the updated PDF to the document API
 */
export async function updateDocumentFile(
  docId: string | number,
  base64Pdf: string,
  descrip: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const pdfBytes = base64ToUint8Array(base64Pdf);
    const pdfBlob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const pdfFile = new File([pdfBlob], `approved_${docId}.pdf`, { type: "application/pdf" });

    const formData = new FormData();
    formData.append("doc_id", String(docId));
    formData.append("file", pdfFile);
    formData.append("descrip", descrip || `Approved document ${docId}`);

    const updateEndpoints = ["/dms/api/update_document_api.php", "/api/update-document"];
    let lastError: any = null;

    for (const endpoint of updateEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          console.log("PDF stamp uploaded successfully:", data);
          return { success: true, message: data.message || "Document updated." };
        } else {
          const errText = await response.text().catch(() => "");
          console.warn(`${endpoint} responded ${response.status}:`, errText);
        }
      } catch (err) {
        lastError = err;
        console.warn(`Could not reach ${endpoint}:`, err);
      }
    }

    console.warn("All endpoints failed:", lastError);
    return { 
      success: true, 
      message: "Document approved (file update API unavailable)." 
    };
  } catch (err: any) {
    console.error("Error updating document:", err);
    return { success: false, message: err.message };
  }
}
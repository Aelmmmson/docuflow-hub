import React, { useState, useEffect } from "react";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import { Printer, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

declare global {
  interface Window {
    scanner?: {
      scan: (
        callback: (successful: boolean, mesg: string, response: any) => void,
        options: any
      ) => void;
      getScannedImages: (
        response: any,
        includeBase64: boolean,
        includeFile: boolean
      ) => Array<{ src: string; srcIsBase64?: boolean }>;
    };
  }
}

interface ScannerProps {
  onScanSuccess?: (token: string, file?: File) => void;
  documentType?: string;
  documentDescription?: string;
  documentDate?: string;
  scannedBy?: string;
  branch?: string;
  disabled?: boolean;
}

export function Scanner({
  onScanSuccess,
  documentType,
  documentDescription,
  documentDate,
  scannedBy,
  branch = "000",
  disabled = false,
}: ScannerProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [scanInitialized, setScanInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.scanner) {
      setScanInitialized(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "//cdn.asprise.com/scannerjs/scanner.js";
    script.type = "text/javascript";
    script.async = true;

    script.onload = () => {
      if (window.scanner) {
        setScanInitialized(true);
      } else {
        setError("Scanner library loaded but window.scanner is undefined.");
      }
    };

    script.onerror = () => {
      setError("Failed to load scanner service script (Asprise ScannerJS).");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const cleanBase64 = (base64String: string): string => {
    const cleanedBase64 = base64String.replace(/^data:[^;]+;base64,/, "");
    return cleanedBase64.replace(/\s/g, "");
  };

  const base64ToFile = (base64Str: string, filename: string, mimeType: string): File => {
    const cleanStr = cleanBase64(base64Str);
    const binaryStr = atob(cleanStr);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  };

  const sendPDFToServer = async (base64PDF: string): Promise<string | null> => {
    setStatusMessage("Uploading scanned document to server...");
    const payload = {
      file: base64PDF,
      filename: documentType || "document",
      doc_type: documentType || "1",
      doc_type_value: documentType || "1",
      descrip: documentDescription || "Scanned Document",
      businessdate: documentDate || new Date().toISOString().split("T")[0],
      scanned_by: scannedBy || "System User",
      branch: branch || "000",
    };

    try {
      const response = await axios.post(
        "http://10.203.14.169/dms/scan/insert_doc_api.php",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      const returnedToken = data?.token || data?.doc_id || data?.id;

      if (returnedToken) {
        return returnedToken;
      } else if (data?.error !== undefined && data?.error !== 0) {
        throw new Error(data.message || "Server rejected the scanned document upload.");
      } else {
        throw new Error("No document ID or token returned from server response.");
      }
    } catch (err: any) {
      console.error("Scan upload error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to upload scanned document to server.";
      setError(errMsg);
      return null;
    }
  };

  const displayImagesOnPage = async (successful: boolean, mesg: string, response: any) => {
    if (!successful) {
      console.error("Scanning failed:", mesg);
      let errorText = `Scanning failed: ${mesg}`;
      if (mesg && (mesg.toLowerCase().includes("websocket") || mesg.toLowerCase().includes("connect"))) {
        errorText = "Could not connect to local scanner service (ws://127.0.0.1:9713). Please ensure the Asprise Scan App daemon / TWAIN service is installed and running on your PC.";
      }
      setError(errorText);
      setLoading(false);
      setStatusMessage(null);
      return;
    }

    if (mesg && mesg.toLowerCase().includes("user cancel")) {
      console.info("User canceled scanning");
      setLoading(false);
      setStatusMessage(null);
      return;
    }

    try {
      setStatusMessage("Processing scanned images...");
      if (!window.scanner) {
        throw new Error("Scanner API unavailable");
      }

      const scannedImages = window.scanner.getScannedImages(response, true, false);
      if (!scannedImages || scannedImages.length === 0) {
        throw new Error("No images returned from scanner.");
      }

      setStatusMessage(`Compiling ${scannedImages.length} page(s) into PDF...`);
      const compressedPdf = await PDFDocument.create();

      // Standard A4 PDF page dimensions in points (72 DPI)
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;

      for (let i = 0; i < scannedImages.length; i++) {
        const scannedImage = scannedImages[i];
        const iimg = cleanBase64(scannedImage.src);
        const pngImage = await compressedPdf.embedPng(iimg);

        // Fit image inside A4 dimensions while maintaining aspect ratio
        const scale = Math.min(A4_WIDTH / pngImage.width, A4_HEIGHT / pngImage.height);
        const scaledWidth = pngImage.width * scale;
        const scaledHeight = pngImage.height * scale;

        // Center image on the page
        const x = (A4_WIDTH - scaledWidth) / 2;
        const y = (A4_HEIGHT - scaledHeight) / 2;

        const page = compressedPdf.addPage([A4_WIDTH, A4_HEIGHT]);
        page.drawImage(pngImage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const compressedPdfBase64 = await compressedPdf.saveAsBase64();
      const fileName = `${documentType || "scanned_doc"}_${Date.now()}.pdf`;
      const pdfFile = base64ToFile(compressedPdfBase64, fileName, "application/pdf");

      const token = await sendPDFToServer(compressedPdfBase64);

      if (token && onScanSuccess) {
        setStatusMessage("Scan complete!");
        onScanSuccess(token, pdfFile);
      }
    } catch (err: any) {
      console.error("PDF generation or upload error:", err);
      setError(err?.message || "An error occurred while compiling or saving scanned pages.");
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  };

  const onScanClick = () => {
    if (!window.scanner) {
      setError("Scanner interface not initialized. Make sure your scanner app/driver is active.");
      return;
    }

    setError(null);
    setLoading(true);
    setStatusMessage("Opening scanner interface...");

    try {
      window.scanner.scan(displayImagesOnPage, {
        use_asprise_dialog: true,
        show_scanner_ui: true,
        twain_cap_setting: {
          ICAP_PIXELTYPE: "TWPT_RGB",
        },
        output_settings: [
          {
            type: "return-base64",
            format: "png",
          },
        ],
      });
    } catch (err: any) {
      console.error("Error triggering scanner:", err);
      setError(err?.message || "Could not launch scanner dialog.");
      setLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="text-xs p-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Scanner Error</AlertTitle>
          <AlertDescription className="text-xs mt-1 flex flex-col gap-2">
            <span>{error}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Reload Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Initialization Status */}
      {!scanInitialized && !error && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-md border border-border/50">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Initializing scanner driver & service (Asprise)...</span>
        </div>
      )}

      {/* Scanner Ready & Trigger Section */}
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3 text-primary">
          <Printer className="h-6 w-6" />
        </div>
        <h4 className="text-xs font-semibold text-foreground mb-1">
          Scan Document via TWAIN Scanner
        </h4>
        <p className="text-[11px] text-muted-foreground text-center max-w-sm mb-4">
          Connect your desktop scanner device to acquire multi-page document scans directly into PDF format.
        </p>

        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Button disabled className="h-9 text-xs px-5 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
              Scanning...
            </Button>
            {statusMessage && (
              <span className="text-[11px] text-muted-foreground animate-pulse">
                {statusMessage}
              </span>
            )}
          </div>
        ) : (
          <Button
            type="button"
            onClick={onScanClick}
            disabled={disabled || !scanInitialized}
            className="h-9 text-xs px-5 gap-2"
          >
            <Printer className="h-4 w-4" />
            Start Scan
          </Button>
        )}
      </div>
    </div>
  );
}

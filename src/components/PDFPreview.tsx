import { useRef } from 'react';

interface PDFPreviewProps {
  pdfDataUri: string;
}

export default function PDFPreview({ pdfDataUri }: PDFPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const printIframeRef = useRef<HTMLIFrameElement | null>(null);
  const isPrintingRef = useRef<boolean>(false);

  const handlePrint = () => {
    // Prevent multiple simultaneous print operations
    if (isPrintingRef.current) {
      return;
    }

    isPrintingRef.current = true;

    // Clean up any existing print iframe first
    if (printIframeRef.current && printIframeRef.current.parentNode) {
      document.body.removeChild(printIframeRef.current);
      printIframeRef.current = null;
    }

    // Convert data URI to blob URL for better browser compatibility
    const convertDataUriToBlob = (dataUri: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        try {
          const byteString = atob(dataUri.split(',')[1]);
          const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const blobUrl = URL.createObjectURL(blob);
          resolve(blobUrl);
        } catch (error) {
          reject(error);
        }
      });
    };

    // Use blob URL for more reliable printing
    convertDataUriToBlob(pdfDataUri)
      .then((blobUrl) => {
        // Create a hidden iframe for printing
        const printIframe = document.createElement('iframe');
        printIframe.style.position = 'fixed';
        printIframe.style.right = '0';
        printIframe.style.bottom = '0';
        printIframe.style.width = '0';
        printIframe.style.height = '0';
        printIframe.style.border = '0';
        printIframe.style.opacity = '0';
        printIframe.style.pointerEvents = 'none';
        printIframe.style.zIndex = '-1';
        
        printIframeRef.current = printIframe;
        document.body.appendChild(printIframe);
        
        // Function to trigger print - NO AUTO-CLEANUP
        const triggerPrint = () => {
          try {
            if (printIframe.contentWindow) {
              printIframe.contentWindow.focus();
              printIframe.contentWindow.print();
              // Reset flag - but DON'T clean up iframe
              // Let the print dialog stay open until user closes it
              // The iframe will remain in memory until page reload
              isPrintingRef.current = false;
            }
          } catch (error) {
            console.error('Print error:', error);
            // Only clean up on error
            URL.revokeObjectURL(blobUrl);
            if (printIframe.parentNode) {
              document.body.removeChild(printIframe);
            }
            printIframeRef.current = null;
            isPrintingRef.current = false;
          }
        };
        
        // Set up timeout fallback in case onload doesn't fire
        const timeoutId = setTimeout(() => {
          triggerPrint();
        }, 1500);
        
        // Wait for iframe to load, then print
        printIframe.onload = () => {
          clearTimeout(timeoutId);
          setTimeout(triggerPrint, 300);
        };
        
        // Set src to blob URL
        printIframe.src = blobUrl;
      })
      .catch((error) => {
        console.error('Error converting data URI to blob:', error);
        // Fallback: try using the preview iframe directly
        if (iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.focus();
            iframeRef.current.contentWindow.print();
          } catch (printError) {
            console.error('Print error:', printError);
          }
        }
        isPrintingRef.current = false;
      });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfDataUri;
    link.download = 'invoice.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Print PDF
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
        >
          Download PDF
        </button>
      </div>

      {/* PDF Preview in iframe */}
      <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50">
        <iframe
          ref={iframeRef}
          src={pdfDataUri}
          className="w-full h-[600px] border-0"
          title="Invoice PDF Preview"
        />
      </div>

      <p className="text-xs text-slate-500 text-center">
        Preview may take a moment to load. Click Print to open the print dialog.
      </p>
    </div>
  );
}


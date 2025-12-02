/**
 * Print ticket using iframe isolation
 * This ensures only the ticket content prints, not the entire page
 */
export function printTicket(htmlContent: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';

        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
            reject(new Error('Could not access iframe document'));
            return;
        }

        // Inject HTML with styles
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Ticket</title>
                <style>
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    
                    @media print {
                        body {
                            width: 80mm;
                            margin: 0;
                            padding: 0;
                        }
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Courier New', monospace;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `);
        iframeDoc.close();

        // Wait for content to load
        iframe.onload = () => {
            try {
                // Small delay to ensure rendering
                setTimeout(() => {
                    iframe.contentWindow?.print();

                    // Remove iframe after print dialog closes
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        resolve();
                    }, 100);
                }, 100);
            } catch (error) {
                document.body.removeChild(iframe);
                reject(error);
            }
        };

        iframe.onerror = () => {
            document.body.removeChild(iframe);
            reject(new Error('Failed to load iframe'));
        };
    });
}

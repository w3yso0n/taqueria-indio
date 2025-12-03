/**
 * Detect if user is on mobile device
 */
function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    ) || window.matchMedia('(max-width: 768px)').matches;
}

/**
 * Extract text content from HTML for mobile sharing
 */
function htmlToPlainText(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

/**
 * Share ticket via Web Share API (mobile friendly)
 */
async function shareTicket(htmlContent: string, title: string): Promise<void> {
    const textContent = htmlToPlainText(htmlContent);

    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: textContent
            });
            return;
        } catch (error) {
            // User cancelled or share failed, fall through to copy
            if ((error as Error).name !== 'AbortError') {
                console.error('Share failed:', error);
            }
        }
    }

    // Fallback to copy to clipboard
    try {
        await navigator.clipboard.writeText(textContent);
        alert('✅ Ticket copiado al portapapeles.\nPuedes pegarlo en WhatsApp, mensajes o donde necesites.');
    } catch (error) {
        // Last resort: show in a text area for manual copy
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 12px;
            max-width: 90%;
            max-height: 80%;
            overflow: auto;
        `;

        const textarea = document.createElement('textarea');
        textarea.value = textContent;
        textarea.style.cssText = `
            width: 100%;
            min-height: 300px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        `;

        const button = document.createElement('button');
        button.textContent = 'Cerrar';
        button.style.cssText = `
            margin-top: 10px;
            padding: 10px 20px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
        `;
        button.onclick = () => document.body.removeChild(modal);

        container.appendChild(textarea);
        container.appendChild(button);
        modal.appendChild(container);
        document.body.appendChild(modal);

        textarea.select();
    }
}

/**
 * Print ticket using iframe isolation
 * This ensures only the ticket content prints, not the entire page
 * On mobile, falls back to sharing/copying
 */
export function printTicket(htmlContent: string, title: string = 'Ticket'): Promise<void> {
    // On mobile, use share API instead of print dialog
    if (isMobileDevice()) {
        return shareTicket(htmlContent, title);
    }

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
                <title>${title}</title>
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

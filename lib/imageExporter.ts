import { toPng } from 'html-to-image';

export async function exportImage(element: HTMLElement) {
    try {
        const dataUrl = await toPng(element, {
            pixelRatio: 2,
            skipFonts: true,
            filter: (node) => {
                if (node instanceof HTMLImageElement && node.crossOrigin) {
                    return false;
                }
                const style = window.getComputedStyle(node);
                if (style.display === 'none' || style.opacity === '0') {
                    return false;
                }
                return true;
            },
            canvasWidth: element.offsetWidth * 2,
            canvasHeight: element.offsetHeight * 2,
        });

        const now = new Date();
        const filename = `screenpastel-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Export failed:', err);
    }
}

export async function copyImage(element: HTMLElement) {
    try {
        const dataUrl = await toPng(element, {
            pixelRatio: 2,
            skipFonts: true,
            filter: (node) => {
                if (node instanceof HTMLImageElement && node.crossOrigin) {
                    return false;
                }
                const style = window.getComputedStyle(node);
                if (style.display === 'none' || style.opacity === '0') {
                    return false;
                }
                return true;
            },
            canvasWidth: element.offsetWidth * 2,
            canvasHeight: element.offsetHeight * 2,
        });

        const response = await fetch(dataUrl);
        const blob = await response.blob();

        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
            ]);
            return true;
        } else {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            return true;
        }
    } catch (err) {
        console.error('Copy failed:', err);
        return false;
    }
}

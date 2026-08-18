import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Scans a vertical window on the canvas to find a clean horizontal gap
 * between text lines, cards, or sections, preventing sliced words or letters.
 * Handles single-column and two-column/sidebar layouts seamlessly.
 */
function findCleanSliceY(
  ctx: CanvasRenderingContext2D,
  width: number,
  targetY: number,
  searchWindow = 120
): number {
  const startY = Math.max(20, Math.floor(targetY - searchWindow));
  const endY = Math.min(ctx.canvas.height - 20, Math.floor(targetY));

  if (startY >= endY) return Math.min(targetY, ctx.canvas.height);

  try {
    const imgData = ctx.getImageData(0, startY, width, endY - startY + 1);
    const data = imgData.data;

    let bestY = endY;
    let minInkScore = Infinity;

    // We scan the main content area (from 35% to 95% of width to avoid left-sidebar background noise,
    // and also 10% to 90% for single-column templates)
    const xStart = Math.floor(width * 0.35);
    const xEnd = Math.floor(width * 0.95);
    const sampleStep = 3;

    // Scan upwards from targetY to find the cleanest gap between elements
    for (let y = endY; y >= startY; y--) {
      const rowOffset = (y - startY) * width * 4;
      let inkCount = 0;

      for (let x = xStart; x < xEnd; x += sampleStep) {
        const idx = rowOffset + x * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Any dark text pixel (black, charcoal, dark slate, dark blue/gray text)
        if (r < 210 || g < 210 || b < 210) {
          inkCount++;
        }
      }

      // If a completely clean row with zero text ink is found near target, pick it!
      if (inkCount === 0) {
        return y;
      }

      if (inkCount < minInkScore) {
        minInkScore = inkCount;
        bestY = y;
      }
    }

    return bestY;
  } catch (e) {
    console.warn('Canvas pixel analysis fallback:', e);
    return targetY;
  }
}

export async function exportCVToPDF(
  elementId = 'cv-printable-document',
  filename = 'Mon-CV.pdf'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element to export not found:', elementId);
    return false;
  }

  // 1. Temporarily hide all editing buttons, toolbars, and no-print elements
  const hiddenElements: { el: HTMLElement; prevDisplay: string; prevVisibility: string }[] = [];
  
  try {
    document.body.classList.add('is-exporting-pdf');
    element.classList.add('is-exporting-pdf');

    const selectors = [
      'button',
      '.no-print',
      '.cv-edit-action-btn',
      '[data-no-print="true"]',
      '[data-export-ignore="true"]',
      '[aria-label*="Modifier"]',
      '[aria-label*="Editer"]',
    ].join(', ');

    element.querySelectorAll<HTMLElement>(selectors).forEach((el) => {
      hiddenElements.push({
        el,
        prevDisplay: el.style.display,
        prevVisibility: el.style.visibility,
      });
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
    });

    const filterFn = (node: HTMLElement | Node) => {
      if (node && (node as HTMLElement).nodeType === 1) {
        const el = node as HTMLElement;
        const tagName = el.tagName?.toLowerCase();
        if (tagName === 'button') return false;
        if (
          el.classList?.contains('no-print') ||
          el.classList?.contains('cv-edit-action-btn') ||
          el.getAttribute?.('data-no-print') === 'true' ||
          el.getAttribute?.('data-export-ignore') === 'true' ||
          el.getAttribute?.('aria-label')?.includes('Modifier')
        ) {
          return false;
        }
      }
      return true;
    };

    // Small delay to let the DOM settle layout without buttons
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 2. High-resolution canvas snapshot of the entire CV
    const fullCanvas = await toCanvas(element, {
      quality: 1,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      filter: filterFn as any,
    });

    const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true });
    if (!fullCtx) {
      throw new Error('Canvas 2D context unavailable');
    }

    const canvasWidth = fullCanvas.width;
    const canvasHeight = fullCanvas.height;

    // A4 standard aspect ratio (297 / 210 = 1.4142857)
    const a4Ratio = 297 / 210;
    const pageCanvasHeight = Math.round(canvasWidth * a4Ratio);

    // Initialize jsPDF in A4 portrait
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // CASE 1: Single page CV (or slight overflow within 10% - auto-fit cleanly to 1 single page)
    if (canvasHeight <= pageCanvasHeight * 1.1) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageCanvasHeight;
      const pCtx = pageCanvas.getContext('2d');

      if (pCtx) {
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(0, 0, canvasWidth, pageCanvasHeight);

        if (canvasHeight <= pageCanvasHeight) {
          // Fits directly without scaling
          pCtx.drawImage(fullCanvas, 0, 0);
        } else {
          // Scale down proportionally to fit on 1 pristine A4 page
          const scale = pageCanvasHeight / canvasHeight;
          const scaledW = canvasWidth * scale;
          const offsetX = (canvasWidth - scaledW) / 2;
          pCtx.drawImage(fullCanvas, offsetX, 0, scaledW, pageCanvasHeight);
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    } else {
      // CASE 2: Multi-page CV (2+ pages) - Slice using pixel-level whitespace detection
      let currentTop = 0;
      let pageIndex = 0;

      while (currentTop < canvasHeight - 20) {
        const remaining = canvasHeight - currentTop;
        let sliceBottom = canvasHeight;

        if (remaining > pageCanvasHeight * 1.05) {
          const targetBottom = currentTop + pageCanvasHeight;
          // Find clean whitespace row within search window of page limit
          sliceBottom = findCleanSliceY(fullCtx, canvasWidth, targetBottom, 120);
        }

        const sliceHeight = sliceBottom - currentTop;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = pageCanvasHeight;
        const pCtx = pageCanvas.getContext('2d');

        if (pCtx) {
          pCtx.fillStyle = '#ffffff';
          pCtx.fillRect(0, 0, canvasWidth, pageCanvasHeight);

          pCtx.drawImage(
            fullCanvas,
            0,
            currentTop,
            canvasWidth,
            sliceHeight,
            0,
            0,
            canvasWidth,
            sliceHeight
          );

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);

          if (pageIndex > 0) {
            pdf.addPage();
          }

          pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }

        currentTop = sliceBottom;
        pageIndex++;
      }
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('PDF export error, falling back to print dialog:', error);
    window.print();
    return false;
  } finally {
    // 3. Restore all elements
    document.body.classList.remove('is-exporting-pdf');
    element.classList.remove('is-exporting-pdf');
    hiddenElements.forEach(({ el, prevDisplay, prevVisibility }) => {
      el.style.display = prevDisplay;
      el.style.visibility = prevVisibility;
    });
  }
}

export function printDocument() {
  window.print();
}





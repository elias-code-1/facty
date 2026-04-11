import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DOMPurify from 'dompurify';

/**
 * Exporte un élément HTML en PDF de haute qualité
 * @param elementId L'ID de l'élément à capturer
 * @param fileName Le nom du fichier de sortie
 */
export const exportInvoicePDF = async (
  elementId: string,
  fileName: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Template introuvable');
  }

  // Masquer les éléments qui ne doivent pas apparaître dans le PDF
  const noPrintElements = document.querySelectorAll('.no-print');
  const originalVisibilities: string[] = [];
  noPrintElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    originalVisibilities.push(htmlEl.style.visibility);
    htmlEl.style.visibility = 'hidden';
  });

  try {
    // Silence the oklab warning
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('oklab')) return;
      originalWarn(...args);
    };

    const canvas = await html2canvas(element, {
      scale: 2, // Haute résolution
      useCORS: true, // Pour les images externes (logo)
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200, // Force desktop layout for consistent PDF rendering
      onclone: (clonedDoc) => {
        // Force the cloned element to have a fixed width to match windowWidth
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.width = '1200px';
          clonedElement.style.maxWidth = '1200px';
          clonedElement.style.margin = '0';
          clonedElement.style.padding = '40px'; // Add some padding for the PDF
        }

        // 1. Nettoyer toutes les balises <style> de manière agressive
        const styleTags = clonedDoc.getElementsByTagName('style');
        for (let i = 0; i < styleTags.length; i++) {
          const tag = styleTags[i];
          if (tag.innerHTML.includes('oklch') || tag.innerHTML.includes('oklab') || tag.innerHTML.includes('color(')) {
            tag.innerHTML = tag.innerHTML
              .replace(/oklch\([\s\S]*?\)/g, '#4f46e5')
              .replace(/oklab\([\s\S]*?\)/g, '#4f46e5')
              .replace(/color\([\s\S]*?\)/g, '#4f46e5');
          }
        }

        // 2. Forcer les styles calculés en RGB sur tous les éléments du clone
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const style = window.getComputedStyle(el);
          
          const problematicProps = [
            'color',
            'backgroundColor', 
            'borderColor',
            'outlineColor',
            'boxShadow',
            'fill',
            'stroke'
          ];
          
          problematicProps.forEach((prop) => {
            try {
              const value = (style as any)[prop];
              if (value && (
                value.includes('oklab') || 
                value.includes('oklch') || 
                value.includes('color(')
              )) {
                // Si le style calculé contient encore du oklab (rare car le navigateur convertit en rgb),
                // on force une valeur sûre.
                (htmlEl.style as any)[prop] = prop === 'boxShadow' ? 'none' : '#000000';
              } else if (value) {
                // On force la valeur calculée (qui est normalement en rgb/rgba)
                // pour court-circuiter les feuilles de style qu'on a pu supprimer
                (htmlEl.style as any)[prop] = value;
              }
            } catch (e) {
              // Ignorer les erreurs de style
            }
          });
        });
      }
    });

    // Restore console.warn
    console.warn = originalWarn;

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = 297; // Hauteur A4 en mm

    if (pdfHeight > pageHeight) {
      let heightLeft = pdfHeight;
      let position = 0;

      // Première page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Pages suivantes
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(fileName);
  } finally {
    // Restaurer la visibilité des éléments masqués
    noPrintElements.forEach((el, index) => {
      (el as HTMLElement).style.visibility = originalVisibilities[index];
    });
  }
};

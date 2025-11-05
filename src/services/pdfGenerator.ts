import jsPDF from 'jspdf';
import { InvoiceData, InvoiceTemplate } from '../types/invoice';

export class PDFGenerator {
  private doc: jsPDF;
  private template: InvoiceTemplate;
  private data: InvoiceData;

  constructor(data: InvoiceData, template: InvoiceTemplate = 'modern') {
    this.data = data;
    this.template = template;
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  }

  generate(): string {
    if (this.template === 'modern') {
      this.generateModernInvoice();
    } else {
      this.generateClassicInvoice();
    }
    return this.doc.output('datauristring');
  }

  private generateModernInvoice(): void {
    const doc = this.doc;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Header with gradient-like effect (using multiple rectangles)
    doc.setFillColor(45, 55, 72);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Accent color bar
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 5, 60, 'F');

    // Logo/Title area
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', margin + 15, 25);

    // Invoice number and date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #${this.data.invoiceNumber}`, pageWidth - margin, 20, { align: 'right' });
    doc.text(`Issue Date: ${this.formatDate(this.data.issueDate)}`, pageWidth - margin, 26, { align: 'right' });
    doc.text(`Due Date: ${this.formatDate(this.data.dueDate)}`, pageWidth - margin, 32, { align: 'right' });

    yPos = 75;

    // From/To section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM', margin, yPos);
    doc.text('TO', pageWidth / 2 + 10, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(this.data.from.name, margin, yPos);
    if (this.data.from.address) {
      yPos += 5;
      doc.text(this.data.from.address, margin, yPos);
    }
    if (this.data.from.city || this.data.from.zip) {
      yPos += 5;
      doc.text(`${this.data.from.city || ''} ${this.data.from.zip || ''}`.trim(), margin, yPos);
    }
    if (this.data.from.country) {
      yPos += 5;
      doc.text(this.data.from.country, margin, yPos);
    }
    if (this.data.from.email) {
      yPos += 5;
      doc.text(this.data.from.email, margin, yPos);
    }
    if (this.data.from.phone) {
      yPos += 5;
      doc.text(this.data.from.phone, margin, yPos);
    }

    // To section
    let toYPos = yPos - (this.data.from.email || this.data.from.phone ? 25 : 20);
    doc.text(this.data.to.name, pageWidth / 2 + 10, toYPos);
    if (this.data.to.address) {
      toYPos += 5;
      doc.text(this.data.to.address, pageWidth / 2 + 10, toYPos);
    }
    if (this.data.to.city || this.data.to.zip) {
      toYPos += 5;
      doc.text(`${this.data.to.city || ''} ${this.data.to.zip || ''}`.trim(), pageWidth / 2 + 10, toYPos);
    }
    if (this.data.to.country) {
      toYPos += 5;
      doc.text(this.data.to.country, pageWidth / 2 + 10, toYPos);
    }
    if (this.data.to.email) {
      toYPos += 5;
      doc.text(this.data.to.email, pageWidth / 2 + 10, toYPos);
    }

    yPos = Math.max(yPos, toYPos) + 15;

    // Items table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos - 7, pageWidth - 2 * margin, 8, 'F');
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos - 7, pageWidth - margin, yPos - 7);
    doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const imageColWidth = 15; // Width for image column
    doc.text('Image', margin + 2, yPos - 2);
    doc.text('Description', margin + imageColWidth + 4, yPos - 2);
    doc.text('Qty', margin + 95, yPos - 2);
    doc.text('Price', margin + 110, yPos - 2);
    doc.text('Amount', pageWidth - margin - 2, yPos - 2, { align: 'right' });

    // Add extra spacing after header to prevent image overlap
    // Header bottom line is at yPos + 1, then add sufficient space for images
    const headerBottomY = yPos + 1; // Bottom line of header
    yPos = headerBottomY + 10; // Ensure enough space: 12mm image + 2mm padding = 14mm, but use 10mm to be safe

    // Items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    this.data.items.forEach((item) => {
      const itemStartY = yPos; // Start of this item row
      const imageSize = 12; // Size of product image in mm
      
      // Wrap description if needed (adjust width to account for image column)
      const descriptionStartX = margin + imageColWidth + 4;
      const descriptionWidth = 95 - imageColWidth - 4;
      const descriptionLines = doc.splitTextToSize(item.description, descriptionWidth) as string[];
      
      // Calculate row height based on description lines
      const textHeight = descriptionLines.length * 5; // 5mm per line
      const minRowHeight = Math.max(imageSize + 4, textHeight + 4); // At least image size + padding
      
      // Calculate image vertical position - ensure it's within the row boundaries
      // Position image so it aligns with the first line of text
      // The first line of text baseline is at itemStartY
      // To absolutely prevent overlap with header, position images starting at itemStartY
      // Then offset downward slightly to align better with text
      // Text line is approximately 5mm tall, centered at itemStartY - 2.5mm
      // Image center should be at approximately itemStartY - 2.5mm to align with text
      // If image starts at itemStartY, its center is at itemStartY + imageSize/2 = itemStartY + 6
      // To center with text, we need: itemStartY + offset + imageSize/2 = itemStartY - 2.5
      // So: offset = -2.5 - 6 = -8.5, meaning imageY = itemStartY - 8.5
      // But to prevent overlap, we clamp to not go above itemStartY - imageSize/2
      // This allows images to start slightly above row start but limits the overlap
      const textLineHeight = 5; // Approximate line height in mm
      const textCenterY = itemStartY - textLineHeight / 2; // Vertical center of first text line
      
      // Calculate position to center image with text
      const desiredImageCenterY = textCenterY; // Align with text center
      const calculatedImageTop = desiredImageCenterY - imageSize / 2; // Top position for centering
      
      // Safety clamp: Don't let image start more than imageSize/2 above row start
      // This prevents overlap while maintaining reasonable alignment
      // Since we added 10mm spacing after header, this should be safe
      const safeImageTop = itemStartY - imageSize / 2; // Maximum safe position
      const imageY = Math.max(safeImageTop, calculatedImageTop);
      
      // Add product image if available
      if (item.imageUrl) {
        try {
          // Try to add image (works with data URLs, base64, or URLs)
          doc.addImage(
            item.imageUrl,
            'JPEG', // or 'PNG', 'JPEG' - will try to detect automatically
            margin + 2,
            imageY,
            imageSize,
            imageSize,
            undefined,
            'FAST' // fast rendering
          );
        } catch (error) {
          // If image fails to load, draw a placeholder
          this.drawImagePlaceholder(doc, margin + 2, imageY, imageSize, imageSize);
        }
      } else {
        // Draw placeholder if no image
        this.drawImagePlaceholder(doc, margin + 2, imageY, imageSize, imageSize);
      }
      
      // Draw text content
      descriptionLines.forEach((line: string, index: number) => {
        if (index === 0) {
          doc.text(line, descriptionStartX, yPos);
          doc.text(item.quantity.toString(), margin + 95, yPos);
          doc.text(this.formatCurrency(item.unitPrice), margin + 110, yPos);
          doc.text(
            this.formatCurrency(item.quantity * item.unitPrice),
            pageWidth - margin - 2,
            yPos,
            { align: 'right' }
          );
        } else {
          doc.text(line, descriptionStartX, yPos);
        }
        yPos += 5;
      });

      // Ensure minimum row height for image
      const currentRowHeight = yPos - itemStartY;
      if (currentRowHeight < minRowHeight) {
        yPos = itemStartY + minRowHeight;
      }

      yPos += 2;
    });

    // Totals section
    yPos += 5;
    const totalsX = pageWidth - margin - 60;
    const tableRightEdge = pageWidth - margin - 2; // Right edge of the table (where Amount column ends)
    const totalsRightAlignX = tableRightEdge; // Right alignment position for all summary values
    const totalBackgroundPadding = 3; // Padding on the right of the total background (mm)

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, yPos, tableRightEdge, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(this.formatCurrency(this.data.subtotal), totalsRightAlignX, yPos, { align: 'right' });

    if (this.data.tax && this.data.tax > 0) {
      yPos += 7;
      doc.text(`Tax (${this.data.taxRate || 0}%):`, totalsX, yPos);
      doc.text(this.formatCurrency(this.data.tax), totalsRightAlignX, yPos, { align: 'right' });
    }

    yPos += 10;
    // Draw purple background - extend slightly beyond text with padding
    const totalBackgroundRightEdge = totalsRightAlignX + totalBackgroundPadding;
    const totalBackgroundWidth = totalBackgroundRightEdge - (totalsX - 5);
    doc.setFillColor(99, 102, 241);
    doc.rect(totalsX - 5, yPos - 8, totalBackgroundWidth, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', totalsX, yPos);
    doc.text(this.formatCurrency(this.data.total), totalsRightAlignX, yPos, { align: 'right' });

    // Notes section
    if (this.data.notes) {
      yPos += 20;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(this.data.notes, pageWidth - 2 * margin) as string[];
      notesLines.forEach((line: string) => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });
    }

    // Payment terms
    if (this.data.paymentTerms) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Terms:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const termsLines = doc.splitTextToSize(this.data.paymentTerms, pageWidth - 2 * margin) as string[];
      termsLines.forEach((line: string) => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });
    }

    // Footer
    const footerY = pageHeight - 15;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', pageWidth / 2, footerY + 5, { align: 'center' });
  }

  private generateClassicInvoice(): void {
    const doc = this.doc;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    let yPos = margin;

    // Classic header with border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'S');

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(32);
    doc.setFont('times', 'bold');
    doc.text('INVOICE', margin + 5, yPos + 20);

    // Invoice details in header
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.text(`Invoice Number: ${this.data.invoiceNumber}`, pageWidth - margin - 5, yPos + 10, { align: 'right' });
    doc.text(`Issue Date: ${this.formatDate(this.data.issueDate)}`, pageWidth - margin - 5, yPos + 16, { align: 'right' });
    doc.text(`Due Date: ${this.formatDate(this.data.dueDate)}`, pageWidth - margin - 5, yPos + 22, { align: 'right' });

    yPos += 50;

    // From/To section with classic styling
    const fromToWidth = (pageWidth - 2 * margin) / 2 - 10;
    
    // From box
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPos, fromToWidth, 50, 'S');
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('FROM', margin + 5, yPos + 8);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    let fromY = yPos + 15;
    doc.text(this.data.from.name, margin + 5, fromY);
    if (this.data.from.address) {
      fromY += 5;
      doc.text(this.data.from.address, margin + 5, fromY);
    }
    if (this.data.from.city || this.data.from.zip) {
      fromY += 5;
      doc.text(`${this.data.from.city || ''} ${this.data.from.zip || ''}`.trim(), margin + 5, fromY);
    }
    if (this.data.from.country) {
      fromY += 5;
      doc.text(this.data.from.country, margin + 5, fromY);
    }
    if (this.data.from.email) {
      fromY += 5;
      doc.text(this.data.from.email, margin + 5, fromY);
    }

    // To box
    const toX = margin + fromToWidth + 20;
    doc.setDrawColor(200, 200, 200);
    doc.rect(toX, yPos, fromToWidth, 50, 'S');
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text('TO', toX + 5, yPos + 8);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    let toY = yPos + 15;
    doc.text(this.data.to.name, toX + 5, toY);
    if (this.data.to.address) {
      toY += 5;
      doc.text(this.data.to.address, toX + 5, toY);
    }
    if (this.data.to.city || this.data.to.zip) {
      toY += 5;
      doc.text(`${this.data.to.city || ''} ${this.data.to.zip || ''}`.trim(), toX + 5, toY);
    }
    if (this.data.to.country) {
      toY += 5;
      doc.text(this.data.to.country, toX + 5, toY);
    }
    if (this.data.to.email) {
      toY += 5;
      doc.text(this.data.to.email, toX + 5, toY);
    }

    yPos += 60;

    // Items table with classic borders
    const tableY = yPos;
    const tableHeight = 8 + (this.data.items.length * 8);
    
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, tableY, pageWidth - 2 * margin, 8, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(margin, tableY, pageWidth - 2 * margin, tableHeight, 'S');
    doc.line(margin + 80, tableY, margin + 80, tableY + tableHeight);
    doc.line(margin + 95, tableY, margin + 95, tableY + tableHeight);
    doc.line(margin + 120, tableY, margin + 120, tableY + tableHeight);
    doc.line(margin, tableY + 8, pageWidth - margin, tableY + 8);

    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.text('Description', margin + 5, tableY + 6);
    doc.text('Qty', margin + 82, tableY + 6);
    doc.text('Price', margin + 97, tableY + 6);
    doc.text('Amount', pageWidth - margin - 5, tableY + 6, { align: 'right' });

    // Items rows
    let itemY = tableY + 8;
    doc.setFont('times', 'normal');
    this.data.items.forEach((item, index) => {
      if (index > 0) {
        doc.line(margin, itemY, pageWidth - margin, itemY);
      }
      const descriptionLines = doc.splitTextToSize(item.description, 70) as string[];
      descriptionLines.forEach((line: string, lineIndex: number) => {
        if (lineIndex === 0) {
          doc.text(line, margin + 5, itemY + 5);
          doc.text(item.quantity.toString(), margin + 82, itemY + 5);
          doc.text(this.formatCurrency(item.unitPrice), margin + 97, itemY + 5);
          doc.text(
            this.formatCurrency(item.quantity * item.unitPrice),
            pageWidth - margin - 5,
            itemY + 5,
            { align: 'right' }
          );
        } else {
          doc.text(line, margin + 5, itemY + 5);
        }
        itemY += 5;
      });
      itemY += 3;
    });

    yPos = itemY + 10;

    // Totals section
    const totalsX = pageWidth - margin - 60;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(this.formatCurrency(this.data.subtotal), pageWidth - margin - 5, yPos, { align: 'right' });

    if (this.data.tax && this.data.tax > 0) {
      yPos += 7;
      doc.text(`Tax (${this.data.taxRate || 0}%):`, totalsX, yPos);
      doc.text(this.formatCurrency(this.data.tax), pageWidth - margin - 5, yPos, { align: 'right' });
    }

    yPos += 10;
    doc.setLineWidth(1);
    doc.line(totalsX - 5, yPos - 5, pageWidth - margin - 5, yPos - 5);
    
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text('Total:', totalsX, yPos);
    doc.text(this.formatCurrency(this.data.total), pageWidth - margin - 5, yPos, { align: 'right' });

    // Notes and payment terms
    if (this.data.notes || this.data.paymentTerms) {
      yPos += 20;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 40, 'S');
      
      doc.setFontSize(9);
      doc.setFont('times', 'bold');
      
      if (this.data.notes) {
        doc.text('Notes:', margin + 5, yPos);
        doc.setFont('times', 'normal');
        const notesLines = doc.splitTextToSize(this.data.notes, pageWidth - 2 * margin - 10) as string[];
        notesLines.forEach((line: string, index: number) => {
          doc.text(line, margin + 5, yPos + 8 + (index * 5));
        });
      }

      if (this.data.paymentTerms) {
        const termsY = yPos + (this.data.notes ? 20 : 0);
        doc.setFont('times', 'bold');
        doc.text('Payment Terms:', margin + 5, termsY);
        doc.setFont('times', 'normal');
        const termsLines = doc.splitTextToSize(this.data.paymentTerms, pageWidth - 2 * margin - 10) as string[];
        termsLines.forEach((line: string, index: number) => {
          doc.text(line, margin + 5, termsY + 8 + (index * 5));
        });
      }
    }

    // Classic footer
    const footerY = pageHeight - 20;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('times', 'italic');
    doc.text('This is a computer-generated invoice. No signature required.', pageWidth / 2, footerY + 5, { align: 'center' });
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  private formatCurrency(amount: number): string {
    const currency = this.data.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  private drawImagePlaceholder(doc: jsPDF, x: number, y: number, width: number, height: number): void {
    // Draw a styled placeholder box
    doc.setFillColor(241, 245, 249);
    doc.rect(x, y, width, height, 'F');
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(x, y, width, height, 'S');
    
    // Draw a simple image icon using lines
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const iconSize = width * 0.3;
    
    doc.setDrawColor(200, 205, 210);
    doc.setLineWidth(0.5);
    // Draw a simple rectangle icon
    doc.rect(centerX - iconSize / 2, centerY - iconSize / 2, iconSize, iconSize, 'S');
    // Draw diagonal lines to indicate image
    doc.line(centerX - iconSize / 2, centerY - iconSize / 2, centerX + iconSize / 2, centerY + iconSize / 2);
  }
}


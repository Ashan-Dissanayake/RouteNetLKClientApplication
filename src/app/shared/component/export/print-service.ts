import {Injectable} from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class PrintService {

  constructor() {}

  async  generateStructuredPdf(
    title: string,
    columns: { key: string; header: string }[] | undefined,
    data: any[],
    fileName = 'report.pdf'
  ): Promise<any> {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Title
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    // Optional meta info (date, printed by, etc.)
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    // Table
    if (columns) {
      autoTable(doc, {
        startY: 28,
        head: [columns.map(c => c.header)],
        body: data.map(row =>
          columns.map(c => this.getValueByPath(row, c.key))
        ),
        theme: 'plain',
        headStyles: {fillColor: [22, 160, 133]},
        alternateRowStyles: {fillColor: [240, 240, 240]},
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: 'left',
          valign: 'middle'
        },
        margin: {left: 14, right: 14},
        didDrawPage: (data) => {
          // Footer
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(9);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            doc.internal.pageSize.getWidth() - 40,
            doc.internal.pageSize.getHeight() - 10
          );
        }
      });
    }
    doc.save(fileName);
    return Promise.resolve();
  }

  // Helper: Get deep value using dot notation
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : '';
    }, obj);
  }
}

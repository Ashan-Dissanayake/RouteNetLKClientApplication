import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';

export function exportToExcel<T>(
  data: T[],
  columns: { key: string; header: string }[],
  fileName: string = 'export.xlsx'
): void {
  if (!data || !data.length) {
    console.warn('No data to export.');
    return;
  }

  // Prepare data
  const sheetData = data.map((row) => {
    const obj: any = {};
    columns.forEach((col) => {
      const value = col.key.split('.').reduce((acc: any, part) => acc?.[part], row);
      obj[col.header] = value ?? '';
    });
    return obj;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(sheetData);

  // Auto column width
  worksheet['!cols'] = columns.map((col) => ({
    wch: Math.max(col.header.length + 2, ...sheetData.map(r => (r[col.header]?.toString().length ?? 0))) + 2
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Export file
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
}

import {Injectable} from '@angular/core';
import {exportToExcel} from './excel-export.util';
import {DialogService, PrintDialogOptions} from '../../../core/dialog.service';
import {Branch} from '../../../features/branchmodule/model/branch';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ExportService {

  constructor(private dialogService: DialogService) {}

  exportToExcel<T>(data: T[], columns: any, fileName: string): boolean {
    if (!data || data.length === 0) {
      this.dialogService.showWarning('Please select at least one record to export.');
      return false;
    }
    return exportToExcel(data, columns, fileName);
  }

  exportToPdf<T>(options: PrintDialogOptions): Observable<Set<T> | null> {
    if (!options.data || options.data.length === 0) {
      this.dialogService.showWarning('Please select at least one record to print.');
      return of(null);
    }

    return this.dialogService.showPrintDialog({
      title: options.title,
      mode: options.mode,
      data:options.data,
      columns: options.columns
    }).pipe(
      map(result => result ? new Set<T>() : null)
    );
  }
}


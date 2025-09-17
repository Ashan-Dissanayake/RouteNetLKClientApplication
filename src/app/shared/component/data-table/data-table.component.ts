import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ContentChildren,
  EventEmitter,
  Input,
  input,
  OnChanges,
  OnDestroy,
  Output, QueryList, SimpleChanges,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import {TableCellDirective} from './table-cell.directive';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';

export interface ColumnDef {
  key: string;
  label: string;
  cellTemplate?: any; // TemplateRef<any> (any to avoid import in expressions)
}

@Component({
  selector: 'app-data-table',
  imports: [
    MatTable,
    MatHeaderCell,
    MatSort,
    NgForOf,
    MatColumnDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRowDef,
    MatRow,
    MatPaginator,
    NgIf,
    NgTemplateOutlet,
    MatSortHeader,
    MatHeaderCellDef,
    MatCheckbox,
    FormsModule
  ],
  templateUrl: './data-table.component.html',
  standalone: true,
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent implements OnChanges, AfterViewInit {

  @Input() data: any[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() sortable = false;
  @Input() paginatable = false;
  @Input() pageSizeOptions: number[] = [5, 10, 25];

  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();


  @ContentChildren(TableCellDirective) customCellTemplates!: QueryList<TableCellDirective>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private templatesMap = new Map<string, any>();

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.dataSource.data = this.data ?? [];
      this.cdr.markForCheck();
    }
    if (changes['columns']) {
      // this.displayedColumns = this.columns.map(c => c.key);
      this.displayedColumns = ['select', ...this.columns.map(c => c.key)];
    }
  }

  getValue(row: any, key: string) {
    if (row == null) return '';
    return key.split('.').reduce((acc, part) => acc?.[part], row) ?? '';
  }

  onRowClicked(row: any) {
    this.rowClick.emit(row);
  }

  getTemplateForColumn(key: string) {
    return this.templatesMap.get(key) ?? null;
  }

  // emitAction(action: string, row: any) {
  //   console.log("2111111111111111")
  //   this.actionClick.emit({ action, row });
  // }

  // trackByRow(index: number, item: any) {
  //   return item?.id ?? index;
  // }

  private mapCustomTemplates() {
    this.templatesMap.clear();
    if (!this.customCellTemplates) return;

    this.customCellTemplates.forEach(dir => {
      this.templatesMap.set(dir.name, dir.template);
    });

    // also check column.cellTemplate if passed
    for (const col of this.columns) {
      if (col.cellTemplate) {
        this.templatesMap.set(col.key, col.cellTemplate);
      }
    }
  }

  ngAfterViewInit() {
    // Map templates
    this.mapCustomTemplates();

    if (this.sortable && this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginatable && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    // Watch for dynamically added templates
    this.customCellTemplates.changes.subscribe(() => {
      this.mapCustomTemplates();
      this.cdr.markForCheck();
    });

    this.cdr.markForCheck();
  }

}

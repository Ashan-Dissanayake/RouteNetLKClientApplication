import {
  AfterViewInit, ChangeDetectorRef,
  Component, ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output, QueryList, SimpleChanges,
  ViewChild
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
import {NgClass, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';


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
    FormsModule,
    NgClass,
  ],
  templateUrl: './data-table.component.html',
  standalone: true,
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T = any> implements OnChanges, AfterViewInit {

  @Input() data: any[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() sortable = false;
  @Input() paginatable = false;
  @Input() pageSizeOptions: number[] = [8, 16, 24];
  @Input() tableClass: string | string[] = '';

  @Output() rowClick = new EventEmitter<T>();
  @Output() actionClick = new EventEmitter<ActionEvent<T>>();
  @Output() checkBoxClick = new EventEmitter<CheckboxEvent<T>>();
  @Output() selectAllClick = new EventEmitter<boolean>();


  @ContentChildren(TableCellDirective) customCellTemplates!: QueryList<TableCellDirective>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private templatesMap = new Map<string, any>();

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      // avoid mutating input
      this.dataSource.data = [...(this.data ?? [])];
      this.cdr.markForCheck();
    }
    if (changes['columns']) {
      this.displayedColumns = ['select', ...this.columns.map(c => c.key)];
    }
  }

  getValue(row: T, key: string) {
    if (row == null) return '';
    return key.split('.').reduce((acc: any, part) => acc?.[part], row) ?? '';
  }

  onRowClicked(row: T) {

    this.rowClick.emit(row);
  }

  onActionClicked(action: string, row: T) {
    this.actionClick.emit({ action, row });
  }

  onCheckBoxChanged(row: T, checked: boolean) {
    this.checkBoxClick.emit({ row, checked });
  }

  toggleSelectAll(checked: boolean) {
    // Update rows immutably
    this.dataSource.data = this.dataSource.data.map(r => ({
      ...r,
      selected: checked
    }));
    this.selectAllClick.emit(checked);
  }

  getTemplateForColumn(key: string) {
    return this.templatesMap.get(key) ?? null;
  }

  private mapCustomTemplates() {
    this.templatesMap.clear();
    if (!this.customCellTemplates) return;

    this.customCellTemplates.forEach(dir => {
      this.templatesMap.set(dir.name, dir.template);
    });

    for (const col of this.columns) {
      if (col.cellTemplate) {
        this.templatesMap.set(col.key, col.cellTemplate);
      }
    }
  }

  ngAfterViewInit() {
    this.mapCustomTemplates();

    if (this.sortable && this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginatable && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    this.customCellTemplates.changes.subscribe(() => {
      this.mapCustomTemplates();
      this.cdr.markForCheck();
    });

    this.cdr.markForCheck();
  }

}

export interface ActionEvent<T = any> {
  action: string;
  row: T;
}

export interface CheckboxEvent<T = any> {
  row: T;
  checked: boolean;
}

export interface ColumnDef {
  key: string;
  label: string;
  cellTemplate?: any;
}

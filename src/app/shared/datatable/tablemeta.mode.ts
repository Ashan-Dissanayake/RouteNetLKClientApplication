export interface TableColumn {
  name: string;            // field name from API
  label: string;           // header label
  sortable?: boolean;      // allow sorting
  type?: 'text' | 'date' | 'status' | 'actions'; // rendering type
  format?: string;         // date/number format
  statusConfig?: {         // only if type = 'status'
    [key: string]: { color: string; label?: string };
  };
  actions?: TableAction[]; // row-level actions
}

export interface TableAction {
  name: string;   // e.g. 'view', 'mark'
  icon?: string;  // Angular Material icon
  tooltip?: string;
  callback?: string; // name of handler in component/service
}

export interface TableMeta {

  columns: TableColumn[];
  pagination?: boolean;
  pageSizeOptions?: number[];
  apiUrl?: string; // optional if tied to backend
}

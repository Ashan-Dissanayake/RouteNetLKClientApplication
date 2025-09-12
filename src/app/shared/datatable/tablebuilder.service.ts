import {Injectable} from '@angular/core';
import {TableMeta} from './tablemeta.mode';

@Injectable({ providedIn: 'root' })
export class TableBuilderService {

  buildTable(meta: TableMeta, data: any[]): any[] {
    return data.map(row => {
      const transformed: any = {};
      meta.columns.forEach(col => {
        if (col.type === 'status' && col.statusConfig) {
          transformed[col.name] = {
            value: row[col.name],
            ...col.statusConfig[row[col.name]]
          };
        } else {
          transformed[col.name] = row[col.name];
        }
      });
      return transformed;
    });
  }

}

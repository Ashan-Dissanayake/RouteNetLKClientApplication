import {FormField} from '../shared/models/formfieldata.model';
import {ButtonAction} from '../shared/component/button/button-panel/button-panel.component';

export interface CrudPageConfig {
  tableColumns: {
    key: string;
    label: string;
  }[];

  filterFormMeta: FormField[];

  mainFormMeta: FormField[];

  exportMeta: {
    key: string;
    header: string;
  }[];

  actionPanel: ButtonAction[];

  moduleName: string;

  excelFileName: string;

  immutableControllers?: string[];
}

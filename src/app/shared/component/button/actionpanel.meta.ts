import {ButtonAction} from './button-panel/button-panel.component';

export const BASE_ACTION_PANEL_META: ButtonAction[] = [
  {label: 'Create', type: 'create', icon: 'add'},
  {
    label: 'Export',
    type: 'export',
    icon: 'download',
    dropdown: [
      {label: 'pdf', type: 'export-pdf'},
      {label: 'Excel', type: 'export-excel'}
    ]
  },
  {label: 'Deactivate', type: 'bulk-deactivate', icon: 'delete', disabled: false},
  {label: 'Clear Search', type: 'clear-search', icon: 'cancel'}
];

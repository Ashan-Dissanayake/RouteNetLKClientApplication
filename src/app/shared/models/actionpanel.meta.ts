import {ButtonAction} from '../component/button/button-panel/button-panel.component';

export const ActionPanelMeta: ButtonAction[] = [
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

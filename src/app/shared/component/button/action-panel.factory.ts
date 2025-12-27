import {ButtonAction} from './button-panel/button-panel.component';
import {BASE_ACTION_PANEL_META} from './actionpanel.meta';

export interface ActionPanelConfig {
  include?: ButtonAction['type'][];
  exclude?: ButtonAction['type'][];
}

export function buildActionPanel(
  config: ActionPanelConfig = {}
): ButtonAction[] {
  let actions = [...BASE_ACTION_PANEL_META];

  if (config.include?.length) {
    actions = actions.filter(a => config.include!.includes(a.type));
  }

  if (config.exclude?.length) {
    actions = actions.filter(a => !config.exclude!.includes(a.type));
  }

  return actions;
}

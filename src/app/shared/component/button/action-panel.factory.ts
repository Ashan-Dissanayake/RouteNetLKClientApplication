import {ButtonAction} from './button-panel/button-panel.component';
import {BASE_ACTION_PANEL_META} from './actionpanel.meta';

export interface ActionPanelConfig {
  include?: ButtonAction['type'][];
  exclude?: ButtonAction['type'][];
  permissionMap?: Record<string, string | string[]>;
}

export function buildActionPanel(config: ActionPanelConfig = {}): ButtonAction[] {

  // Deep clone to prevent mutating global metadata
  let actions = BASE_ACTION_PANEL_META.map(action => ({
    ...action,
    dropdown: action.dropdown
      ? action.dropdown.map(item => ({ ...item }))
      : undefined
  }));

  // Include only specified actions
  if (config.include?.length) {
    actions = actions.filter(action =>
      config.include!.includes(action.type)
    );
  }

  // Exclude specified actions
  if (config.exclude?.length) {
    actions = actions.filter(action =>
      !config.exclude!.includes(action.type)
    );
  }

  // Apply permission mappings
  if (config.permissionMap) {

    actions.forEach(action => {

      const permission = config.permissionMap![action.type];
      if (permission) {
        action.permission = permission;
      }

      action.dropdown?.forEach(subAction => {
        const subPermission = config.permissionMap![subAction.type];
        if (subPermission) {
          subAction.permission = subPermission;
        }
      });

    });

  }

  return actions;
}

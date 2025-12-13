import {FormGroup} from '@angular/forms';

export class FormUtils {

  static getInvalidControls(form: FormGroup): string[] {
    return Object.keys(form.controls).filter(key => form.get(key)?.invalid);
  }

  static getUpdatedValues(form: FormGroup): Record<string, any> {
    return Object.entries(form.controls)
      .filter(([_, control]) => control.dirty)
      .reduce((acc, [key, control]) => ({
        ...acc, [key]:control.value }),
        {} );
  }

  static resetForm(form: FormGroup): void {
    form.reset();
    Object.values(form.controls).forEach(control => control.markAsPristine());
  }

  static formatLabel(field: string): string {
    return field
      .replace(/[_\-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  }



  static normalizeObject(obj: any, rules: NormalizationRule[]) {
    const result = { ...obj };

    rules.forEach(rule => {
      const fromKeys = rule.from.split('.');
      let value = result;

      // Traverse to get the value
      for (const key of fromKeys) {
        value = value?.[key];
        if (value === undefined) break;
      }

      // Assign to new key
      result[rule.to] = value ?? null;

      // Remove original top-level key if requested
      if (rule.remove) {
        delete result[fromKeys[0]];
      }
    });

    return result;
  }

  static setFormControlsState(
    form: FormGroup,
    controls: string[],
    disabled: boolean
  ) {
    controls.forEach(control => {
      const ctrl = form.get(control);
      if (ctrl) {
        disabled ? ctrl.disable() : ctrl.enable();
      }
    });
  }

}

type NormalizationRule = {
  from: string; // path to extract, e.g., 'seatingcapacity.make'
  to: string;   // new key, e.g., 'make'
  remove?: boolean; // whether to remove the original key
};

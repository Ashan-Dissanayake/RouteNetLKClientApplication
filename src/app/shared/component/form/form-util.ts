// form-utils.ts
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

  static formatLabel(field: string): string {
    return field
      .replace(/[_\-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

}

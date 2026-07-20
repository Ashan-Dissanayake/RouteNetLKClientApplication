import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export class UserValidators {

  static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const password = form.get(passwordField)?.value;
      const confirmPassword = form.get(confirmPasswordField)?.value;

      if (!password || !confirmPassword) return null;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }


  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) return null;

      const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value);

      return valid ? null : {weakPassword:true};
    };
  }

}

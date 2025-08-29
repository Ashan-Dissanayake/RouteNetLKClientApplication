import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Apierror} from '../shared/models/apierror.model';

export const globalHttpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {

      let msg = 'Unexpected error occurred';

      if (err.error) {
        const body = err.error;
        msg = body.title ?? msg;
        if (body.details?.length) {
          msg += ': ' + body.details.join(', ');
        }
      }
      console.error('API Error:', msg);

      return throwError(() => new Error(msg));
    })
  );
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const globalHttpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {

      let finalErrorMessage = 'Unexpected error occurred';
      let errorBody: any = err.error;

      // 1. Check if the error is a string and try to parse it (Robustness check)
      if (typeof errorBody === 'string') {
        try {
          errorBody = JSON.parse(errorBody);
        } catch (e) {
          // If parsing fails, use the raw string as the message
          finalErrorMessage = errorBody;
          console.error('API Error: Non-JSON String Body:', finalErrorMessage);
          return throwError(() => new Error(finalErrorMessage));
        }
      }

      // 2. Process the body (now guaranteed to be an object or null)
      if (errorBody && typeof errorBody === 'object') {
        const body = errorBody as { title?: string, details?: string[] };

        // Start the message with the title
        if (body.title) {
          finalErrorMessage = body.title;
        }

        // Append the details
        if (body.details?.length) {
          if (body.title) {
            finalErrorMessage += ': ';
          }
          finalErrorMessage += body.details.join(', ');
        }
      }

      // 3. This log should now be hit and show the combined message
      console.error('API Final Error Message:', finalErrorMessage);

      return throwError(() => new Error(finalErrorMessage));
    })
  );
};

import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract a clean, friendly message or list of details
        // Pass the message forward. You can append it to the error object directly
        // without spreading the whole HttpErrorResponse prototype.
        (error as any).friendlyMessage = this.extractUserMessage(error);

        return throwError(() => error);
      })
    );
  }

  private extractUserMessage(error: HttpErrorResponse): string {
    const err = error.error;

    // If details array exists, join them with a newline or bullet points
    if (err?.details && Array.isArray(err.details)) {
      return err.details.join('\n');
    }

    if (err?.title) return err.title;

    return 'An unexpected error occurred. Please try again.';
  }
}

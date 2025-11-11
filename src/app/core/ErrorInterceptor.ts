import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.extractUserMessage(error);
        // Replace original error with one containing the clean message
        return throwError(() => ({
          ...error,
          errorMessage
        }));
      })
    );
  }

  private extractUserMessage(error: HttpErrorResponse): string {
    const err = error.error;
    if (err?.details?.length) return err.details[0];
    if (err?.title) return err.title;
    return 'An unexpected error occurred. Please try again.';
  }
}

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Optional check: is token expired?
    if (authService.isTokenExpired()) {
      authService.logout();
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    return true;
  }

  // Redirect to login page and save return URL
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};


import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { jwtDecode } from 'jwt-decode';
import { ApiEndpoints } from '../core/api-endpoints';
import { ApiResponse } from '../shared/models/apiresponse.model';

export interface AuthData {
  username: string;
  token: string;
  authorities: { authority: string }[];
}

export interface UserProfile {
  username: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // Signals for reactive state
  currentUser = signal<UserProfile | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.currentUser());

  constructor(
    private http:HttpClient,
    private permissionsService:NgxPermissionsService,
  ) {
    // If a user was already logged in on page load, load their permissions
    const user = this.currentUser();
    if (user) {
      this.permissionsService.loadPermissions(user.roles);
    }
  }

  login(credentials: { username: string; password: string }): Observable<ApiResponse<AuthData, false>> {
    return this.http.post<ApiResponse<AuthData, false>>(ApiEndpoints.LOGIN, credentials).pipe(
      tap(response => {
        const authData = response.data;
        this.saveSession(authData);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.permissionsService.flushPermissions();
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.userId ?? decoded.id ?? (decoded.userId ? Number(decoded.userId) : null);
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return false;
      const expirationDate = new Date(decoded.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }

  private saveSession(data: AuthData): void {
    localStorage.setItem(this.TOKEN_KEY, data.token);

    const userProfile: UserProfile = {
      username: data.username,
      roles: data.authorities.map(a => a.authority)
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(userProfile));
    this.permissionsService.loadPermissions(userProfile.roles);
    this.currentUser.set(userProfile);
  }

  private getStoredUser(): UserProfile | null {
    const stored = localStorage.getItem(this.USER_KEY);
    if (!stored) return null;

    // Check token validity
    if (this.isTokenExpired()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}

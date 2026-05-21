import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import {
  Observable,
  tap
} from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ApiResponse,
  AuthRequest,
  AuthResponse
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl;

  private readonly TOKEN_KEY = 'token';

  private readonly USERNAME_KEY = 'username';

  private readonly ROLE_KEY = 'role';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(
    request: AuthRequest
  ): Observable<ApiResponse<AuthResponse>> {

    return this.http
      .post<ApiResponse<AuthResponse>>(
        `${this.apiUrl}/auth/login`,
        request
      )
      .pipe(

        tap((res) => {

          if (res?.success && res?.data) {

            localStorage.setItem(
              this.TOKEN_KEY,
              res.data.token
            );

            localStorage.setItem(
              this.USERNAME_KEY,
              res.data.username
            );

            localStorage.setItem(
              this.ROLE_KEY,
              res.data.role
            );
          }
        })
      );
  }

  logout(): void {

    this.clearSession();

    this.router.navigate(['/login']);
  }

  clearSession(): void {

    localStorage.removeItem(this.TOKEN_KEY);

    localStorage.removeItem(this.USERNAME_KEY);

    localStorage.removeItem(this.ROLE_KEY);
  }

  getToken(): string | null {

    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string | null {

    return localStorage.getItem(this.USERNAME_KEY);
  }

  getRole(): string | null {

    return localStorage.getItem(this.ROLE_KEY);
  }

  isLoggedIn(): boolean {

    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {

      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      const expiry = payload.exp * 1000;

      if (Date.now() > expiry) {

        this.clearSession();

        return false;
      }

      return true;

    } catch {

      this.clearSession();

      return false;
    }
  }
}
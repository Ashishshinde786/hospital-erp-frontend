import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthRequest, AuthResponse } from '../models/models';

/*
=========================================================
SERVICE: AuthService
=========================================================

PURPOSE:
--------
This service manages authentication for the application.

It is responsible for:
- Sending login request to backend
- Storing authentication data (JWT token, user info)
- Providing helper methods for auth state
- Handling logout and navigation

---------------------------------------------------------

WHERE IT FITS:
--------------
LoginComponent → AuthService → HttpClient → Backend

Also used by:
- authGuard → checks login status
- jwtInterceptor → gets token for API calls

---------------------------------------------------------

WHY THIS SERVICE:
-----------------
- Centralizes authentication logic
- Avoids duplication across components
- Provides reusable helper methods
- Keeps components clean

=========================================================
*/

@Injectable({
  providedIn: 'root' // Singleton across application
})
export class AuthService {

  /*
  ---------------------------------------------------------
  BASE API URL

  Example:
  environment.apiUrl = http://localhost:8080/api
  ---------------------------------------------------------
  */
  private apiUrl = environment.apiUrl;

  /*
  ---------------------------------------------------------
  Inject dependencies:
  - HttpClient → API calls
  - Router → navigation after logout
  ---------------------------------------------------------
  */
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}



  /*
  =========================================================
  LOGIN METHOD
  =========================================================

  API:
  POST /auth/login

  BODY:
  {
    username: string,
    password: string
  }

  FLOW:
  -----
  1. Send login request to backend
  2. Receive JWT token + user info
  3. Store in localStorage
  4. Return response to component

  NOTE:
  - tap() is used for side-effects (storage)
  - Does NOT modify response

  =========================================================
  */
  login(request: AuthRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(
        `${this.apiUrl}/auth/login`,
        request
      )
      .pipe(
        tap(res => {

          /*
          -------------------------------------------------
          Store data ONLY if login successful
          -------------------------------------------------
          */
          if (res.success) {

            // Store JWT token (used by interceptor)
            localStorage.setItem('token', res.data.token);

            // Store user info (used in UI)
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('role', res.data.role);
          }
        })
      );
  }



  /*
  =========================================================
  LOGOUT METHOD
  =========================================================

  PURPOSE:
  --------
  - Clear all stored authentication data
  - Redirect user to login page

  USED BY:
  --------
  - Logout button
  - jwtInterceptor (on 401 error)

  =========================================================
  */
  logout(): void {

    // Clear all stored data (token, user info)
    localStorage.clear();

    // Redirect to login page
    this.router.navigate(['/login']);
  }



  /*
  =========================================================
  GET TOKEN
  =========================================================

  PURPOSE:
  --------
  - Used by jwtInterceptor to attach token in requests

  RETURNS:
  --------
  string | null (if not found)
  */
  getToken(): string | null {
    return localStorage.getItem('token');
  }



  /*
  =========================================================
  GET USERNAME
  =========================================================

  PURPOSE:
  --------
  - Display logged-in user in UI (header/navbar)
  */
  getUsername(): string | null {
    return localStorage.getItem('username');
  }



  /*
  =========================================================
  GET ROLE
  =========================================================

  PURPOSE:
  --------
  - Role-based access control (ADMIN, DOCTOR, etc.)
  */
  getRole(): string | null {
    return localStorage.getItem('role');
  }



  /*
  =========================================================
  CHECK LOGIN STATUS
  =========================================================

  PURPOSE:
  --------
  - Used by authGuard to allow/block routes

  LOGIC:
  ------
  - If token exists → user is considered logged in

  NOTE:
  -----
  - Basic check (does NOT validate token expiry)
  - Advanced apps decode JWT and check expiration

  =========================================================
  */
  isLoggedIn(): boolean {
    return !!this.getToken(); // converts to boolean
  }
}
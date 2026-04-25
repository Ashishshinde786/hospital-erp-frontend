import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/*
=========================================================
HTTP INTERCEPTOR: jwtInterceptor
=========================================================

PURPOSE:
--------
This interceptor automatically attaches JWT token to every
outgoing HTTP request and handles authentication errors.

- Adds Authorization header (Bearer Token)
- Handles 401 Unauthorized responses globally
- Logs user out if token is invalid/expired

---------------------------------------------------------

WHERE IT FITS IN FLOW:
----------------------
Component → Service → HttpClient → [Interceptor] → Backend API

So every request passes through this interceptor.

---------------------------------------------------------

APPROACH:
---------
1. Get token from AuthService
2. Clone request (immutability rule in Angular)
3. Add Authorization header if token exists
4. Forward request using next()
5. Catch errors using RxJS catchError
6. If 401 → logout user

---------------------------------------------------------

KEY CONCEPTS USED:
------------------
- Functional Interceptor (Angular modern approach)
- Dependency Injection using inject()
- Immutable HTTP Requests (req.clone())
- RxJS Operators (catchError, throwError)
- Centralized Error Handling

=========================================================
*/

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  // Inject AuthService to access authentication data (token, logout)
  const authService = inject(AuthService);

  /*
  ---------------------------------------------------------
  STEP 1: Get JWT token
  ---------------------------------------------------------
  */
  const token = authService.getToken();

  /*
  ---------------------------------------------------------
  STEP 2: Attach token to request (if available)

  NOTE:
  HTTP requests in Angular are IMMUTABLE
  → We must clone the request to modify it
  ---------------------------------------------------------
  */
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Standard JWT format
      }
    });
  }

  /*
  ---------------------------------------------------------
  STEP 3: Forward request to next handler

  Every request must be passed using next(req)
  ---------------------------------------------------------
  */
  return next(req).pipe(

    /*
    -------------------------------------------------------
    STEP 4: Global Error Handling

    catchError intercepts HTTP errors from backend
    -------------------------------------------------------
    */
    catchError((error: HttpErrorResponse) => {

      /*
      -----------------------------------------------------
      CASE: 401 Unauthorized

      Means:
      - Token expired
      - Token invalid
      - User session not valid

      ACTION:
      - Logout user
      - (AuthService should also redirect to login)
      -----------------------------------------------------
      */
      if (error.status === 401) {
        authService.logout();
      }

      /*
      -----------------------------------------------------
      IMPORTANT:
      Re-throw error so component/service can also handle it
      -----------------------------------------------------
      */
      return throwError(() => error);
    })
  );
};
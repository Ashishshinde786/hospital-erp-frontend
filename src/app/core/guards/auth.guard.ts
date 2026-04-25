import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/*
=========================================================
ROUTE GUARD: authGuard
=========================================================

PURPOSE:
--------
This guard protects routes from unauthorized access.

Only logged-in users can access certain pages
like dashboard, patients, appointments, etc.

If user is NOT logged in → redirect to login page

---------------------------------------------------------

APPROACH:
---------
- Use Angular functional guard (modern approach)
- Inject dependencies using `inject()` instead of constructor
- Delegate login check to AuthService
- Redirect using Router if not authenticated

---------------------------------------------------------

WHY THIS DESIGN:
----------------
- Separation of concerns:
    Guard → controls access
    Service → handles authentication logic

- Reusable across multiple routes

- Cleaner and lightweight compared to class-based guards

=========================================================
*/

export const authGuard: CanActivateFn = () => {

  // Inject AuthService to check login status
  const authService = inject(AuthService);

  // Inject Router to handle navigation
  const router = inject(Router);

  /*
  ---------------------------------------------------------
  STEP 1: Check if user is logged in
  ---------------------------------------------------------
  */
  if (authService.isLoggedIn()) {

    // If logged in → allow route access
    return true;
  }

  /*
  ---------------------------------------------------------
  STEP 2: If NOT logged in
  ---------------------------------------------------------
  */

  // Redirect user to login page
  router.navigate(['/login']);

  // Block access to requested route
  return false;
};
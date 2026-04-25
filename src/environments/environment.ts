/*
=========================================================
CONFIG: environment.ts (DEVELOPMENT ENVIRONMENT)
=========================================================

PURPOSE:
--------
This file stores ENVIRONMENT-SPECIFIC CONFIGURATION.

Used to:
- Switch between dev / prod settings
- Centralize API URLs
- Avoid hardcoding values across the app

---------------------------------------------------------

WHY IMPORTANT?
--------------
Instead of writing:
❌ http://localhost:8080/api everywhere

We write:
✔ environment.apiUrl

👉 Clean + maintainable + scalable

---------------------------------------------------------

HOW IT WORKS:
-------------
Angular replaces this file during build:

ng build --configuration=production

Replaces:
environment.ts → environment.prod.ts

=========================================================
*/

export const environment = {

  /*
  =========================================================
  ENVIRONMENT FLAG
  =========================================================

  false → Development mode
  true  → Production mode

  Used for:
  - Logging control
  - Debug features
  */
  production: false,



  /*
  =========================================================
  BASE API URL
  =========================================================

  Backend server base URL

  Used in services like:
  - PatientService
  - DoctorService
  - BillingService
  - etc.

  Example usage:
  --------------
  `${environment.apiUrl}/patients`
  */
  apiUrl: 'http://localhost:8080/api'
};
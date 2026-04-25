import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

/*
=========================================================
CONFIG: appConfig (APPLICATION CONFIGURATION)
=========================================================

PURPOSE:
--------
This is the CENTRAL CONFIGURATION of your Angular app.

It replaces:
❌ AppModule (old Angular way)
✔ Uses modern "bootstrapApplication" approach

---------------------------------------------------------

WHERE USED:
-----------
main.ts

bootstrapApplication(AppComponent, appConfig)

---------------------------------------------------------

WHAT IT DOES:
-------------
Registers GLOBAL SERVICES for the entire app:
- Router
- HTTP Client
- Interceptors
- Global error handling

👉 Think of this as:
"Spring Boot @Configuration class" (Angular version)

=========================================================
*/

export const appConfig: ApplicationConfig = {

  /*
  =========================================================
  GLOBAL PROVIDERS
  =========================================================

  These are available APPLICATION-WIDE
  */
  providers: [

    /*
    ---------------------------------------------------------
    GLOBAL ERROR HANDLING
    ---------------------------------------------------------

    Captures:
    - Runtime errors
    - Unhandled exceptions

    WHY IMPORTANT?
    --------------
    Prevents app crash
    Allows centralized logging
    */
    provideBrowserGlobalErrorListeners(),



    /*
    ---------------------------------------------------------
    ROUTING CONFIGURATION
    ---------------------------------------------------------

    Registers all application routes

    routes → defined in app.routes.ts

    Enables:
    - Navigation (/patients, /dashboard, etc.)
    - Lazy loading (if configured)
    */
    provideRouter(routes),



    /*
    ---------------------------------------------------------
    HTTP CLIENT + INTERCEPTORS
    ---------------------------------------------------------

    Enables:
    - API calls (HttpClient)
    - Request/Response interception

    withInterceptors:
    -----------------
    Registers JWT interceptor globally

    FLOW:
    -----
    Component → Service → HttpClient
       ↓
    Interceptor adds token
       ↓
    Backend API

    RESPONSE FLOW:
    --------------
    Backend → Interceptor → Component

    =========================================================
    */
    provideHttpClient(

      withInterceptors([
        jwtInterceptor   // Attach JWT token + handle 401
      ])
    )

  ]
};
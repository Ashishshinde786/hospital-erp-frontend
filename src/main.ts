import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/*
=========================================================
FILE: main.ts (APPLICATION ENTRY POINT)
=========================================================

PURPOSE:
--------
This is the FIRST TypeScript file executed by Angular.

It is responsible for:
- Bootstrapping (starting) the Angular application
- Connecting AppComponent with global configuration

---------------------------------------------------------

CORE IDEA:
----------
bootstrapApplication() = "Start Angular App"

👉 This replaces:
❌ platformBrowserDynamic().bootstrapModule(AppModule)

✔ Modern Angular uses standalone components

---------------------------------------------------------

BOOTSTRAP FLOW:
---------------
Browser loads index.html
   ↓
<app-root> found
   ↓
main.ts runs
   ↓
bootstrapApplication(AppComponent, appConfig)
   ↓
Angular initializes app
   ↓
AppComponent renders
   ↓
Router takes over

=========================================================
*/

bootstrapApplication(

  /*
  =========================================================
  ROOT COMPONENT
  =========================================================

  This is the main component Angular will render first
  */
  AppComponent,



  /*
  =========================================================
  APPLICATION CONFIG
  =========================================================

  Contains:
  - Router setup
  - HTTP client
  - Interceptors
  - Global providers

  Defined in:
  app.config.ts
  */
  appConfig

)



/*
=========================================================
ERROR HANDLING
=========================================================

If app fails to start:
- Catch error
- Log to console

In production:
👉 Replace with logging service (Sentry, etc.)
*/
.catch((err) => {
  console.error('App bootstrap failed:', err);
});
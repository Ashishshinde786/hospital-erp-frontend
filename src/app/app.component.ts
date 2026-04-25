import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/*
=========================================================
COMPONENT: AppComponent (ROOT COMPONENT)
=========================================================

PURPOSE:
--------
This is the ENTRY POINT of the Angular application.

It is the FIRST component that Angular loads (bootstraps).

---------------------------------------------------------

CORE RESPONSIBILITY:
--------------------
- Acts as ROOT CONTAINER
- Delegates rendering to Angular Router

👉 It does NOT contain business logic
👉 It does NOT contain UI (in this case)

---------------------------------------------------------

ARCHITECTURE ROLE:
------------------
Main bootstrap flow:

index.html
   ↓
main.ts (bootstrapApplication)
   ↓
AppComponent (this)
   ↓
RouterOutlet
   ↓
LayoutComponent / LoginComponent / etc.

---------------------------------------------------------

WHY ONLY <router-outlet>?
-------------------------
This means:
✔ Entire app is ROUTE-DRIVEN
✔ UI is controlled by routing configuration

Example:
- /login     → LoginComponent
- /dashboard → LayoutComponent → DashboardComponent

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Standalone Component
- Root Component (Bootstrap)
- Angular Routing
- SPA (Single Page Application)

=========================================================
*/

@Component({
  selector: 'app-root',

  /*
  =========================================================
  STANDALONE COMPONENT
  =========================================================
  Modern Angular (No NgModule needed)
  */
  standalone: true,

  /*
  =========================================================
  IMPORTS
  =========================================================
  RouterOutlet is required to render routed components
  */
  imports: [RouterOutlet],

  /*
  =========================================================
  TEMPLATE
  =========================================================

  This is a placeholder where Angular loads components
  based on current route

  👉 This is the heart of SPA navigation
  */
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
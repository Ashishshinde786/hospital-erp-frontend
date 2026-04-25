import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

/*
=========================================================
ROUTING CONFIG: app.routes.ts
=========================================================

PURPOSE:
--------
Defines ALL APPLICATION ROUTES.

This controls:
- Navigation flow
- Access control (authGuard)
- Lazy loading of components

---------------------------------------------------------

CORE IDEA:
----------
Routing = Navigation Engine of SPA

👉 Decides:
- Which component loads
- Under what conditions
- Inside which layout

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
AppComponent
   ↓
RouterOutlet
   ↓
Route match
   ↓
Component loads (lazy)

=========================================================
*/

export const routes: Routes = [

  /*
  =========================================================
  PUBLIC ROUTE: LOGIN
  =========================================================

  - No auth required
  - Lazy loaded component

  WHY LAZY LOAD?
  --------------
  Improves performance (loads only when needed)
  */
  {
    path: 'login',

    loadComponent: () =>
      import('./modules/auth/login/login.component')
        .then(m => m.LoginComponent)
  },



  /*
  =========================================================
  PROTECTED ROUTES (MAIN APP)
  =========================================================

  - Wrapped inside LayoutComponent
  - Protected by authGuard

  FLOW:
  -----
  User → tries to access route
      ↓
  authGuard checks login
      ↓
  allowed → load Layout + child
  denied  → redirect to login
  */
  {
    path: '',

    /*
    Layout acts as shell:
    Sidebar + Navbar + RouterOutlet
    */
    component: LayoutComponent,

    /*
    Route Guard (Security)
    */
    canActivate: [authGuard],



    /*
    =========================================================
    CHILD ROUTES (FEATURE MODULES)
    =========================================================
    */
    children: [

      /*
      DASHBOARD
      */
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },



      /*
      PATIENT MANAGEMENT
      */
      {
        path: 'patients',
        loadComponent: () =>
          import('./modules/patients/patient-list/patient-list.component')
            .then(m => m.PatientListComponent)
      },



      /*
      DOCTOR MANAGEMENT
      */
      {
        path: 'doctors',
        loadComponent: () =>
          import('./modules/doctors/doctor-list/doctor-list.component')
            .then(m => m.DoctorListComponent)
      },



      /*
      APPOINTMENT MANAGEMENT
      */
      {
        path: 'appointments',
        loadComponent: () =>
          import('./modules/appointments/appointment-list/appointment-list.component')
            .then(m => m.AppointmentListComponent)
      },



      /*
      BILLING MODULE
      */
      {
        path: 'billing',
        loadComponent: () =>
          import('./modules/billing/invoice-list/invoice-list.component')
            .then(m => m.InvoiceListComponent)
      },



      /*
      PHARMACY MODULE
      */
      {
        path: 'pharmacy',
        loadComponent: () =>
          import('./modules/pharmacy/medicine-list/medicine-list.component')
            .then(m => m.MedicineListComponent)
      },



      /*
      DEFAULT CHILD ROUTE
      ---------------------------------------------------------
      If user hits "/"
      → redirect to "/dashboard"
      */
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },



  /*
  =========================================================
  FALLBACK ROUTE (WILDCARD)
  =========================================================

  If route does NOT match anything:
  → redirect to dashboard

  Example:
  /random-page → dashboard
  */
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
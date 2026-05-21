// src/app/app.routes.ts
//
// FIX: Added /profile route (was missing).
// LayoutComponent import path corrected to match its actual location.

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,   // Authenticated shell (Sidebar + Navbar)
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./modules/patients/patient-list/patient-list.component').then(m => m.PatientListComponent)
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./modules/doctors/doctor-list/doctor-list.component').then(m => m.DoctorListComponent)
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./modules/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent)
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./modules/billing/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
      },
      {
        path: 'pharmacy',
        loadComponent: () =>
          import('./modules/pharmacy/medicine-list/medicine-list.component').then(m => m.MedicineListComponent)
      },
      {
        // NEW: User profile page — view/edit own account details
        path: 'profile',
        loadComponent: () =>
          import('./modules/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
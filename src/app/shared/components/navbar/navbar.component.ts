import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter, map, Subject, takeUntil } from 'rxjs';

/*
=========================================================
COMPONENT: NavbarComponent
=========================================================

PURPOSE:
--------
Top navigation bar that:
- Emits sidebar toggle events
- Shows current page title (derived from route)
- Displays logged-in user info (username, role)
- Displays current date/time

---------------------------------------------------------

ARCHITECTURE ROLE:
------------------
Child of LayoutComponent.

Flow:
Navbar (this)
   ↓ emits toggleSidebar
LayoutComponent (parent)
   ↓ updates sidebarCollapsed state

---------------------------------------------------------

KEY CONCEPTS:
-------------
- EventEmitter (child → parent communication)
- Router events (NavigationEnd) to derive page title
- RxJS operators (filter, map, takeUntil)
- Getters for computed view data
- Dependency Injection (AuthService, Router)
- Memory management (unsubscribe on destroy)

=========================================================
*/

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnDestroy {

  /*
  =========================================================
  OUTPUT: TOGGLE SIDEBAR EVENT
  =========================================================
  */
  @Output() toggleSidebar = new EventEmitter<void>();



  /*
  =========================================================
  STATE: PAGE TITLE
  =========================================================
  Default shown before first navigation event resolves
  */
  pageTitle = 'Dashboard';



  /*
  =========================================================
  ROUTE → TITLE MAP
  =========================================================
  Maps first URL segment to human-readable titles
  */
  private routeTitles: Record<string, string> = {
    dashboard:    'Dashboard',
    patients:     'Patient Management',
    doctors:      'Doctor Management',
    appointments: 'Appointments',
    billing:      'Billing & Invoicing',
    pharmacy:     'Pharmacy'
  };



  /*
  =========================================================
  INTERNAL: DESTROY STREAM (for cleanup)
  =========================================================
  */
  private destroy$ = new Subject<void>();



  /*
  =========================================================
  DEPENDENCIES
  =========================================================
  */
  constructor(
    public authService: AuthService,
    private router: Router
  ) {

    /*
    -----------------------------------------------------
    LISTEN TO ROUTE CHANGES
    -----------------------------------------------------

    We listen to NavigationEnd events to update page title.

    FLOW:
    Router event → extract URL segment → map to title
    */
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),

        map(e => {
          /*
          Extract first segment from URL
          Example:
          /patients/list → "patients"
          */
          const segment =
            e.urlAfterRedirects
              .split('/')[1]
              ?.split('?')[0];

          /*
          Map segment → title
          Fallback → "Hospital ERP"
          */
          return this.routeTitles[segment!] || 'Hospital ERP';
        }),

        takeUntil(this.destroy$) // prevent memory leak
      )
      .subscribe(title => {
        this.pageTitle = title;
      });
  }



  /*
  =========================================================
  GETTERS (DERIVED VIEW DATA)
  =========================================================
  */

  /*
  Username from AuthService
  */
  get username(): string {
    return this.authService.getUsername() || '';
  }



  /*
  Role from AuthService
  */
  get role(): string {
    return this.authService.getRole() || '';
  }



  /*
  Current time (formatted)
  NOTE:
  This recalculates on each change detection cycle
  */
  get currentTime(): string {
    return new Date().toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }



  /*
  =========================================================
  CLEANUP (IMPORTANT)
  =========================================================
  */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
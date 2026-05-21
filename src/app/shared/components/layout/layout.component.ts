// src/app/shared/components/layout/layout.component.ts
//
// FIX: This component was referenced in app.routes.ts but never defined.
// It is the authenticated shell — holds Sidebar + Navbar + router-outlet.

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="app-shell" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Persistent side navigation -->
      <app-sidebar [collapsed]="sidebarCollapsed()"></app-sidebar>

      <!-- Main content area -->
      <div class="main-area">
        <!-- Top bar with page title, clock, user pill -->
        <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>

        <!-- Routed page content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100vh;
      background: var(--bg-base);
    }

    /* Push main area right by sidebar width */
    .main-area {
      margin-left: var(--sidebar-width, 240px);
      flex: 1;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
      min-width: 0;
    }

    /* When sidebar is collapsed, reduce margin */
    .app-shell.sidebar-collapsed .main-area {
      margin-left: 72px;
    }

    .page-content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
  `]
})
export class LayoutComponent {
  // Angular Signal tracks sidebar open/closed state
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
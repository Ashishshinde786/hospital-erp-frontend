// src/app/shared/components/sidebar/sidebar.component.ts
// Added /profile to navItems so users can navigate to their profile page.

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  @Input() collapsed = false;

  // Navigation items — add/remove routes here as new modules are built.
  navItems = [
    { label: 'Dashboard',    route: '/dashboard',    icon: '📊' },
    { label: 'Patients',     route: '/patients',     icon: '👥' },
    { label: 'Doctors',      route: '/doctors',      icon: '👨‍⚕️' },
    { label: 'Appointments', route: '/appointments', icon: '📅' },
    { label: 'Billing',      route: '/billing',      icon: '💳' },
    { label: 'Pharmacy',     route: '/pharmacy',     icon: '💊' },
    // NEW: Profile link added
    { label: 'My Profile',   route: '/profile',      icon: '👤' }
  ];

  username = 'User';
  role     = 'STAFF';

  constructor(public authService: AuthService) {
    this.username = this.authService.getUsername() || 'User';
    this.role     = this.authService.getRole()     || 'STAFF';
  }

  logout(): void {
    this.authService.logout();
  }
}
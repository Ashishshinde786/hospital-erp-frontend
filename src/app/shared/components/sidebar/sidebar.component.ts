import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;

  navItems: NavItem[] = [
    { label: 'Dashboard',    icon: '📊', route: '/dashboard' },
    { label: 'Patients',     icon: '👥', route: '/patients' },
    { label: 'Doctors',      icon: '👨‍⚕️', route: '/doctors' },
    { label: 'Appointments', icon: '📅', route: '/appointments' },
    { label: 'Billing',      icon: '🧾', route: '/billing' },
    { label: 'Pharmacy',     icon: '💊', route: '/pharmacy' },
  ];

  constructor(public authService: AuthService) {}

  get username(): string { return this.authService.getUsername() || 'User'; }
  get role(): string { return this.authService.getRole() || ''; }
  logout(): void { this.authService.logout(); }
}
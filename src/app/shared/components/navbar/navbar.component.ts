import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  pageTitle = 'Dashboard';

  private routeTitles: Record<string, string> = {
    'dashboard':    'Dashboard',
    'patients':     'Patient Management',
    'doctors':      'Doctor Management',
    'appointments': 'Appointments',
    'billing':      'Billing & Invoicing',
    'pharmacy':     'Pharmacy',
  };

  constructor(public authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: any) => {
        const segment = e.urlAfterRedirects.split('/')[1]?.split('?')[0];
        return this.routeTitles[segment] || 'Hospital ERP';
      })
    ).subscribe(title => this.pageTitle = title);
  }

  get username(): string { return this.authService.getUsername() || ''; }
  get role(): string { return this.authService.getRole() || ''; }
  get currentTime(): string {
    return new Date().toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
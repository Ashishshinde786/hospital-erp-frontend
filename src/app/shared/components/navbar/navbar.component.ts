import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Output() toggleSidebar = new EventEmitter<void>();

  pageTitle   = 'Dashboard';
  currentTime = '';
  username    = 'User';
  role        = 'STAFF';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || 'User';
    this.role     = this.authService.getRole()     || 'STAFF';

    this.updatePageTitle(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updatePageTitle(e.urlAfterRedirects));

    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  updatePageTitle(url: string): void {
    if      (url.includes('patients'))     this.pageTitle = 'Patients';
    else if (url.includes('doctors'))      this.pageTitle = 'Doctors';
    else if (url.includes('appointments')) this.pageTitle = 'Appointments';
    else if (url.includes('billing'))      this.pageTitle = 'Billing';
    else if (url.includes('pharmacy'))     this.pageTitle = 'Pharmacy';
    else                                   this.pageTitle = 'Dashboard';
  }

  updateClock(): void {
    this.currentTime = new Date().toLocaleString();
  }
}
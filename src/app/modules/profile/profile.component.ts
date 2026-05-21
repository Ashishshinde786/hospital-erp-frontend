// src/app/modules/profile/profile.component.ts
//
// NEW: User profile page — shows logged-in user's info decoded from JWT.
// Allows password change (calls POST /api/auth/register with same username
// is NOT the right approach; ideally a PATCH /api/users/me endpoint exists).
// For now this page shows read-only info and a change-password form stub.

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-title">
          <h2>👤 My Profile</h2>
          <p>Your account information</p>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="profile-grid">

        <!-- Info card -->
        <div class="card profile-card">
          <div class="profile-avatar-lg">{{ username.charAt(0).toUpperCase() }}</div>
          <h3 class="profile-name">{{ username }}</h3>
          <span class="badge badge-primary role-badge">{{ role }}</span>

          <div class="profile-info-list">
            <div class="info-row">
              <span class="info-label">Username</span>
              <span class="info-value">{{ username }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Role</span>
              <span class="info-value">{{ role }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Token expires</span>
              <span class="info-value">{{ tokenExpiry }}</span>
            </div>
          </div>
        </div>

        <!-- Change password card -->
        <div class="card">
          <div class="card-header">
            <h3>🔒 Change Password</h3>
          </div>
          <div class="modal-body">

            <div class="alert alert-success" *ngIf="pwSuccess">✅ {{ pwSuccess }}</div>
            <div class="alert alert-danger"  *ngIf="pwError">⚠️ {{ pwError }}</div>

            <form [formGroup]="pwForm" (ngSubmit)="changePassword()">
              <div class="form-group">
                <label>Current Password</label>
                <input type="password" class="form-control" formControlName="currentPassword"
                  placeholder="Enter current password" />
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input type="password" class="form-control" formControlName="newPassword"
                  placeholder="Min 8 characters" />
                <span class="error-text"
                  *ngIf="pwForm.get('newPassword')?.touched && pwForm.get('newPassword')?.invalid">
                  Min 8 characters required
                </span>
              </div>
              <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" class="form-control" formControlName="confirmPassword"
                  placeholder="Repeat new password" />
                <span class="error-text"
                  *ngIf="pwForm.get('confirmPassword')?.touched && passwordMismatch">
                  Passwords do not match
                </span>
              </div>

              <!-- NOTE: A real implementation needs a backend endpoint
                   PATCH /api/users/me/password.  This button is wired up
                   but shows an info message until that endpoint exists. -->
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="pwForm.invalid || loading">
                  <span class="spinner" *ngIf="loading"></span>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .profile-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.25rem;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .profile-card {
      text-align: center;
      padding: 2rem 1.5rem;
    }
    .profile-avatar-lg {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: 2rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1rem;
    }
    .profile-name { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
    .role-badge   { font-size: 0.8rem; }
    .profile-info-list {
      margin-top: 1.5rem;
      border-top: 1px solid var(--border);
      padding-top: 1rem;
    }
    .info-row {
      display: flex; justify-content: space-between;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
      &:last-child { border-bottom: none; }
    }
    .info-label { color: var(--text-muted); }
    .info-value { font-weight: 600; color: var(--text-primary); }
    .page-container { display: flex; flex-direction: column; gap: 1.25rem; }
  `]
})
export class ProfileComponent implements OnInit {

  username    = 'User';
  role        = 'STAFF';
  tokenExpiry = '—';

  pwForm!: FormGroup;
  loading   = false;
  pwSuccess = '';
  pwError   = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || 'User';
    this.role     = this.authService.getRole()     || 'STAFF';
    this.tokenExpiry = this.readTokenExpiry();

    this.pwForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  get passwordMismatch(): boolean {
    const f = this.pwForm;
    return f.get('newPassword')?.value !== f.get('confirmPassword')?.value;
  }

  changePassword(): void {
    if (this.pwForm.invalid || this.passwordMismatch) {
      this.pwForm.markAllAsTouched();
      return;
    }
    // TODO: Call PATCH /api/users/me/password when backend endpoint is added.
    this.pwError   = '';
    this.pwSuccess = '';
    this.pwError   = 'Password change endpoint not yet implemented on the backend. ' +
                     'Add PATCH /api/users/me/password and wire it here.';
  }

  // Decode JWT expiry from the stored token
  private readTokenExpiry(): string {
    try {
      const token = this.authService.getToken();
      if (!token) return '—';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000).toLocaleString();
    } catch {
      return '—';
    }
  }
}
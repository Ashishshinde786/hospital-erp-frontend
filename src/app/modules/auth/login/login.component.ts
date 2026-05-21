import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import {
  finalize
} from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './login.component.html',

  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  form: FormGroup;

  loading = false;

  error = '';

  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.form = this.fb.group({

      username: [
        '',
        Validators.required
      ],

      password: [
        '',
        Validators.required
      ]
    });

    if (this.authService.isLoggedIn()) {

      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    this.loading = true;

    this.error = '';

    const payload = {

      username:
        this.form.value.username.trim(),

      password:
        this.form.value.password
    };

    this.authService
      .login(payload)

      .pipe(

        finalize(() => {
          this.loading = false;
        })
      )

      .subscribe({

        next: (res) => {

          if (res?.success) {

            this.router.navigate(['/dashboard']);

          } else {

            this.error =
              res?.message ||
              'Login failed.';
          }
        },

        error: (err) => {

          this.error =
            err?.error?.message ||
            'Invalid username or password.';
        }
      });
  }
}
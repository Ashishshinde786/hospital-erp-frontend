import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/*
=========================================================
COMPONENT: LoginComponent
=========================================================

PURPOSE:
--------
This component handles user authentication UI + logic.

It is responsible for:
- Building login form (username + password)
- Validating user input
- Calling AuthService for login
- Handling success & error states
- Redirecting user after login

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
User → LoginComponent → AuthService → Backend API
                                 ↓
                        JWT stored (localStorage)
                                 ↓
                        Router navigates to dashboard

---------------------------------------------------------

RELATIONSHIP WITH OTHER PARTS:
------------------------------
- Uses AuthService → for API + token storage
- Used with authGuard → protects routes after login
- Used with jwtInterceptor → attaches token to API calls

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Reactive Forms
- Dependency Injection
- Observables (subscribe)
- Routing & Navigation
- State handling (loading/error)
- Authentication flow

=========================================================
*/

@Component({
  selector: 'app-login',

  // Standalone component (no NgModule required)
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  /*
  =========================================================
  FORM STATE
  =========================================================
  */
  form: FormGroup;     // Reactive form instance

  /*
  =========================================================
  UI STATE
  =========================================================
  */
  loading = false;     // Shows spinner during API call
  error = '';          // Error message for UI
  showPassword = false; // Toggle password visibility



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================
  */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    /*
    -----------------------------------------------------
    BUILD FORM
    -----------------------------------------------------
    Using FormBuilder for cleaner syntax
    */
    this.form = this.fb.group({

      // Username field (required)
      username: ['', Validators.required],

      // Password field (required)
      password: ['', Validators.required]
    });



    /*
    -----------------------------------------------------
    AUTO REDIRECT IF ALREADY LOGGED IN
    -----------------------------------------------------
    Prevents user from seeing login page again
    */
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }



  /*
  =========================================================
  FORM SUBMISSION
  =========================================================

  FLOW:
  -----
  1. Validate form
  2. Show loading
  3. Call AuthService.login()
  4. Handle success → navigate
  5. Handle error → show message
  6. Stop loading

  =========================================================
  */
  onSubmit(): void {

    /*
    -----------------------------------------------------
    STEP 1: VALIDATION
    -----------------------------------------------------
    */
    if (this.form.invalid) {
      return;
    }

    /*
    -----------------------------------------------------
    STEP 2: SET LOADING STATE
    -----------------------------------------------------
    */
    this.loading = true;
    this.error = '';



    /*
    -----------------------------------------------------
    STEP 3: CALL AUTH SERVICE
    -----------------------------------------------------
    Sends login request to backend

    NOTE:
    this.form.value contains:
    {
      username: string,
      password: string
    }
    */
    this.authService.login(this.form.value).subscribe({

      /*
      ---------------------------------------------------
      SUCCESS RESPONSE
      ---------------------------------------------------
      */
      next: (res) => {

        /*
        Backend returns:
        {
          success: true,
          data: { token, username, role }
        }
        */
        if (res.success) {

          // Navigate to dashboard after login
          this.router.navigate(['/dashboard']);
        }
      },



      /*
      ---------------------------------------------------
      ERROR RESPONSE
      ---------------------------------------------------
      */
      error: (err) => {

        // Extract error message from backend
        this.error =
          err.error?.message || 'Invalid username or password';

        this.loading = false;
      },



      /*
      ---------------------------------------------------
      COMPLETE (Always runs)
      ---------------------------------------------------
      */
      complete: () => {
        this.loading = false;
      }
    });
  }
}
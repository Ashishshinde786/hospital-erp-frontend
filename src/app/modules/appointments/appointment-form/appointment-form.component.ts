import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Appointment, Patient, Doctor } from '../../../core/models/models';

/*
=========================================================
COMPONENT: AppointmentFormComponent
=========================================================

PURPOSE:
--------
This component handles BOTH:
- Creating a new appointment
- Editing an existing appointment

It is designed as a MODAL form (see HTML template).

---------------------------------------------------------

ARCHITECTURE (High-Level Flow):
------------------------------
Parent Component (opens modal)
        ↓ passes @Input() appointment (optional)
AppointmentFormComponent
        ↓ loads dropdown data (patients + doctors)
        ↓ builds Reactive Form
        ↓ on submit → calls AppointmentService
        ↓ emits events (saved / cancelled) to parent

---------------------------------------------------------

KEY CONCEPTS USED:
------------------
- Standalone Component (no NgModule needed)
- Reactive Forms (FormGroup, Validators)
- Dependency Injection (services)
- RxJS forkJoin (parallel API calls)
- Input/Output (component communication)
- Conditional logic (create vs update)
- Data transformation (UI ↔ API format)

=========================================================
*/

@Component({
  selector: 'app-appointment-form',

  /*
  ---------------------------------------------------------
  STANDALONE COMPONENT
  ---------------------------------------------------------
  - No need to declare in NgModule
  - Imports required modules directly
  */
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './appointment-form.component.html'
})
export class AppointmentFormComponent implements OnInit {

  /*
  =========================================================
  INPUT: appointment (Edit Mode)
  =========================================================
  - If provided → Edit mode
  - If null → Create mode
  */
  @Input() appointment: Appointment | null = null;

  /*
  =========================================================
  OUTPUT EVENTS
  =========================================================
  - saved → notify parent after successful save
  - cancelled → notify parent to close modal
  */
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();



  /*
  =========================================================
  FORM STATE
  =========================================================
  */
  form!: FormGroup;       // Reactive form instance

  loading = false;        // Submit loading state
  loadingData = true;     // Initial data loading (patients + doctors)
  error = '';             // Error message for UI



  /*
  =========================================================
  DROPDOWN DATA
  =========================================================
  */
  patients: Patient[] = []; // Patient dropdown
  doctors: Doctor[] = [];   // Doctor dropdown

  /*
  Status options (enum-like)
  Used only in edit mode
  */
  statusOptions = [
    'SCHEDULED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
  ];



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================
  - FormBuilder → create form easily
  - Services → API communication
  */
  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService
  ) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================

  GOAL:
  -----
  Load required data BEFORE building form

  WHY forkJoin?
  -------------
  - Run multiple API calls in parallel
  - Wait until ALL complete
  - Better performance than sequential calls

  APIs:
  -----
  - getAllPatients
  - getAllDoctors

  =========================================================
  */
  ngOnInit(): void {

    forkJoin({
      patients: this.patientService.getAll(),
      doctors:  this.doctorService.getAll()
    }).subscribe({

      /*
      -----------------------------------------------------
      SUCCESS CASE
      -----------------------------------------------------
      */
      next: (res) => {

        // Extract actual data from ApiResponse<T>
        this.patients = res.patients.data || [];
        this.doctors  = res.doctors.data  || [];

        // Stop loading spinner
        this.loadingData = false;

        // Build form AFTER data is ready
        this.buildForm();
      },

      /*
      -----------------------------------------------------
      ERROR CASE
      -----------------------------------------------------
      */
      error: () => {

        // Even if API fails → still allow form usage
        this.loadingData = false;

        // Build form with empty dropdowns
        this.buildForm();
      }
    });
  }



  /*
  =========================================================
  BUILD FORM
  =========================================================

  PURPOSE:
  --------
  Initialize reactive form with:
  - Default values (create mode)
  - Existing values (edit mode)

  IMPORTANT:
  ----------
  datetime-local input requires format:
  YYYY-MM-DDTHH:mm

  Backend gives ISO:
  YYYY-MM-DDTHH:mm:ssZ

  So we trim to first 16 characters

  =========================================================
  */
  buildForm(): void {

    let dtValue = '';

    // Convert ISO → datetime-local format
    if (this.appointment?.appointmentDateTime) {
      dtValue = this.appointment.appointmentDateTime.substring(0, 16);
    }

    this.form = this.fb.group({

      /*
      Required fields
      */
      patientId: [
        this.appointment?.patientId || '',
        Validators.required
      ],

      doctorId: [
        this.appointment?.doctorId || '',
        Validators.required
      ],

      appointmentDateTime: [
        dtValue,
        Validators.required
      ],

      /*
      Optional fields
      */
      reason: [
        this.appointment?.reason || ''
      ],

      notes: [
        this.appointment?.notes || ''
      ],

      /*
      Default status for new appointment
      */
      status: [
        this.appointment?.status || 'SCHEDULED'
      ]
    });
  }



  /*
  =========================================================
  HELPER: Check Edit Mode
  =========================================================

  RETURNS:
  --------
  true → editing existing appointment
  false → creating new appointment

  Used in:
  - UI (title, buttons)
  - Submit logic
  */
  get isEdit(): boolean {
    return !!this.appointment?.id;
  }



  /*
  =========================================================
  FORM SUBMISSION
  =========================================================

  FLOW:
  -----
  1. Validate form
  2. Prepare payload
  3. Convert types (string → number/date)
  4. Call API (create/update)
  5. Handle success/error
  6. Notify parent

  =========================================================
  */
  onSubmit(): void {

    /*
    -----------------------------------------------------
    STEP 1: Validation
    -----------------------------------------------------
    */
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // show validation errors
      return;
    }

    /*
    -----------------------------------------------------
    STEP 2: Set loading state
    -----------------------------------------------------
    */
    this.loading = true;
    this.error = '';

    /*
    -----------------------------------------------------
    STEP 3: Prepare payload
    -----------------------------------------------------
    */
    const raw = this.form.value;

    const payload: Appointment = {
      ...raw,

      // Convert string → number (IMPORTANT)
      patientId: Number(raw.patientId),
      doctorId:  Number(raw.doctorId),

      // Convert datetime-local → ISO (backend format)
      appointmentDateTime: new Date(raw.appointmentDateTime).toISOString()
    };

    /*
    -----------------------------------------------------
    STEP 4: Choose API (create vs update)
    -----------------------------------------------------
    */
    const obs = this.isEdit
      ? this.appointmentService.update(this.appointment!.id!, payload)
      : this.appointmentService.create(payload);



    /*
    -----------------------------------------------------
    STEP 5: Handle API response
    -----------------------------------------------------
    */
    obs.subscribe({

      // SUCCESS
      next: () => {
        this.loading = false;

        // Notify parent (close modal + refresh list)
        this.saved.emit();
      },

      // ERROR
      error: (err) => {
        this.loading = false;

        // Show backend error or fallback message
        this.error =
          err.error?.message || 'Save failed.';
      }
    });
  }
}
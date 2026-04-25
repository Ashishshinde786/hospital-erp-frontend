import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/models';

/*
=========================================================
COMPONENT: DoctorFormComponent
=========================================================

PURPOSE:
--------
This component handles BOTH:
- Creating a new doctor
- Editing an existing doctor

It is used as a MODAL form.

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
Parent Component
   ↓ passes doctor (optional)
DoctorFormComponent
   ↓ builds form
   ↓ submit → DoctorService
   ↓ emits saved/cancelled events

---------------------------------------------------------

RELATIONSHIP:
-------------
Doctor entity is used in:
- Appointment module (doctor selection)
- Dashboard (stats)
- Billing (doctor reference)

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Reactive Forms
- Input/Output communication
- Conditional logic (create vs update)
- Dependency Injection
- Validation
- Form initialization with existing data

=========================================================
*/

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-form.component.html',
  styleUrls: ['./doctor-form.component.scss']
})
export class DoctorFormComponent implements OnInit {

  /*
  =========================================================
  INPUT (Edit Mode)
  =========================================================
  */
  @Input() doctor: Doctor | null = null;



  /*
  =========================================================
  OUTPUT EVENTS
  =========================================================
  */
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();



  /*
  =========================================================
  FORM STATE
  =========================================================
  */
  form!: FormGroup;

  loading = false;
  error = '';



  /*
  =========================================================
  STATIC DATA (ENUM-LIKE)
  =========================================================
  NOTE:
  Ideally this should come from backend
  */
  specializations = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Dermatology',
    'Gynecology',
    'Pediatrics',
    'Ophthalmology',
    'ENT',
    'Psychiatry',
    'General Medicine',
    'Surgery',
    'Radiology',
    'Anesthesiology',
    'Oncology',
    'Urology'
  ];



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================
  */
  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService
  ) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================

  PURPOSE:
  --------
  Initialize form with:
  - Empty values (create mode)
  - Existing values (edit mode)

  =========================================================
  */
  ngOnInit(): void {

    this.form = this.fb.group({

      /*
      Required fields
      */
      firstName: [
        this.doctor?.firstName || '',
        Validators.required
      ],

      lastName: [
        this.doctor?.lastName || '',
        Validators.required
      ],

      specialization: [
        this.doctor?.specialization || '',
        Validators.required
      ],

      licenseNumber: [
        this.doctor?.licenseNumber || '',
        Validators.required
      ],



      /*
      Optional fields
      */
      email: [
        this.doctor?.email || '',
        Validators.email
      ],

      phone: [
        this.doctor?.phone || ''
      ],

      qualification: [
        this.doctor?.qualification || ''
      ],

      bio: [
        this.doctor?.bio || ''
      ],



      /*
      Boolean field (default true)
      */
      available: [
        this.doctor?.available !== undefined
          ? this.doctor.available
          : true
      ]
    });
  }



  /*
  =========================================================
  HELPER: CHECK EDIT MODE
  =========================================================
  */
  get isEdit(): boolean {
    return !!this.doctor?.id;
  }



  /*
  =========================================================
  FORM SUBMISSION
  =========================================================

  FLOW:
  -----
  1. Validate form
  2. Prepare payload
  3. Call API (create/update)
  4. Handle success/error

  =========================================================
  */
  onSubmit(): void {

    /*
    -----------------------------------------------------
    STEP 1: VALIDATION
    -----------------------------------------------------
    */
    if (this.form.invalid) {
      this.form.markAllAsTouched();
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
    STEP 3: PREPARE PAYLOAD
    -----------------------------------------------------
    NOTE:
    Form value already matches Doctor interface
    */
    const payload: Doctor = this.form.value;



    /*
    -----------------------------------------------------
    STEP 4: DECIDE API CALL
    -----------------------------------------------------
    */
    const obs = this.isEdit
      ? this.doctorService.update(this.doctor!.id!, payload)
      : this.doctorService.create(payload);



    /*
    -----------------------------------------------------
    STEP 5: HANDLE RESPONSE
    -----------------------------------------------------
    */
    obs.subscribe({

      // SUCCESS
      next: () => {
        this.loading = false;

        // Notify parent
        this.saved.emit();
      },

      // ERROR
      error: (err) => {
        this.loading = false;

        this.error =
          err.error?.message || 'Save failed.';
      }
    });
  }
}
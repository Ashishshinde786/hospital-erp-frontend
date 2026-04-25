import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/models';

/*
=========================================================
COMPONENT: PatientFormComponent
=========================================================

PURPOSE:
--------
This component handles BOTH:
- Creating a new patient
- Editing an existing patient

It is used as a MODAL form.

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
Parent Component
   ↓ passes patient (optional)
PatientFormComponent
   ↓ builds form
   ↓ submit → PatientService
   ↓ emits saved/cancelled events

---------------------------------------------------------

RELATIONSHIP:
-------------
Patient is the MOST IMPORTANT entity in ERP:
- Appointment → requires patient
- Billing → linked to patient
- Pharmacy → patient prescriptions
- Dashboard → patient stats

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Reactive Forms
- Input/Output communication
- Validation (pattern, email)
- Conditional logic (create vs update)
- Dependency Injection
- Form initialization with existing data

=========================================================
*/

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {

  /*
  =========================================================
  INPUT (Edit Mode)
  =========================================================
  */
  @Input() patient: Patient | null = null;



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
  */
  genderOptions = ['MALE', 'FEMALE', 'OTHER'];

  bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
  ];



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================
  */
  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================

  PURPOSE:
  --------
  Initialize form with:
  - Default values (create)
  - Existing values (edit)

  =========================================================
  */
  ngOnInit(): void {

    this.form = this.fb.group({

      /*
      Required fields
      */
      firstName: [
        this.patient?.firstName || '',
        Validators.required
      ],

      lastName: [
        this.patient?.lastName || '',
        Validators.required
      ],

      dateOfBirth: [
        this.patient?.dateOfBirth || '',
        Validators.required
      ],



      /*
      Optional fields
      */
      gender: [
        this.patient?.gender || ''
      ],



      /*
      Contact validation
      */
      phone: [
        this.patient?.phone || '',
        Validators.pattern(/^[0-9]{10}$/)
      ],

      email: [
        this.patient?.email || '',
        Validators.email
      ],



      /*
      Additional info
      */
      address: [
        this.patient?.address || ''
      ],

      bloodGroup: [
        this.patient?.bloodGroup || ''
      ],

      medicalHistory: [
        this.patient?.medicalHistory || ''
      ]
    });
  }



  /*
  =========================================================
  HELPER: CHECK EDIT MODE
  =========================================================
  */
  get isEdit(): boolean {
    return !!this.patient?.id;
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
    STEP 2: LOADING STATE
    -----------------------------------------------------
    */
    this.loading = true;
    this.error = '';



    /*
    -----------------------------------------------------
    STEP 3: PREPARE PAYLOAD
    -----------------------------------------------------
    NOTE:
    Form structure matches Patient interface
    */
    const payload: Patient = this.form.value;



    /*
    -----------------------------------------------------
    STEP 4: SELECT API (CREATE vs UPDATE)
    -----------------------------------------------------
    */
    const obs = this.isEdit
      ? this.patientService.update(this.patient!.id!, payload)
      : this.patientService.create(payload);



    /*
    -----------------------------------------------------
    STEP 5: HANDLE RESPONSE
    -----------------------------------------------------
    */
    obs.subscribe({

      // SUCCESS
      next: () => {
        this.loading = false;

        // Notify parent component
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
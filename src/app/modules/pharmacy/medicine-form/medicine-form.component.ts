import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Medicine } from '../../../core/models/models';

/*
=========================================================
COMPONENT: MedicineFormComponent
=========================================================

PURPOSE:
--------
This component handles BOTH:
- Creating a new medicine (inventory entry)
- Editing an existing medicine

It is used as a MODAL form in the Pharmacy module.

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
Parent Component (Medicine List)
        ↓ passes medicine (optional)
MedicineFormComponent
        ↓ builds reactive form
        ↓ submit → PharmacyService
        ↓ emits saved/cancelled events

---------------------------------------------------------

RELATIONSHIP:
-------------
Medicine entity is used in:
- Pharmacy (inventory management)
- Billing (medicine charges in invoice)
- Dashboard (low stock alerts)

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Reactive Forms
- Input/Output communication
- Validation (required, min values)
- Conditional logic (create vs update)
- Dependency Injection
- Form initialization with existing data
- Domain modeling (inventory + pricing + expiry)

=========================================================
*/

@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicine-form.component.html'
})
export class MedicineFormComponent implements OnInit {

  /*
  =========================================================
  INPUT (Edit Mode)
  =========================================================
  */
  @Input() medicine: Medicine | null = null;



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
  STATIC DATA (CATEGORIES)
  =========================================================
  NOTE:
  Ideally should come from backend/config
  */
  categories = [
    'Antibiotic',
    'Analgesic / Painkiller',
    'Antipyretic',
    'Antacid',
    'Antidiabetic',
    'Antihypertensive',
    'Antihistamine',
    'Antifungal',
    'Antiviral',
    'Vitamins & Supplements',
    'Antiseptic',
    'Laxative',
    'Cough & Cold',
    'Cardiac',
    'Dermatology',
    'Other'
  ];



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================
  */
  constructor(
    private fb: FormBuilder,
    private pharmacyService: PharmacyService
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
      name: [
        this.medicine?.name || '',
        Validators.required
      ],

      price: [
        this.medicine?.price || '',
        [
          Validators.required,
          Validators.min(0.01) // price must be > 0
        ]
      ],

      stockQuantity: [
        this.medicine?.stockQuantity ?? 0,
        [
          Validators.required,
          Validators.min(0) // cannot be negative
        ]
      ],



      /*
      Optional fields
      */
      manufacturer: [
        this.medicine?.manufacturer || ''
      ],

      category: [
        this.medicine?.category || ''
      ],

      expiryDate: [
        this.medicine?.expiryDate || ''
      ],

      batchNumber: [
        this.medicine?.batchNumber || ''
      ]
    });
  }



  /*
  =========================================================
  HELPER: CHECK EDIT MODE
  =========================================================
  */
  get isEdit(): boolean {
    return !!this.medicine?.id;
  }



  /*
  =========================================================
  FORM SUBMISSION
  =========================================================

  FLOW:
  -----
  1. Validate form
  2. Prepare payload
  3. Decide API (create/update)
  4. Handle response

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
    - Spread form values
    - Force active = true (business rule)
    */
    const payload: Medicine = {
      ...this.form.value,
      active: true
    };



    /*
    -----------------------------------------------------
    STEP 4: SELECT API (CREATE vs UPDATE)
    -----------------------------------------------------
    */
    const obs = this.isEdit
      ? this.pharmacyService.update(this.medicine!.id!, payload)
      : this.pharmacyService.create(payload);



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
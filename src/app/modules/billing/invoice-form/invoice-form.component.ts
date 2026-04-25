import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { BillingService } from '../../../core/services/billing.service';
import { PatientService } from '../../../core/services/patient.service';
import { Patient, Invoice } from '../../../core/models/models';

/*
=========================================================
COMPONENT: InvoiceFormComponent
=========================================================

PURPOSE:
--------
This component is responsible for creating a new invoice.

It handles:
- Loading patient list
- Building dynamic invoice form
- Managing line items (FormArray)
- Calculating total amount
- Submitting invoice to backend

---------------------------------------------------------

CORE IDEA:
----------
Invoice = Patient + [Multiple Line Items]

Each item:
- description
- quantity
- unit price
- type

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
User → Form UI → Component → BillingService → Backend

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Reactive Forms
- FormArray (dynamic forms)
- Nested FormGroups
- Derived values (total calculation)
- EventEmitter (parent communication)

=========================================================
*/

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {

  /*
  =========================================================
  OUTPUT EVENTS
  =========================================================
  */
  @Output() saved = new EventEmitter<void>();     // Notify parent after save
  @Output() cancelled = new EventEmitter<void>(); // Notify parent to close modal



  /*
  =========================================================
  FORM STATE
  =========================================================
  */
  form!: FormGroup;

  loading = false;          // Submit loading
  loadingPatients = true;   // Initial patient loading
  error = '';               // Error message



  /*
  =========================================================
  DATA
  =========================================================
  */
  patients: Patient[] = [];

  // Enum-like item types
  itemTypes = [
    'CONSULTATION',
    'MEDICINE',
    'LAB_TEST',
    'PROCEDURE',
    'ROOM_CHARGE',
    'OTHER'
  ];



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================
  */
  constructor(
    private fb: FormBuilder,
    private billingService: BillingService,
    private patientService: PatientService
  ) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================
  */
  ngOnInit(): void {

    /*
    -----------------------------------------------------
    STEP 1: LOAD PATIENTS (for dropdown)
    -----------------------------------------------------
    */
    this.patientService.getAll().subscribe({

      next: (res) => {
        this.patients = res.data || [];
        this.loadingPatients = false;
      },

      error: () => {
        this.loadingPatients = false;
      }
    });



    /*
    -----------------------------------------------------
    STEP 2: BUILD FORM
    -----------------------------------------------------
    */
    this.form = this.fb.group({

      // Required patient selection
      patientId: ['', Validators.required],

      // Optional appointment link
      appointmentId: [''],

      /*
      ---------------------------------------------------
      FORM ARRAY (Dynamic Items)
      ---------------------------------------------------
      Start with ONE item by default
      */
      items: this.fb.array([
        this.createItem()
      ])
    });
  }



  /*
  =========================================================
  CREATE LINE ITEM (FormGroup)
  =========================================================

  Used when:
  - Initializing form
  - Adding new item

  =========================================================
  */
  createItem(): FormGroup {
    return this.fb.group({

      // Required description
      description: ['', Validators.required],

      // Quantity must be ≥ 1
      quantity: [
        1,
        [Validators.required, Validators.min(1)]
      ],

      // Price must be ≥ 0.01
      unitPrice: [
        '',
        [Validators.required, Validators.min(0.01)]
      ],

      // Default item type
      itemType: ['CONSULTATION']
    });
  }



  /*
  =========================================================
  GETTER: ACCESS FORM ARRAY
  =========================================================
  */
  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }



  /*
  =========================================================
  ADD ITEM
  =========================================================
  */
  addItem(): void {
    this.items.push(this.createItem());
  }



  /*
  =========================================================
  REMOVE ITEM
  =========================================================

  Prevent removing last item (business rule)
  */
  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }



  /*
  =========================================================
  CALCULATE TOTAL AMOUNT
  =========================================================

  Derived value (computed from items)

  Called automatically in template

  =========================================================
  */
  get totalAmount(): number {

    return this.items.controls.reduce((sum, ctrl) => {

      const qty   = Number(ctrl.get('quantity')?.value)  || 0;
      const price = Number(ctrl.get('unitPrice')?.value) || 0;

      return sum + (qty * price);

    }, 0);
  }



  /*
  =========================================================
  FORM SUBMISSION
  =========================================================

  FLOW:
  -----
  1. Validate form
  2. Prepare payload
  3. Convert types
  4. Call API
  5. Handle success/error

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
    */
    const raw = this.form.value;

    const payload: Invoice = {

      // Convert to number
      patientId: Number(raw.patientId),

      // Optional conversion
      appointmentId: raw.appointmentId
        ? Number(raw.appointmentId)
        : undefined,

      /*
      Map items:
      - Ensure numeric values
      */
      items: raw.items.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      }))
    };



    /*
    -----------------------------------------------------
    STEP 4: CALL API
    -----------------------------------------------------
    */
    this.billingService.create(payload).subscribe({

      /*
      SUCCESS
      */
      next: () => {
        this.loading = false;

        // Notify parent to refresh list + close modal
        this.saved.emit();
      },



      /*
      ERROR
      */
      error: (err) => {
        this.loading = false;

        this.error =
          err.error?.message || 'Save failed.';
      }
    });
  }
}
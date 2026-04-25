import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/models';
import { PatientFormComponent } from '../patient-form/patient-form.component';

/*
=========================================================
COMPONENT: PatientListComponent
=========================================================

PURPOSE:
--------
This component manages the Patient Management module.

It handles:
- Fetching patients from backend
- Displaying patient list (table)
- Searching patients
- Creating / Editing patients (modal)
- Deleting patients (with confirmation)
- Showing success/error messages
- Calculating derived data (age)

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
UI (HTML Template)
        ↓
PatientListComponent (this file)
        ↓
PatientService (API calls)
        ↓
Backend

---------------------------------------------------------

RELATIONSHIP:
-------------
Patient is a CORE ENTITY:
- Appointment → patient selection
- Billing → patient invoices
- Pharmacy → prescriptions
- Dashboard → stats

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Standalone Component
- Local state management
- Template-driven forms (ngModel)
- Immutable updates (spread operator)
- CRUD operations
- Derived values (age calculation)
- Parent ↔ Child communication

=========================================================
*/

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientFormComponent],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {

  /*
  =========================================================
  STATE: DATA
  =========================================================
  */
  patients: Patient[] = [];   // Original data
  filtered: Patient[] = [];   // Filtered data for UI



  /*
  =========================================================
  UI STATE
  =========================================================
  */
  loading = false;



  /*
  =========================================================
  SEARCH STATE
  =========================================================
  */
  searchQuery = '';



  /*
  =========================================================
  MODAL STATE
  =========================================================
  */
  showForm = false;
  editingPatient: Patient | null = null;



  /*
  =========================================================
  DELETE STATE
  =========================================================
  */
  deleteConfirmId: number | null = null;



  /*
  =========================================================
  UI MESSAGES
  =========================================================
  */
  successMessage = '';
  errorMessage = '';



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================
  */
  constructor(private patientService: PatientService) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================
  */
  ngOnInit(): void {
    this.loadPatients();
  }



  /*
  =========================================================
  LOAD PATIENTS
  =========================================================

  FLOW:
  -----
  1. Show loading
  2. Call API
  3. Store data
  4. Apply search filter
  5. Stop loading

  =========================================================
  */
  loadPatients(): void {

    this.loading = true;

    this.patientService.getAll().subscribe({

      // SUCCESS
      next: (res) => {

        this.patients = res.data || [];

        // Apply search after loading
        this.applySearch();

        this.loading = false;
      },

      // ERROR
      error: () => {
        this.loading = false;
      }
    });
  }



  /*
  =========================================================
  SEARCH LOGIC
  =========================================================

  Filters by:
  - Name
  - Phone
  - Email

  =========================================================
  */
  applySearch(): void {

    const q = this.searchQuery.toLowerCase().trim();

    this.filtered = q
      ? this.patients.filter(p =>

          /*
          Search by full name
          */
          `${p.firstName} ${p.lastName}`
            .toLowerCase()
            .includes(q)

          ||

          /*
          Search by phone
          */
          (p.phone || '').includes(q)

          ||

          /*
          Search by email
          */
          (p.email || '')
            .toLowerCase()
            .includes(q)
        )

      // If no query → return all
      : [...this.patients];
  }



  /*
  =========================================================
  CREATE / EDIT FLOW
  =========================================================
  */

  /*
  Open create modal
  */
  openCreate(): void {
    this.editingPatient = null;
    this.showForm = true;
  }



  /*
  Open edit modal
  IMPORTANT: clone object to avoid mutation
  */
  openEdit(patient: Patient): void {
    this.editingPatient = { ...patient };
    this.showForm = true;
  }



  /*
  After successful save
  */
  onFormSaved(): void {

    this.showForm = false;
    this.editingPatient = null;

    // Reload data
    this.loadPatients();

    this.showSuccess('Patient saved successfully!');
  }



  /*
  Cancel form
  */
  onFormCancelled(): void {
    this.showForm = false;
    this.editingPatient = null;
  }



  /*
  =========================================================
  DELETE FLOW
  =========================================================
  */

  /*
  Step 1: Open confirmation
  */
  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }



  /*
  Step 2: Cancel delete
  */
  cancelDelete(): void {
    this.deleteConfirmId = null;
  }



  /*
  Step 3: Perform delete
  */
  doDelete(): void {

    if (!this.deleteConfirmId) return;

    this.patientService.delete(this.deleteConfirmId).subscribe({

      // SUCCESS
      next: () => {

        this.deleteConfirmId = null;

        this.loadPatients();

        this.showSuccess('Patient deleted.');
      },

      // ERROR
      error: (err) => {

        this.errorMessage =
          err.error?.message || 'Delete failed.';

        this.deleteConfirmId = null;
      }
    });
  }



  /*
  =========================================================
  SUCCESS MESSAGE HANDLER
  =========================================================
  */
  showSuccess(msg: string): void {

    this.successMessage = msg;

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }



  /*
  =========================================================
  DERIVED FUNCTION: AGE CALCULATION
  =========================================================

  WHY?
  ----
  Age is NOT stored in DB → derived from DOB

  LOGIC:
  ------
  1. Current year - birth year
  2. Adjust if birthday not yet passed

  =========================================================
  */
  getAge(dob: string): number {

    if (!dob) return 0;

    const today = new Date();
    const birth = new Date(dob);

    let age = today.getFullYear() - birth.getFullYear();

    /*
    Adjust if birthday not reached yet this year
    */
    if (
      today <
      new Date(
        today.getFullYear(),
        birth.getMonth(),
        birth.getDate()
      )
    ) {
      age--;
    }

    return age;
  }
}
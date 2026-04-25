import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/models';
import { DoctorFormComponent } from '../doctor-form/doctor-form.component';

/*
=========================================================
COMPONENT: DoctorListComponent
=========================================================

PURPOSE:
--------
This component manages the Doctor Management module.

It handles:
- Fetching doctors from backend
- Displaying doctors (card view)
- Searching & filtering
- Creating / Editing doctors (modal)
- Deleting doctors (with confirmation)
- Showing success/error messages

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
UI (HTML Template)
        ↓
DoctorListComponent (this file)
        ↓
DoctorService (API calls)
        ↓
Backend

---------------------------------------------------------

RELATIONSHIP:
-------------
Doctor is a CORE ENTITY used in:
- Appointment module (doctor selection)
- Dashboard (stats)
- Billing (reference)

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Standalone Component
- State management (local state)
- Template-driven forms (ngModel)
- Immutable updates (spread operator)
- CRUD operations
- Parent ↔ Child communication
- Filtering logic

=========================================================
*/

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorFormComponent],
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.scss']
})
export class DoctorListComponent implements OnInit {

  /*
  =========================================================
  STATE: DATA
  =========================================================
  */
  doctors: Doctor[] = [];   // Original data from backend
  filtered: Doctor[] = [];  // Filtered data for UI



  /*
  =========================================================
  UI STATE
  =========================================================
  */
  loading = false;



  /*
  =========================================================
  FILTER STATE
  =========================================================
  */
  searchQuery = '';
  filterAvailable = false;



  /*
  =========================================================
  MODAL STATE
  =========================================================
  */
  showForm = false;
  editingDoctor: Doctor | null = null;



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
  constructor(private doctorService: DoctorService) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================
  */
  ngOnInit(): void {
    this.loadDoctors();
  }



  /*
  =========================================================
  LOAD DOCTORS
  =========================================================

  FLOW:
  -----
  1. Show loading
  2. Call API
  3. Store data
  4. Apply filters
  5. Stop loading

  =========================================================
  */
  loadDoctors(): void {

    this.loading = true;

    this.doctorService.getAll().subscribe({

      // SUCCESS
      next: (res) => {

        this.doctors = res.data || [];

        // Apply filter after loading
        this.applyFilter();

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
  APPLY FILTER
  =========================================================

  Filters:
  - Availability (checkbox)
  - Search query (name, specialization, license)

  IMPORTANT:
  ----------
  Always filter from original list

  =========================================================
  */
  applyFilter(): void {

    // Clone original list
    let list = [...this.doctors];



    /*
    -----------------------------------------------------
    FILTER: AVAILABLE ONLY
    -----------------------------------------------------
    */
    if (this.filterAvailable) {
      list = list.filter(d => d.available);
    }



    /*
    -----------------------------------------------------
    SEARCH FILTER
    -----------------------------------------------------
    */
    const q = this.searchQuery.toLowerCase().trim();

    if (q) {
      list = list.filter(d =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q)
      );
    }



    // Update UI list
    this.filtered = list;
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
    this.editingDoctor = null;
    this.showForm = true;
  }



  /*
  Open edit modal
  IMPORTANT: clone object to avoid mutation
  */
  openEdit(d: Doctor): void {
    this.editingDoctor = { ...d };
    this.showForm = true;
  }



  /*
  After successful save
  */
  onFormSaved(): void {

    this.showForm = false;
    this.editingDoctor = null;

    // Reload latest data
    this.loadDoctors();

    this.showSuccess('Doctor saved!');
  }



  /*
  Cancel form
  */
  onFormCancelled(): void {
    this.showForm = false;
    this.editingDoctor = null;
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

    this.doctorService.delete(this.deleteConfirmId).subscribe({

      // SUCCESS
      next: () => {

        this.deleteConfirmId = null;

        this.loadDoctors();

        this.showSuccess('Doctor deleted.');
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
}
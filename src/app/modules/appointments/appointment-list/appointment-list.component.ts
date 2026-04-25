import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/models';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';

/*
=========================================================
COMPONENT: AppointmentListComponent
=========================================================

PURPOSE:
--------
This component manages the FULL appointment listing page.

It handles:
- Fetching appointments from backend
- Displaying them in a table
- Searching & filtering
- Opening form modal (create/edit)
- Updating status inline
- Deleting appointments
- Showing success/error messages

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
UI (HTML Template) ↔ Component (this file) ↔ Service ↔ Backend

User actions → Component methods → Service calls → API

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Standalone Component
- Template-driven forms (ngModel for search/filter)
- Reactive interaction (events)
- State management (local component state)
- Immutable updates (spread operator)
- Separation of concerns

=========================================================
*/

@Component({
  selector: 'app-appointment-list',

  // Standalone component (no NgModule needed)
  standalone: true,

  // Required Angular modules + child component
  imports: [CommonModule, FormsModule, AppointmentFormComponent],

  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {

  /*
  =========================================================
  STATE: DATA STORAGE
  =========================================================
  */

  appointments: Appointment[] = []; // Original data from backend
  filtered: Appointment[] = [];     // Filtered list for UI display

  loading = false;                 // Loading indicator

  /*
  =========================================================
  FILTER STATE
  =========================================================
  */
  searchQuery = '';                // Search input
  filterStatus = '';               // Selected status filter



  /*
  =========================================================
  MODAL STATE
  =========================================================
  */
  showForm = false;                         // Show/hide form modal
  editingAppointment: Appointment | null = null; // Holds appointment for edit



  /*
  =========================================================
  DELETE CONFIRMATION STATE
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
  STATUS OPTIONS
  =========================================================
  Used for dropdowns & filters
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
  */
  constructor(private appointmentService: AppointmentService) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================
  Load data when component initializes
  */
  ngOnInit(): void {
    this.loadAppointments();
  }



  /*
  =========================================================
  LOAD APPOINTMENTS
  =========================================================

  PURPOSE:
  --------
  Fetch all appointments from backend

  FLOW:
  -----
  1. Set loading = true
  2. Call API
  3. Store result
  4. Apply filter
  5. Stop loading

  =========================================================
  */
  loadAppointments(): void {
    this.loading = true;

    this.appointmentService.getAll().subscribe({

      // SUCCESS
      next: (res) => {

        // Extract data safely
        this.appointments = res.data || [];

        // Apply search + filter logic
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
  APPLY FILTER (SEARCH + STATUS)
  =========================================================

  PURPOSE:
  --------
  Filter appointments based on:
  - Status dropdown
  - Search query (patient/doctor/reason)

  IMPORTANT:
  ----------
  Always filter from ORIGINAL list (appointments)
  not from filtered (avoid stacking bugs)

  =========================================================
  */
  applyFilter(): void {

    // Start with full list (immutable copy)
    let list = [...this.appointments];

    /*
    -----------------------------------------------------
    FILTER BY STATUS
    -----------------------------------------------------
    */
    if (this.filterStatus) {
      list = list.filter(a => a.status === this.filterStatus);
    }

    /*
    -----------------------------------------------------
    SEARCH FILTER
    -----------------------------------------------------
    */
    const q = this.searchQuery.toLowerCase().trim();

    if (q) {
      list = list.filter(a =>
        (a.patientName || '').toLowerCase().includes(q) ||
        (a.doctorName  || '').toLowerCase().includes(q) ||
        (a.reason      || '').toLowerCase().includes(q)
      );
    }

    // Update UI list
    this.filtered = list;
  }



  /*
  =========================================================
  OPEN CREATE FORM
  =========================================================
  */
  openCreate(): void {
    this.editingAppointment = null; // create mode
    this.showForm = true;
  }



  /*
  =========================================================
  OPEN EDIT FORM
  =========================================================

  IMPORTANT:
  ----------
  Use spread operator to avoid mutating original object
  */
  openEdit(a: Appointment): void {
    this.editingAppointment = { ...a }; // clone object
    this.showForm = true;
  }



  /*
  =========================================================
  FORM SAVED HANDLER
  =========================================================

  Triggered when child component emits "saved"
  */
  onFormSaved(): void {
    this.showForm = false;
    this.editingAppointment = null;

    // Reload latest data
    this.loadAppointments();

    this.showSuccess('Appointment saved!');
  }



  /*
  =========================================================
  FORM CANCEL HANDLER
  =========================================================
  */
  onFormCancelled(): void {
    this.showForm = false;
    this.editingAppointment = null;
  }



  /*
  =========================================================
  UPDATE STATUS (INLINE)
  =========================================================
  */
  updateStatus(id: number, status: string): void {

    this.appointmentService.updateStatus(id, status).subscribe({

      // SUCCESS
      next: () => {
        this.loadAppointments();
        this.showSuccess('Status updated!');
      },

      // ERROR
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Update failed.';
      }
    });
  }



  /*
  =========================================================
  DELETE FLOW
  =========================================================
  */

  // Step 1: Open confirmation modal
  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  // Step 2: Cancel delete
  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  // Step 3: Perform delete
  doDelete(): void {

    if (!this.deleteConfirmId) return;

    this.appointmentService.delete(this.deleteConfirmId).subscribe({

      // SUCCESS
      next: () => {
        this.deleteConfirmId = null;
        this.loadAppointments();
        this.showSuccess('Appointment deleted.');
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

  Auto clears after 3 seconds
  */
  showSuccess(msg: string): void {
    this.successMessage = msg;

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }



  /*
  =========================================================
  STATUS BADGE (UI HELPER)
  =========================================================
  */
  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'badge-info',
      CONFIRMED: 'badge-primary',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-danger',
      NO_SHOW: 'badge-warning'
    };

    return map[status] || 'badge-muted';
  }



  /*
  =========================================================
  DERIVED STATS (GETTERS)
  =========================================================

  Used in UI stats section

  These are recalculated automatically when data changes
  */
  get scheduledCount(): number {
    return this.appointments.filter(a => a.status === 'SCHEDULED').length;
  }

  get completedCount(): number {
    return this.appointments.filter(a => a.status === 'COMPLETED').length;
  }

  get cancelledCount(): number {
    return this.appointments.filter(a => a.status === 'CANCELLED').length;
  }
}
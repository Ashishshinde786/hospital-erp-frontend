import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/models';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentFormComponent],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {

  appointments: Appointment[] = [];
  filtered:     Appointment[] = [];
  loading       = true;
  searchQuery   = '';
  filterStatus  = '';
  showForm      = false;
  editingAppointment: Appointment | null = null;
  deleteConfirmId: number | null = null;
  successMessage = '';
  errorMessage   = '';

  skeletonRows = Array(8);
  statusOptions = ['SCHEDULED','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW'];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void { this.loadAppointments(); }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';
    this.appointmentService.getAll().subscribe({
      next: (res) => {
        this.appointments = res?.data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load appointments.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let list = [...this.appointments];
    if (this.filterStatus) list = list.filter(a => a.status === this.filterStatus);
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(a =>
        (a.patientName || '').toLowerCase().includes(query) ||
        (a.doctorName || '').toLowerCase().includes(query) ||
        (a.doctorSpecialization || '').toLowerCase().includes(query) ||
        (a.reason || '').toLowerCase().includes(query) ||
        (a.notes || '').toLowerCase().includes(query)
      );
    }
    this.filtered = list;
  }

  openCreate(): void { this.editingAppointment = null; this.showForm = true; }
  openEdit(a: Appointment): void { this.editingAppointment = { ...a }; this.showForm = true; }

  onFormSaved(): void {
    this.showForm = false;
    this.editingAppointment = null;
    this.loadAppointments();
    this.showSuccess('Appointment saved successfully.');
  }

  onFormCancelled(): void { this.showForm = false; this.editingAppointment = null; }

  updateStatus(id: number, status: string): void {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => { this.loadAppointments(); this.showSuccess('Status updated.'); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to update status.'; }
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void            { this.deleteConfirmId = null; }

  doDelete(): void {
    if (!this.deleteConfirmId) return;
    this.appointmentService.delete(this.deleteConfirmId).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.loadAppointments();
        this.showSuccess('Appointment deleted successfully.');
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to delete.';
        this.deleteConfirmId = null;
      }
    });
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => { this.successMessage = ''; }, 3000);
  }

  get scheduledCount() { return this.appointments.filter(a => a.status === 'SCHEDULED').length; }
  get confirmedCount() { return this.appointments.filter(a => a.status === 'CONFIRMED').length; }
  get completedCount() { return this.appointments.filter(a => a.status === 'COMPLETED').length; }
  get cancelledCount() { return this.appointments.filter(a => a.status === 'CANCELLED').length; }
}
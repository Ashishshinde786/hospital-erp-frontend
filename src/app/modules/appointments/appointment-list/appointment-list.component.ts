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
  filtered: Appointment[] = [];
  loading = false;
  searchQuery = '';
  filterStatus = '';
  showForm = false;
  editingAppointment: Appointment | null = null;
  deleteConfirmId: number | null = null;
  successMessage = '';
  errorMessage = '';

  statusOptions = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void { this.loadAppointments(); }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAll().subscribe({
      next: (res) => { this.appointments = res.data || []; this.applyFilter(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    let list = [...this.appointments];
    if (this.filterStatus) list = list.filter(a => a.status === this.filterStatus);
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(a =>
        (a.patientName || '').toLowerCase().includes(q) ||
        (a.doctorName  || '').toLowerCase().includes(q) ||
        (a.reason      || '').toLowerCase().includes(q));
    }
    this.filtered = list;
  }

  openCreate(): void { this.editingAppointment = null; this.showForm = true; }
  openEdit(a: Appointment): void { this.editingAppointment = { ...a }; this.showForm = true; }
  onFormSaved(): void { this.showForm = false; this.editingAppointment = null; this.loadAppointments(); this.showSuccess('Appointment saved!'); }
  onFormCancelled(): void { this.showForm = false; this.editingAppointment = null; }

  updateStatus(id: number, status: string): void {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => { this.loadAppointments(); this.showSuccess('Status updated!'); },
      error: (err) => { this.errorMessage = err.error?.message || 'Update failed.'; }
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  doDelete(): void {
    if (!this.deleteConfirmId) return;
    this.appointmentService.delete(this.deleteConfirmId).subscribe({
      next: () => { this.deleteConfirmId = null; this.loadAppointments(); this.showSuccess('Appointment deleted.'); },
      error: (err) => { this.errorMessage = err.error?.message || 'Delete failed.'; this.deleteConfirmId = null; }
    });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'badge-info', CONFIRMED: 'badge-primary',
      COMPLETED: 'badge-success', CANCELLED: 'badge-danger', NO_SHOW: 'badge-warning'
    };
    return map[status] || 'badge-muted';
  }

  get scheduledCount(): number { return this.appointments.filter(a => a.status === 'SCHEDULED').length; }
  get completedCount(): number { return this.appointments.filter(a => a.status === 'COMPLETED').length; }
  get cancelledCount(): number { return this.appointments.filter(a => a.status === 'CANCELLED').length; }
}
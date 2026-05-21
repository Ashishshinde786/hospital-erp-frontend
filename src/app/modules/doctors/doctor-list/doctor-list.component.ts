import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/models';
import { DoctorFormComponent } from '../doctor-form/doctor-form.component';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorFormComponent],
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.scss']
})
export class DoctorListComponent implements OnInit {

  doctors:         Doctor[] = [];
  filtered:        Doctor[] = [];
  loading          = true;
  searchQuery      = '';
  filterAvailable  = false;
  showForm         = false;
  editingDoctor:   Doctor | null = null;
  deleteConfirmId: number | null = null;
  successMessage   = '';
  errorMessage     = '';

  skeletonRows = Array(6);

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void { this.loadDoctors(); }

  loadDoctors(): void {
    this.loading = true;
    this.errorMessage = '';
    this.doctorService.getAll().subscribe({
      next: (res) => {
        this.doctors = res.data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load doctors.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let list = [...this.doctors];
    if (this.filterAvailable) list = list.filter(d => d.available);
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(d =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q) ||
        (d.qualification || '').toLowerCase().includes(q)
      );
    }
    this.filtered = list;
  }

  openCreate(): void          { this.editingDoctor = null; this.showForm = true; }
  openEdit(d: Doctor): void   { this.editingDoctor = { ...d }; this.showForm = true; }

  onFormSaved(): void {
    this.showForm = false;
    this.editingDoctor = null;
    this.loadDoctors();
    this.showSuccess('Doctor saved successfully!');
  }

  onFormCancelled(): void     { this.showForm = false; this.editingDoctor = null; }
  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void            { this.deleteConfirmId = null; }

  doDelete(): void {
    if (!this.deleteConfirmId) return;
    this.doctorService.delete(this.deleteConfirmId).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.loadDoctors();
        this.showSuccess('Doctor deleted successfully!');
      },
      error: (err) => {
        this.errorMessage    = err.error?.message || 'Delete failed.';
        this.deleteConfirmId = null;
      }
    });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = ''), 3000);
  }
}
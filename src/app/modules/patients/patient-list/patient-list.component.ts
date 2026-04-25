import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/models';
import { PatientFormComponent } from '../patient-form/patient-form.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientFormComponent],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  filtered: Patient[] = [];
  loading = false;
  searchQuery = '';
  showForm = false;
  editingPatient: Patient | null = null;
  deleteConfirmId: number | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(private patientService: PatientService) {}

  ngOnInit(): void { this.loadPatients(); }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getAll().subscribe({
      next: (res) => { this.patients = res.data || []; this.applySearch(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applySearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = q
      ? this.patients.filter(p =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          (p.phone || '').includes(q) ||
          (p.email || '').toLowerCase().includes(q))
      : [...this.patients];
  }

  openCreate(): void { this.editingPatient = null; this.showForm = true; }
  openEdit(patient: Patient): void { this.editingPatient = { ...patient }; this.showForm = true; }
  onFormSaved(): void { this.showForm = false; this.editingPatient = null; this.loadPatients(); this.showSuccess('Patient saved successfully!'); }
  onFormCancelled(): void { this.showForm = false; this.editingPatient = null; }
  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  doDelete(): void {
    if (!this.deleteConfirmId) return;
    this.patientService.delete(this.deleteConfirmId).subscribe({
      next: () => { this.deleteConfirmId = null; this.loadPatients(); this.showSuccess('Patient deleted.'); },
      error: (err) => { this.errorMessage = err.error?.message || 'Delete failed.'; this.deleteConfirmId = null; }
    });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  getAge(dob: string): number {
    if (!dob) return 0;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--;
    return age;
  }
}
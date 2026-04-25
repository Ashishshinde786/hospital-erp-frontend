import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/models';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  @Input() patient: Patient | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  error = '';

  genderOptions = ['MALE', 'FEMALE', 'OTHER'];
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  constructor(private fb: FormBuilder, private patientService: PatientService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName:      [this.patient?.firstName      || '', Validators.required],
      lastName:       [this.patient?.lastName       || '', Validators.required],
      dateOfBirth:    [this.patient?.dateOfBirth    || '', Validators.required],
      gender:         [this.patient?.gender         || ''],
      phone:          [this.patient?.phone          || '', Validators.pattern(/^[0-9]{10}$/)],
      email:          [this.patient?.email          || '', Validators.email],
      address:        [this.patient?.address        || ''],
      bloodGroup:     [this.patient?.bloodGroup     || ''],
      medicalHistory: [this.patient?.medicalHistory || '']
    });
  }

  get isEdit(): boolean { return !!this.patient?.id; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const payload: Patient = this.form.value;
    const obs = this.isEdit
      ? this.patientService.update(this.patient!.id!, payload)
      : this.patientService.create(payload);
    obs.subscribe({
      next:  ()    => { this.loading = false; this.saved.emit(); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Save failed.'; }
    });
  }
}
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/models';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-form.component.html',
  styleUrls: ['./doctor-form.component.scss']
})
export class DoctorFormComponent implements OnInit {
  @Input() doctor: Doctor | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  error = '';

  specializations = [
    'Cardiology','Neurology','Orthopedics','Dermatology','Gynecology',
    'Pediatrics','Ophthalmology','ENT','Psychiatry','General Medicine',
    'Surgery','Radiology','Anesthesiology','Oncology','Urology'
  ];

  constructor(private fb: FormBuilder, private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName:      [this.doctor?.firstName      || '', Validators.required],
      lastName:       [this.doctor?.lastName       || '', Validators.required],
      specialization: [this.doctor?.specialization || '', Validators.required],
      licenseNumber:  [this.doctor?.licenseNumber  || '', Validators.required],
      email:          [this.doctor?.email          || '', Validators.email],
      phone:          [this.doctor?.phone          || ''],
      qualification:  [this.doctor?.qualification  || ''],
      bio:            [this.doctor?.bio            || ''],
      available:      [this.doctor?.available !== undefined ? this.doctor.available : true]
    });
  }

  get isEdit(): boolean { return !!this.doctor?.id; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const payload: Doctor = this.form.value;
    const obs = this.isEdit
      ? this.doctorService.update(this.doctor!.id!, payload)
      : this.doctorService.create(payload);
    obs.subscribe({
      next:  ()    => { this.loading = false; this.saved.emit(); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Save failed.'; }
    });
  }
}
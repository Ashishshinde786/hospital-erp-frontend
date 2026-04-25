import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Appointment, Patient, Doctor } from '../../../core/models/models';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-form.component.html'
})
export class AppointmentFormComponent implements OnInit {
  @Input() appointment: Appointment | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  loadingData = true;
  error = '';

  patients: Patient[] = [];
  doctors: Doctor[] = [];
  statusOptions = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    forkJoin({
      patients: this.patientService.getAll(),
      doctors:  this.doctorService.getAll()
    }).subscribe({
      next: (res) => {
        this.patients = res.patients.data || [];
        this.doctors  = res.doctors.data  || [];
        this.loadingData = false;
        this.buildForm();
      },
      error: () => { this.loadingData = false; this.buildForm(); }
    });
  }

  buildForm(): void {
    let dtValue = '';
    if (this.appointment?.appointmentDateTime) {
      dtValue = this.appointment.appointmentDateTime.substring(0, 16);
    }
    this.form = this.fb.group({
      patientId:           [this.appointment?.patientId || '', Validators.required],
      doctorId:            [this.appointment?.doctorId  || '', Validators.required],
      appointmentDateTime: [dtValue, Validators.required],
      reason:              [this.appointment?.reason || ''],
      notes:               [this.appointment?.notes  || ''],
      status:              [this.appointment?.status || 'SCHEDULED']
    });
  }

  get isEdit(): boolean { return !!this.appointment?.id; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const raw = this.form.value;
    const payload: Appointment = {
      ...raw,
      patientId: Number(raw.patientId),
      doctorId:  Number(raw.doctorId),
      appointmentDateTime: new Date(raw.appointmentDateTime).toISOString()
    };
    const obs = this.isEdit
      ? this.appointmentService.update(this.appointment!.id!, payload)
      : this.appointmentService.create(payload);
    obs.subscribe({
      next:  ()    => { this.loading = false; this.saved.emit(); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Save failed.'; }
    });
  }
}
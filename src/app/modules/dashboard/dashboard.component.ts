import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PatientService }     from '../../core/services/patient.service';
import { DoctorService }      from '../../core/services/doctor.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { BillingService }     from '../../core/services/billing.service';
import { PharmacyService }    from '../../core/services/pharmacy.service';
import { Patient, Doctor, Appointment, Medicine } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  stats = {
    totalPatients: 0, totalDoctors: 0, totalAppointments: 0,
    totalRevenue: 0, lowStockMedicines: 0, availableDoctors: 0
  };

  recentPatients:     Patient[]     = [];
  recentAppointments: Appointment[] = [];
  lowStockMedicines:  Medicine[]    = [];

  loadingAppointments = true;
  loadingPatients     = true;
  loadingStock        = true;
  errorMessage        = '';

  skeletonRows5 = Array(5);
  skeletonRows4 = Array(4);
  skeletonRows3 = Array(3);

  constructor(
    private patientService:     PatientService,
    private doctorService:      DoctorService,
    private appointmentService: AppointmentService,
    private billingService:     BillingService,
    private pharmacyService:    PharmacyService
  ) {}

  ngOnInit(): void { this.loadDashboard(); }

  loadDashboard(): void {
    this.errorMessage = '';
    forkJoin({
      patients:     this.patientService.getAll().pipe(catchError(() => of({ data: [] as Patient[], success: true, message: '', timestamp: '' }))),
      doctors:      this.doctorService.getAll().pipe(catchError(() => of({ data: [] as Doctor[], success: true, message: '', timestamp: '' }))),
      appointments: this.appointmentService.getAll().pipe(catchError(() => of({ data: [] as Appointment[], success: true, message: '', timestamp: '' }))),
      revenue:      this.billingService.getRevenue().pipe(catchError(() => of({ data: 0, success: true, message: '', timestamp: '' }))),
      lowStock:     this.pharmacyService.getLowStock(10).pipe(catchError(() => of({ data: [] as Medicine[], success: true, message: '', timestamp: '' })))
    }).subscribe({
      next: (results) => {
        const patients     = results.patients.data     || [];
        const doctors      = results.doctors.data      || [];
        const appointments = results.appointments.data || [];
        const lowStock     = results.lowStock.data     || [];

        this.stats.totalPatients     = patients.length;
        this.stats.totalDoctors      = doctors.length;
        this.stats.totalAppointments = appointments.length;
        this.stats.totalRevenue      = Number(results.revenue.data) || 0;
        this.stats.lowStockMedicines = lowStock.length;
        this.stats.availableDoctors  = doctors.filter(d => d.available).length;

        this.recentPatients     = [...patients].reverse().slice(0, 5);
        this.recentAppointments = [...appointments].reverse().slice(0, 5);
        this.lowStockMedicines  = lowStock;

        this.loadingAppointments = false;
        this.loadingPatients     = false;
        this.loadingStock        = false;
      },
      error: () => {
        this.errorMessage        = 'Backend unreachable. Make sure it is running on port 8080.';
        this.loadingAppointments = false;
        this.loadingPatients     = false;
        this.loadingStock        = false;
      }
    });
  }

  getStatusBadge(status: string | undefined | null): string {
    const map: Record<string, string> = {
      SCHEDULED: 'badge-info', CONFIRMED: 'badge-primary',
      COMPLETED: 'badge-success', CANCELLED: 'badge-danger', NO_SHOW: 'badge-warning'
    };
    return status ? (map[status] ?? 'badge-muted') : 'badge-muted';
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
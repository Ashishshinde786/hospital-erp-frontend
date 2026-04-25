import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PatientService } from '../../core/services/patient.service';
import { DoctorService } from '../../core/services/doctor.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { BillingService } from '../../core/services/billing.service';
import { PharmacyService } from '../../core/services/pharmacy.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;

  stats = {
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    lowStockMedicines: 0,
    availableDoctors: 0
  };

  recentPatients: any[] = [];
  recentAppointments: any[] = [];
  lowStockMedicines: any[] = [];

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private billingService: BillingService,
    private pharmacyService: PharmacyService
  ) {}

  ngOnInit(): void { this.loadDashboard(); }

  loadDashboard(): void {
    this.loading = true;
    forkJoin({
      patients:     this.patientService.getAll(),
      doctors:      this.doctorService.getAll(),
      appointments: this.appointmentService.getAll(),
      revenue:      this.billingService.getRevenue(),
      lowStock:     this.pharmacyService.getLowStock(10)
    }).subscribe({
      next: (results) => {
        this.stats.totalPatients     = results.patients.data?.length     || 0;
        this.stats.totalDoctors      = results.doctors.data?.length      || 0;
        this.stats.totalAppointments = results.appointments.data?.length || 0;
        this.stats.totalRevenue      = results.revenue.data              || 0;
        this.stats.lowStockMedicines = results.lowStock.data?.length     || 0;
        this.stats.availableDoctors  = results.doctors.data?.filter((d: any) => d.available).length || 0;

        this.recentPatients     = (results.patients.data     || []).slice(-5).reverse();
        this.recentAppointments = (results.appointments.data || []).slice(-5).reverse();
        this.lowStockMedicines  = results.lowStock.data      || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'badge-info', CONFIRMED: 'badge-primary',
      COMPLETED: 'badge-success', CANCELLED: 'badge-danger', NO_SHOW: 'badge-warning'
    };
    return map[status] || 'badge-muted';
  }
}
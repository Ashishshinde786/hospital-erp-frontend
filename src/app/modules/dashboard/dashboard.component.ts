import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PatientService } from '../../core/services/patient.service';
import { DoctorService } from '../../core/services/doctor.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { BillingService } from '../../core/services/billing.service';
import { PharmacyService } from '../../core/services/pharmacy.service';

/*
=========================================================
COMPONENT: DashboardComponent
=========================================================

PURPOSE:
--------
This component acts as the CENTRAL DASHBOARD of the ERP.

It aggregates data from multiple modules:
- Patients
- Doctors
- Appointments
- Billing (Revenue)
- Pharmacy (Low stock)

Then transforms that data into:
- Stats (KPIs)
- Recent activity lists
- Alerts

---------------------------------------------------------

ARCHITECTURE ROLE:
------------------
This is an "Aggregation Layer"

Instead of UI calling multiple APIs separately:
→ Dashboard orchestrates all API calls
→ Combines data into meaningful insights

---------------------------------------------------------

FLOW:
-----
ngOnInit()
   ↓
loadDashboard()
   ↓
forkJoin() → parallel API calls
   ↓
Process results
   ↓
Bind to UI

---------------------------------------------------------

KEY CONCEPTS:
-------------
- RxJS forkJoin (parallel execution)
- Data aggregation
- Derived metrics (counts, filters)
- Defensive programming (fallback values)
- Separation of concerns

=========================================================
*/

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  /*
  =========================================================
  LOADING STATE
  =========================================================
  */
  loading = true;



  /*
  =========================================================
  DASHBOARD STATS (KPIs)
  =========================================================
  */
  stats = {
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    lowStockMedicines: 0,
    availableDoctors: 0
  };



  /*
  =========================================================
  UI DATA (LISTS)
  =========================================================
  */
  recentPatients: any[] = [];
  recentAppointments: any[] = [];
  lowStockMedicines: any[] = [];



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================
  */
  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private billingService: BillingService,
    private pharmacyService: PharmacyService
  ) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================
  */
  ngOnInit(): void {
    this.loadDashboard();
  }



  /*
  =========================================================
  LOAD DASHBOARD DATA
  =========================================================

  WHY forkJoin?
  -------------
  - Runs multiple API calls in parallel
  - Waits until ALL complete
  - Improves performance

  =========================================================
  */
  loadDashboard(): void {

    this.loading = true;

    forkJoin({

      // Multiple API calls
      patients:     this.patientService.getAll(),
      doctors:      this.doctorService.getAll(),
      appointments: this.appointmentService.getAll(),
      revenue:      this.billingService.getRevenue(),
      lowStock:     this.pharmacyService.getLowStock(10)

    }).subscribe({

      /*
      -----------------------------------------------------
      SUCCESS CASE
      -----------------------------------------------------
      */
      next: (results) => {

        /*
        -------------------------------------------------
        CALCULATE STATS
        -------------------------------------------------
        */
        this.stats.totalPatients =
          results.patients.data?.length || 0;

        this.stats.totalDoctors =
          results.doctors.data?.length || 0;

        this.stats.totalAppointments =
          results.appointments.data?.length || 0;

        this.stats.totalRevenue =
          results.revenue.data || 0;

        this.stats.lowStockMedicines =
          results.lowStock.data?.length || 0;

        /*
        Count only available doctors
        */
        this.stats.availableDoctors =
          results.doctors.data?.filter((d: any) => d.available).length || 0;



        /*
        -------------------------------------------------
        RECENT DATA (Last 5 entries)
        -------------------------------------------------
        */

        /*
        slice(-5) → last 5 items
        reverse() → latest first
        */
        this.recentPatients =
          (results.patients.data || [])
            .slice(-5)
            .reverse();

        this.recentAppointments =
          (results.appointments.data || [])
            .slice(-5)
            .reverse();

        /*
        Low stock list (no slicing)
        */
        this.lowStockMedicines =
          results.lowStock.data || [];



        /*
        -------------------------------------------------
        STOP LOADING
        -------------------------------------------------
        */
        this.loading = false;
      },



      /*
      -----------------------------------------------------
      ERROR CASE
      -----------------------------------------------------
      */
      error: () => {
        this.loading = false;
      }
    });
  }



  /*
  =========================================================
  UI HELPER: STATUS BADGE
  =========================================================

  Maps status → CSS class

  Used in template for styling
  */
  getStatusBadge(status: string): string {

    const map: Record<string, string> = {

      SCHEDULED: 'badge-info',
      CONFIRMED: 'badge-primary',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-danger',
      NO_SHOW:   'badge-warning'
    };

    return map[status] || 'badge-muted';
  }
}
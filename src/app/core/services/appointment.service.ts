import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Appointment } from '../models/models';

/*
=========================================================
SERVICE: AppointmentService
=========================================================

PURPOSE:
--------
This service acts as a bridge between Angular frontend
and backend Appointment APIs.

It is responsible for:
- Fetching appointments
- Creating new appointments
- Updating existing appointments
- Deleting appointments
- Filtering by patient / doctor

---------------------------------------------------------

WHERE IT FITS:
--------------
Component → AppointmentService → HttpClient → Backend API

Component DOES NOT directly call API
→ It uses this service (separation of concerns)

---------------------------------------------------------

WHY SERVICE LAYER?
------------------
- Centralized API logic
- Reusable across multiple components
- Easy to maintain and test
- Keeps components clean (UI-only)

---------------------------------------------------------

DEPENDENCIES:
-------------
- HttpClient → to make HTTP calls
- environment → to get base API URL
- Models → for strong typing

=========================================================
*/

@Injectable({
  providedIn: 'root' // Singleton service available across entire app
})
export class AppointmentService {

  /*
  ---------------------------------------------------------
  BASE URL for Appointment APIs

  Example:
  environment.apiUrl = http://localhost:8080/api

  Final URL:
  http://localhost:8080/api/appointments
  ---------------------------------------------------------
  */
  private url = `${environment.apiUrl}/appointments`;

  /*
  ---------------------------------------------------------
  Inject HttpClient

  HttpClient is Angular's built-in service for API calls
  ---------------------------------------------------------
  */
  constructor(private http: HttpClient) {}



  /*
  =========================================================
  GET ALL APPOINTMENTS
  =========================================================

  API:
  GET /appointments

  RETURNS:
  Observable<ApiResponse<Appointment[]>>

  WHY OBSERVABLE?
  ----------------
  - HTTP calls are async
  - Angular uses RxJS Observables for async streams
  */
  getAll(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(this.url);
  }



  /*
  =========================================================
  GET APPOINTMENT BY ID
  =========================================================

  API:
  GET /appointments/{id}
  */
  getById(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.url}/${id}`);
  }



  /*
  =========================================================
  GET APPOINTMENTS BY PATIENT
  =========================================================

  API:
  GET /appointments/patient/{patientId}

  USE CASE:
  - Show all appointments for a specific patient
  */
  getByPatient(patientId: number): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.url}/patient/${patientId}`
    );
  }



  /*
  =========================================================
  GET APPOINTMENTS BY DOCTOR
  =========================================================

  API:
  GET /appointments/doctor/{doctorId}

  USE CASE:
  - Show doctor schedule
  */
  getByDoctor(doctorId: number): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.url}/doctor/${doctorId}`
    );
  }



  /*
  =========================================================
  CREATE NEW APPOINTMENT
  =========================================================

  API:
  POST /appointments

  BODY:
  Appointment object

  USE CASE:
  - Booking new appointment
  */
  create(appointment: Appointment): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(this.url, appointment);
  }



  /*
  =========================================================
  UPDATE APPOINTMENT
  =========================================================

  API:
  PUT /appointments/{id}

  USE CASE:
  - Reschedule appointment
  - Update notes/reason
  */
  update(
    id: number,
    appointment: Appointment
  ): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(
      `${this.url}/${id}`,
      appointment
    );
  }



  /*
  =========================================================
  UPDATE APPOINTMENT STATUS
  =========================================================

  API:
  PATCH /appointments/{id}/status?status=CONFIRMED

  WHY PATCH?
  ----------
  - Partial update (only status changes)
  - More efficient than PUT

  NOTE:
  - Sending null body because only query param is needed
  */
  updateStatus(
    id: number,
    status: string
  ): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(
      `${this.url}/${id}/status`,
      null,
      {
        params: { status } // sent as query parameter
      }
    );
  }



  /*
  =========================================================
  DELETE APPOINTMENT
  =========================================================

  API:
  DELETE /appointments/{id}

  RETURNS:
  ApiResponse<void> (no data, only status/message)
  */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`);
  }
}
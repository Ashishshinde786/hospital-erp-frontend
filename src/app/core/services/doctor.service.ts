import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Doctor } from '../models/models';

/*
=========================================================
SERVICE: DoctorService
=========================================================

PURPOSE:
--------
This service manages all Doctor-related operations by
communicating with backend APIs.

It is responsible for:
- Fetching doctor data
- Filtering doctors (available / specialization)
- Creating, updating, deleting doctors

---------------------------------------------------------

WHERE IT FITS:
--------------
Component → DoctorService → HttpClient → Backend API

Used in:
- Doctor listing UI
- Appointment booking (select doctor)
- Admin doctor management

---------------------------------------------------------

WHY THIS SERVICE:
-----------------
- Centralized doctor-related API logic
- Reusable across multiple components
- Keeps UI layer clean (no direct API calls)

=========================================================
*/

@Injectable({
  providedIn: 'root' // Singleton service across app
})
export class DoctorService {

  /*
  ---------------------------------------------------------
  BASE URL for Doctor APIs

  Example:
  http://localhost:8080/api/doctors
  ---------------------------------------------------------
  */
  private url = `${environment.apiUrl}/doctors`;

  /*
  ---------------------------------------------------------
  Inject HttpClient for API communication
  ---------------------------------------------------------
  */
  constructor(private http: HttpClient) {}



  /*
  =========================================================
  GET ALL DOCTORS
  =========================================================

  API:
  GET /doctors

  USE CASE:
  - Show list of all doctors
  */
  getAll(): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(this.url);
  }



  /*
  =========================================================
  GET DOCTOR BY ID
  =========================================================

  API:
  GET /doctors/{id}

  USE CASE:
  - View doctor details
  */
  getById(id: number): Observable<ApiResponse<Doctor>> {
    return this.http.get<ApiResponse<Doctor>>(`${this.url}/${id}`);
  }



  /*
  =========================================================
  GET AVAILABLE DOCTORS
  =========================================================

  API:
  GET /doctors/available

  USE CASE:
  - Show only doctors available for appointments
  */
  getAvailable(): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(
      `${this.url}/available`
    );
  }



  /*
  =========================================================
  GET DOCTORS BY SPECIALIZATION
  =========================================================

  API:
  GET /doctors/specialization/{spec}

  USE CASE:
  - Filter doctors by specialization
    (e.g., Cardiologist, Dentist)

  NOTE:
  - spec should match backend expected values
  */
  getBySpecialization(spec: string): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(
      `${this.url}/specialization/${spec}`
    );
  }



  /*
  =========================================================
  CREATE DOCTOR
  =========================================================

  API:
  POST /doctors

  BODY:
  Doctor object

  USE CASE:
  - Admin adds new doctor
  */
  create(doctor: Doctor): Observable<ApiResponse<Doctor>> {
    return this.http.post<ApiResponse<Doctor>>(
      this.url,
      doctor
    );
  }



  /*
  =========================================================
  UPDATE DOCTOR
  =========================================================

  API:
  PUT /doctors/{id}

  USE CASE:
  - Update doctor details (profile, availability, etc.)
  */
  update(
    id: number,
    doctor: Doctor
  ): Observable<ApiResponse<Doctor>> {
    return this.http.put<ApiResponse<Doctor>>(
      `${this.url}/${id}`,
      doctor
    );
  }



  /*
  =========================================================
  DELETE DOCTOR
  =========================================================

  API:
  DELETE /doctors/{id}

  USE CASE:
  - Remove doctor from system (admin action)
  */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.url}/${id}`
    );
  }
}
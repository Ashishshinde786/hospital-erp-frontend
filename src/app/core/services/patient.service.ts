import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Patient } from '../models/models';

/*
=========================================================
SERVICE: PatientService
=========================================================

PURPOSE:
--------
This service handles all Patient-related operations by
communicating with backend APIs.

It is responsible for:
- Fetching patient data
- Creating new patients
- Updating patient details
- Deleting patients
- Searching patients
- Getting patient count (analytics)

---------------------------------------------------------

WHERE IT FITS:
--------------
Component → PatientService → HttpClient → Backend API

Used in:
- Patient registration form
- Patient list page
- Appointment module (select patient)
- Dashboard (patient count)

---------------------------------------------------------

WHY THIS SERVICE:
-----------------
- Centralized patient API logic
- Reusable across multiple components
- Keeps components focused on UI only
- Improves maintainability and testing

=========================================================
*/

@Injectable({
  providedIn: 'root' // Singleton service across the app
})
export class PatientService {

  /*
  ---------------------------------------------------------
  BASE URL for Patient APIs

  Example:
  http://localhost:8080/api/patients
  ---------------------------------------------------------
  */
  private url = `${environment.apiUrl}/patients`;

  /*
  ---------------------------------------------------------
  Inject HttpClient for API communication
  ---------------------------------------------------------
  */
  constructor(private http: HttpClient) {}



  /*
  =========================================================
  GET ALL PATIENTS
  =========================================================

  API:
  GET /patients

  USE CASE:
  - Display all patients in table/list
  */
  getAll(): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(this.url);
  }



  /*
  =========================================================
  GET PATIENT BY ID
  =========================================================

  API:
  GET /patients/{id}

  USE CASE:
  - View or edit a specific patient
  */
  getById(id: number): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.url}/${id}`);
  }



  /*
  =========================================================
  CREATE PATIENT
  =========================================================

  API:
  POST /patients

  BODY:
  Patient object

  USE CASE:
  - Register new patient
  */
  create(patient: Patient): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(
      this.url,
      patient
    );
  }



  /*
  =========================================================
  UPDATE PATIENT
  =========================================================

  API:
  PUT /patients/{id}

  USE CASE:
  - Update patient details (profile, contact info, etc.)
  */
  update(
    id: number,
    patient: Patient
  ): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(
      `${this.url}/${id}`,
      patient
    );
  }



  /*
  =========================================================
  DELETE PATIENT
  =========================================================

  API:
  DELETE /patients/{id}

  USE CASE:
  - Remove patient record (admin action)
  */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.url}/${id}`
    );
  }



  /*
  =========================================================
  SEARCH PATIENTS
  =========================================================

  API:
  GET /patients/search?q=keyword

  PURPOSE:
  --------
  - Search patients by name, phone, etc.

  NOTE:
  -----
  - Query parameter 'q' is sent to backend
  */
  search(q: string): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(
      `${this.url}/search`,
      {
        params: { q }
      }
    );
  }



  /*
  =========================================================
  GET PATIENT COUNT
  =========================================================

  API:
  GET /patients/count

  RETURNS:
  Total number of patients

  USE CASE:
  - Dashboard analytics
  */
  getCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.url}/count`
    );
  }
}
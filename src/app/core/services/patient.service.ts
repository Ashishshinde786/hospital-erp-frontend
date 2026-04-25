import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Patient } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private url = `${environment.apiUrl}/patients`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Patient[]>> { return this.http.get<ApiResponse<Patient[]>>(this.url); }
  getById(id: number): Observable<ApiResponse<Patient>> { return this.http.get<ApiResponse<Patient>>(`${this.url}/${id}`); }
  create(patient: Patient): Observable<ApiResponse<Patient>> { return this.http.post<ApiResponse<Patient>>(this.url, patient); }
  update(id: number, patient: Patient): Observable<ApiResponse<Patient>> { return this.http.put<ApiResponse<Patient>>(`${this.url}/${id}`, patient); }
  delete(id: number): Observable<ApiResponse<void>> { return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`); }
  search(q: string): Observable<ApiResponse<Patient[]>> { return this.http.get<ApiResponse<Patient[]>>(`${this.url}/search`, { params: { q } }); }
  getCount(): Observable<ApiResponse<number>> { return this.http.get<ApiResponse<number>>(`${this.url}/count`); }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Doctor } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private url = `${environment.apiUrl}/doctors`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Doctor[]>> { return this.http.get<ApiResponse<Doctor[]>>(this.url); }
  getById(id: number): Observable<ApiResponse<Doctor>> { return this.http.get<ApiResponse<Doctor>>(`${this.url}/${id}`); }
  getAvailable(): Observable<ApiResponse<Doctor[]>> { return this.http.get<ApiResponse<Doctor[]>>(`${this.url}/available`); }
  getBySpecialization(spec: string): Observable<ApiResponse<Doctor[]>> { return this.http.get<ApiResponse<Doctor[]>>(`${this.url}/specialization/${spec}`); }
  create(doctor: Doctor): Observable<ApiResponse<Doctor>> { return this.http.post<ApiResponse<Doctor>>(this.url, doctor); }
  update(id: number, doctor: Doctor): Observable<ApiResponse<Doctor>> { return this.http.put<ApiResponse<Doctor>>(`${this.url}/${id}`, doctor); }
  delete(id: number): Observable<ApiResponse<void>> { return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`); }
}
import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ApiResponse,
  Appointment
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly url =
    `${environment.apiUrl}/appointments`;

  constructor(
    private http: HttpClient
  ) {}

  getAll(): Observable<ApiResponse<Appointment[]>> {

    return this.http.get<ApiResponse<Appointment[]>>(
      this.url
    );
  }

  getById(
    id: number
  ): Observable<ApiResponse<Appointment>> {

    return this.http.get<ApiResponse<Appointment>>(
      `${this.url}/${id}`
    );
  }

  create(
    appointment: Appointment
  ): Observable<ApiResponse<Appointment>> {

    return this.http.post<ApiResponse<Appointment>>(
      this.url,
      appointment
    );
  }

  update(
    id: number,
    appointment: Appointment
  ): Observable<ApiResponse<Appointment>> {

    return this.http.put<ApiResponse<Appointment>>(
      `${this.url}/${id}`,
      appointment
    );
  }

  updateStatus(
    id: number,
    status: string
  ): Observable<ApiResponse<Appointment>> {

    return this.http.patch<ApiResponse<Appointment>>(
      `${this.url}/${id}/status`,
      null,
      {
        params: { status }
      }
    );
  }

  delete(
    id: number
  ): Observable<ApiResponse<void>> {

    return this.http.delete<ApiResponse<void>>(
      `${this.url}/${id}`
    );
  }
}
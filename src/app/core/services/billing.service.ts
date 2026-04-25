import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Invoice } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private url = `${environment.apiUrl}/billing`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Invoice[]>> { return this.http.get<ApiResponse<Invoice[]>>(this.url); }
  getById(id: number): Observable<ApiResponse<Invoice>> { return this.http.get<ApiResponse<Invoice>>(`${this.url}/${id}`); }
  getByPatient(patientId: number): Observable<ApiResponse<Invoice[]>> { return this.http.get<ApiResponse<Invoice[]>>(`${this.url}/patient/${patientId}`); }
  create(invoice: Invoice): Observable<ApiResponse<Invoice>> { return this.http.post<ApiResponse<Invoice>>(this.url, invoice); }
  processPayment(id: number, amount: number, method: string): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${this.url}/${id}/payment`, null, { params: { amount: amount.toString(), method } });
  }
  getRevenue(): Observable<ApiResponse<number>> { return this.http.get<ApiResponse<number>>(`${this.url}/revenue`); }
}
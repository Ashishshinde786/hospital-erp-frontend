import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Medicine } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private url = `${environment.apiUrl}/pharmacy`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Medicine[]>> { return this.http.get<ApiResponse<Medicine[]>>(this.url); }
  getById(id: number): Observable<ApiResponse<Medicine>> { return this.http.get<ApiResponse<Medicine>>(`${this.url}/${id}`); }
  search(name: string): Observable<ApiResponse<Medicine[]>> { return this.http.get<ApiResponse<Medicine[]>>(`${this.url}/search`, { params: { name } }); }
  getLowStock(threshold: number = 10): Observable<ApiResponse<Medicine[]>> {
    return this.http.get<ApiResponse<Medicine[]>>(`${this.url}/low-stock`, { params: { threshold: threshold.toString() } });
  }
  create(medicine: Medicine): Observable<ApiResponse<Medicine>> { return this.http.post<ApiResponse<Medicine>>(this.url, medicine); }
  update(id: number, medicine: Medicine): Observable<ApiResponse<Medicine>> { return this.http.put<ApiResponse<Medicine>>(`${this.url}/${id}`, medicine); }
  updateStock(id: number, quantity: number): Observable<ApiResponse<Medicine>> {
    return this.http.patch<ApiResponse<Medicine>>(`${this.url}/${id}/stock`, null, { params: { quantity: quantity.toString() } });
  }
  delete(id: number): Observable<ApiResponse<void>> { return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`); }
}
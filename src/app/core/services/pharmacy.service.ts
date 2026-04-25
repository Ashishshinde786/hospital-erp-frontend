import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Medicine } from '../models/models';

/*
=========================================================
SERVICE: PharmacyService
=========================================================

PURPOSE:
--------
This service manages all Pharmacy-related operations in
the Hospital ERP system.

It is responsible for:
- Managing medicine inventory
- Searching medicines
- Tracking low stock
- Updating stock quantities
- CRUD operations for medicines

---------------------------------------------------------

WHERE IT FITS:
--------------
Component → PharmacyService → HttpClient → Backend API

Used in:
- Pharmacy dashboard
- Billing (medicine selection)
- Inventory management

---------------------------------------------------------

WHY THIS SERVICE:
-----------------
- Centralized pharmacy/inventory logic
- Reusable across modules (billing + pharmacy)
- Keeps UI components clean
- Encapsulates backend API details

=========================================================
*/

@Injectable({
  providedIn: 'root' // Singleton service across application
})
export class PharmacyService {

  /*
  ---------------------------------------------------------
  BASE URL for Pharmacy APIs

  Example:
  http://localhost:8080/api/pharmacy
  ---------------------------------------------------------
  */
  private url = `${environment.apiUrl}/pharmacy`;

  /*
  ---------------------------------------------------------
  Inject HttpClient for API communication
  ---------------------------------------------------------
  */
  constructor(private http: HttpClient) {}



  /*
  =========================================================
  GET ALL MEDICINES
  =========================================================

  API:
  GET /pharmacy

  USE CASE:
  - Display all medicines in inventory
  */
  getAll(): Observable<ApiResponse<Medicine[]>> {
    return this.http.get<ApiResponse<Medicine[]>>(this.url);
  }



  /*
  =========================================================
  GET MEDICINE BY ID
  =========================================================

  API:
  GET /pharmacy/{id}

  USE CASE:
  - View medicine details
  */
  getById(id: number): Observable<ApiResponse<Medicine>> {
    return this.http.get<ApiResponse<Medicine>>(`${this.url}/${id}`);
  }



  /*
  =========================================================
  SEARCH MEDICINES
  =========================================================

  API:
  GET /pharmacy/search?name=paracetamol

  PURPOSE:
  --------
  - Search medicines by name

  NOTE:
  -----
  - 'name' is passed as query parameter
  */
  search(name: string): Observable<ApiResponse<Medicine[]>> {
    return this.http.get<ApiResponse<Medicine[]>>(
      `${this.url}/search`,
      {
        params: { name }
      }
    );
  }



  /*
  =========================================================
  GET LOW STOCK MEDICINES
  =========================================================

  API:
  GET /pharmacy/low-stock?threshold=10

  PURPOSE:
  --------
  - Identify medicines running low in stock

  DEFAULT:
  --------
  threshold = 10 (if not provided)

  NOTE:
  -----
  - Threshold converted to string for query param
  */
  getLowStock(
    threshold: number = 10
  ): Observable<ApiResponse<Medicine[]>> {
    return this.http.get<ApiResponse<Medicine[]>>(
      `${this.url}/low-stock`,
      {
        params: {
          threshold: threshold.toString()
        }
      }
    );
  }



  /*
  =========================================================
  CREATE MEDICINE
  =========================================================

  API:
  POST /pharmacy

  BODY:
  Medicine object

  USE CASE:
  - Add new medicine to inventory
  */
  create(medicine: Medicine): Observable<ApiResponse<Medicine>> {
    return this.http.post<ApiResponse<Medicine>>(
      this.url,
      medicine
    );
  }



  /*
  =========================================================
  UPDATE MEDICINE
  =========================================================

  API:
  PUT /pharmacy/{id}

  USE CASE:
  - Update medicine details (price, expiry, etc.)
  */
  update(
    id: number,
    medicine: Medicine
  ): Observable<ApiResponse<Medicine>> {
    return this.http.put<ApiResponse<Medicine>>(
      `${this.url}/${id}`,
      medicine
    );
  }



  /*
  =========================================================
  UPDATE STOCK QUANTITY
  =========================================================

  API:
  PATCH /pharmacy/{id}/stock?quantity=50

  PURPOSE:
  --------
  - Update stock without modifying entire object

  WHY PATCH?
  ----------
  - Partial update (only stock changes)

  NOTE:
  -----
  - Sending null body (only query param used)
  */
  updateStock(
    id: number,
    quantity: number
  ): Observable<ApiResponse<Medicine>> {
    return this.http.patch<ApiResponse<Medicine>>(
      `${this.url}/${id}/stock`,
      null,
      {
        params: {
          quantity: quantity.toString()
        }
      }
    );
  }



  /*
  =========================================================
  DELETE MEDICINE
  =========================================================

  API:
  DELETE /pharmacy/{id}

  USE CASE:
  - Remove medicine from inventory
  */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.url}/${id}`
    );
  }
}
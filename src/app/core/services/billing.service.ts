import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Invoice } from '../models/models';

/*
=========================================================
SERVICE: BillingService
=========================================================

PURPOSE:
--------
This service handles all billing-related operations in the
Hospital ERP system.

It is responsible for:
- Fetching invoices
- Creating invoices
- Processing payments
- Getting revenue analytics

---------------------------------------------------------

WHERE IT FITS:
--------------
Component → BillingService → HttpClient → Backend API

Used in:
- Billing module UI
- Payment screens
- Admin revenue dashboard

---------------------------------------------------------

WHY THIS SERVICE:
-----------------
- Centralizes billing logic
- Reusable across multiple components
- Keeps UI layer clean
- Encapsulates API details

=========================================================
*/

@Injectable({
  providedIn: 'root' // Singleton service available globally
})
export class BillingService {

  /*
  ---------------------------------------------------------
  BASE URL for Billing APIs

  Example:
  http://localhost:8080/api/billing
  ---------------------------------------------------------
  */
  private url = `${environment.apiUrl}/billing`;

  /*
  ---------------------------------------------------------
  Inject HttpClient for API communication
  ---------------------------------------------------------
  */
  constructor(private http: HttpClient) {}



  /*
  =========================================================
  GET ALL INVOICES
  =========================================================

  API:
  GET /billing

  USE CASE:
  - Admin views all invoices
  */
  getAll(): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>(this.url);
  }



  /*
  =========================================================
  GET INVOICE BY ID
  =========================================================

  API:
  GET /billing/{id}

  USE CASE:
  - View specific invoice details
  */
  getById(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.url}/${id}`);
  }



  /*
  =========================================================
  GET INVOICES BY PATIENT
  =========================================================

  API:
  GET /billing/patient/{patientId}

  USE CASE:
  - Show billing history of a patient
  */
  getByPatient(patientId: number): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>(
      `${this.url}/patient/${patientId}`
    );
  }



  /*
  =========================================================
  CREATE INVOICE
  =========================================================

  API:
  POST /billing

  BODY:
  Invoice object

  USE CASE:
  - Generate bill after appointment
  */
  create(invoice: Invoice): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(this.url, invoice);
  }



  /*
  =========================================================
  PROCESS PAYMENT
  =========================================================

  API:
  POST /billing/{id}/payment?amount=500&method=CASH

  PURPOSE:
  --------
  - Record payment for an invoice
  - Supports partial/full payment

  PARAMETERS:
  -----------
  id     → invoice ID
  amount → payment amount
  method → payment method (CASH, CARD, UPI, etc.)

  NOTE:
  -----
  - Sending null body (data passed via query params)
  - amount converted to string (required for params)

  =========================================================
  */
  processPayment(
    id: number,
    amount: number,
    method: string
  ): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(
      `${this.url}/${id}/payment`,
      null,
      {
        params: {
          amount: amount.toString(),
          method
        }
      }
    );
  }



  /*
  =========================================================
  GET TOTAL REVENUE
  =========================================================

  API:
  GET /billing/revenue

  RETURNS:
  Total revenue (number)

  USE CASE:
  - Dashboard analytics
  - Financial reporting

  =========================================================
  */
  getRevenue(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.url}/revenue`);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice } from '../../../core/models/models';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';

/*
=========================================================
COMPONENT: InvoiceListComponent
=========================================================

PURPOSE:
--------
This component manages the entire Billing & Invoice page.

It is responsible for:
- Fetching invoices from backend
- Displaying invoice list
- Calculating revenue statistics
- Searching & filtering invoices
- Opening invoice creation modal
- Handling payment processing
- Showing success/error messages

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
UI (HTML) ↔ Component ↔ BillingService ↔ Backend

User Action → Component Method → Service Call → API

---------------------------------------------------------

RELATIONSHIP WITH OTHER PARTS:
------------------------------
- Uses BillingService → API communication
- Uses InvoiceFormComponent → create invoice modal
- Uses template (HTML) → :contentReference[oaicite:0]{index=0}

---------------------------------------------------------

KEY CONCEPTS:
-------------
- Standalone component
- State management (local state)
- Two-way binding (ngModel)
- Derived data (counts, outstanding)
- Modal handling
- Observables (API calls)
- Separation of concerns

=========================================================
*/

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InvoiceFormComponent],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {

  /*
  =========================================================
  STATE: DATA
  =========================================================
  */
  invoices: Invoice[] = []; // Original list from backend
  filtered: Invoice[] = []; // Filtered list for UI

  loading = false;

  /*
  =========================================================
  FILTER STATE
  =========================================================
  */
  searchQuery = '';
  filterStatus = '';



  /*
  =========================================================
  DASHBOARD DATA
  =========================================================
  */
  totalRevenue = 0;



  /*
  =========================================================
  MODAL STATE
  =========================================================
  */
  showForm = false;           // Invoice form modal
  showPaymentModal = false;  // Payment modal



  /*
  =========================================================
  PAYMENT STATE
  =========================================================
  */
  selectedInvoice: Invoice | null = null;

  paymentAmount = 0;
  paymentMethod = 'CASH';

  paymentMethods = [
    'CASH',
    'CARD',
    'UPI',
    'INSURANCE',
    'ONLINE'
  ];



  /*
  =========================================================
  ENUM-LIKE OPTIONS
  =========================================================
  */
  statusOptions = [
    'PENDING',
    'PARTIAL',
    'PAID',
    'CANCELLED'
  ];



  /*
  =========================================================
  UI MESSAGES
  =========================================================
  */
  successMessage = '';
  errorMessage = '';



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================
  */
  constructor(private billingService: BillingService) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================
  */
  ngOnInit(): void {
    this.loadInvoices();
  }



  /*
  =========================================================
  LOAD INVOICES + REVENUE
  =========================================================

  NOTE:
  - Two API calls:
    1. getAll invoices
    2. getRevenue summary

  =========================================================
  */
  loadInvoices(): void {

    this.loading = true;

    /*
    -----------------------------------------------------
    FETCH ALL INVOICES
    -----------------------------------------------------
    */
    this.billingService.getAll().subscribe({

      next: (res) => {
        this.invoices = res.data || [];

        // Apply filters after loading
        this.applyFilter();

        this.loading = false;
      },

      error: () => {
        this.loading = false;
      }
    });



    /*
    -----------------------------------------------------
    FETCH TOTAL REVENUE
    -----------------------------------------------------
    */
    this.billingService.getRevenue().subscribe({

      next: (res) => {
        this.totalRevenue = res.data || 0;
      }
    });
  }



  /*
  =========================================================
  FILTER LOGIC
  =========================================================

  Filters by:
  - Payment status
  - Search (patient name or invoice ID)

  IMPORTANT:
  ----------
  Always filter from original list

  =========================================================
  */
  applyFilter(): void {

    let list = [...this.invoices];

    /*
    -----------------------------------------------------
    FILTER BY STATUS
    -----------------------------------------------------
    */
    if (this.filterStatus) {
      list = list.filter(i => i.paymentStatus === this.filterStatus);
    }

    /*
    -----------------------------------------------------
    SEARCH FILTER
    -----------------------------------------------------
    */
    const q = this.searchQuery.toLowerCase().trim();

    if (q) {
      list = list.filter(i =>
        (i.patientName || '').toLowerCase().includes(q) ||
        String(i.id).includes(q)
      );
    }

    this.filtered = list;
  }



  /*
  =========================================================
  CREATE INVOICE
  =========================================================
  */
  openCreate(): void {
    this.showForm = true;
  }

  onFormSaved(): void {
    this.showForm = false;

    // Reload data after creation
    this.loadInvoices();

    this.showSuccess('Invoice created!');
  }

  onFormCancelled(): void {
    this.showForm = false;
  }



  /*
  =========================================================
  PAYMENT FLOW
  =========================================================
  */

  /*
  STEP 1: Open payment modal
  */
  openPayment(invoice: Invoice): void {

    this.selectedInvoice = invoice;

    /*
    Calculate outstanding amount:
    total - paid
    */
    this.paymentAmount =
      Number(invoice.totalAmount) -
      Number(invoice.paidAmount || 0);

    this.paymentMethod = 'CASH';

    this.showPaymentModal = true;
  }



  /*
  STEP 2: Process payment
  */
  processPayment(): void {

    // Validation
    if (!this.selectedInvoice?.id || !this.paymentAmount) {
      return;
    }

    this.billingService.processPayment(
      this.selectedInvoice.id,
      this.paymentAmount,
      this.paymentMethod
    ).subscribe({

      // SUCCESS
      next: () => {
        this.showPaymentModal = false;
        this.selectedInvoice = null;

        this.loadInvoices();

        this.showSuccess('Payment processed!');
      },

      // ERROR
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Payment failed.';
      }
    });
  }



  /*
  =========================================================
  SUCCESS MESSAGE HANDLER
  =========================================================
  */
  showSuccess(msg: string): void {
    this.successMessage = msg;

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }



  /*
  =========================================================
  UI HELPERS
  =========================================================
  */

  /*
  Status badge mapping
  */
  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-warning',
      PARTIAL: 'badge-info',
      PAID: 'badge-success',
      CANCELLED: 'badge-danger'
    };

    return map[status] || 'badge-muted';
  }



  /*
  Outstanding amount calculation
  */
  getOutstanding(inv: Invoice): number {
    return Number(inv.totalAmount || 0) -
           Number(inv.paidAmount || 0);
  }



  /*
  =========================================================
  DERIVED STATS (GETTERS)
  =========================================================
  */

  get pendingCount(): number {
    return this.invoices.filter(i => i.paymentStatus === 'PENDING').length;
  }

  get paidCount(): number {
    return this.invoices.filter(i => i.paymentStatus === 'PAID').length;
  }

  get partialCount(): number {
    return this.invoices.filter(i => i.paymentStatus === 'PARTIAL').length;
  }
}
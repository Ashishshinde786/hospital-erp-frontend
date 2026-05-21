import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice } from '../../../core/models/models';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InvoiceFormComponent],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {

  invoices:        Invoice[] = [];
  filtered:        Invoice[] = [];
  loading          = true;
  searchQuery      = '';
  filterStatus     = '';
  totalRevenue     = 0;
  showForm         = false;
  showPaymentModal = false;
  selectedInvoice: Invoice | null = null;
  paymentAmount    = 0;
  paymentMethod    = 'CASH';
  successMessage   = '';
  errorMessage     = '';

  skeletonRows   = Array(7);
  paymentMethods = ['CASH', 'CARD', 'UPI', 'INSURANCE', 'ONLINE'];
  statusOptions  = ['PENDING', 'PARTIAL', 'PAID', 'CANCELLED'];

  constructor(private billingService: BillingService) {}

  ngOnInit(): void { this.loadInvoices(); }

  loadInvoices(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      invoices: this.billingService.getAll(),
      revenue:  this.billingService.getRevenue()
    }).subscribe({
      next: (res) => {
        this.invoices     = res.invoices?.data || [];
        this.totalRevenue = Number(res.revenue?.data) || 0;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load invoices.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let list = [...this.invoices];
    if (this.filterStatus) list = list.filter(i => i.paymentStatus === this.filterStatus);
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(i =>
        (i.patientName || '').toLowerCase().includes(query) ||
        String(i.id).includes(query)
      );
    }
    this.filtered = list;
  }

  openCreate(): void  { this.showForm = true; }
  onFormCancelled(): void { this.showForm = false; }

  onFormSaved(): void {
    this.showForm = false;
    this.loadInvoices();
    this.showSuccess('Invoice created successfully.');
  }

  openPayment(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.paymentAmount = Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0);
    this.paymentMethod = 'CASH';
    this.showPaymentModal = true;
  }

  processPayment(): void {
    if (!this.selectedInvoice?.id || !this.paymentAmount) return;
    this.billingService.processPayment(
      this.selectedInvoice.id, this.paymentAmount, this.paymentMethod
    ).subscribe({
      next: () => {
        this.showPaymentModal = false;
        this.selectedInvoice = null;
        this.loadInvoices();
        this.showSuccess('Payment processed successfully.');
      },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to process payment.'; }
    });
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => { this.successMessage = ''; }, 3000);
  }

  getStatusBadge(status?: string | null): string {
    const map: Record<string, string> = {
      PENDING: 'badge-warning', PARTIAL: 'badge-info',
      PAID: 'badge-success', CANCELLED: 'badge-danger'
    };
    return status ? (map[status] || 'badge-muted') : 'badge-muted';
  }

  getOutstanding(invoice: Invoice): number {
    return Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0);
  }

  get pendingCount()   { return this.invoices.filter(i => i.paymentStatus === 'PENDING').length; }
  get partialCount()   { return this.invoices.filter(i => i.paymentStatus === 'PARTIAL').length; }
  get paidCount()      { return this.invoices.filter(i => i.paymentStatus === 'PAID').length; }
  get cancelledCount() { return this.invoices.filter(i => i.paymentStatus === 'CANCELLED').length; }
}
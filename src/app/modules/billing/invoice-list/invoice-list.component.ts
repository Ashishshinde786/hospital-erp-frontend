import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  invoices: Invoice[] = [];
  filtered: Invoice[] = [];
  loading = false;
  searchQuery = '';
  filterStatus = '';
  totalRevenue = 0;
  showForm = false;
  showPaymentModal = false;
  selectedInvoice: Invoice | null = null;
  paymentAmount = 0;
  paymentMethod = 'CASH';
  paymentMethods = ['CASH', 'CARD', 'UPI', 'INSURANCE', 'ONLINE'];
  statusOptions = ['PENDING', 'PARTIAL', 'PAID', 'CANCELLED'];
  successMessage = '';
  errorMessage = '';

  constructor(private billingService: BillingService) {}

  ngOnInit(): void { this.loadInvoices(); }

  loadInvoices(): void {
    this.loading = true;
    this.billingService.getAll().subscribe({
      next: (res) => { this.invoices = res.data || []; this.applyFilter(); this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.billingService.getRevenue().subscribe({
      next: (res) => { this.totalRevenue = res.data || 0; }
    });
  }

  applyFilter(): void {
    let list = [...this.invoices];
    if (this.filterStatus) list = list.filter(i => i.paymentStatus === this.filterStatus);
    const q = this.searchQuery.toLowerCase().trim();
    if (q) list = list.filter(i => (i.patientName || '').toLowerCase().includes(q) || String(i.id).includes(q));
    this.filtered = list;
  }

  openCreate(): void { this.showForm = true; }
  onFormSaved(): void { this.showForm = false; this.loadInvoices(); this.showSuccess('Invoice created!'); }
  onFormCancelled(): void { this.showForm = false; }

  openPayment(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.paymentAmount = Number(invoice.totalAmount) - Number(invoice.paidAmount || 0);
    this.paymentMethod = 'CASH';
    this.showPaymentModal = true;
  }

  processPayment(): void {
    if (!this.selectedInvoice?.id || !this.paymentAmount) return;
    this.billingService.processPayment(this.selectedInvoice.id, this.paymentAmount, this.paymentMethod).subscribe({
      next: () => { this.showPaymentModal = false; this.selectedInvoice = null; this.loadInvoices(); this.showSuccess('Payment processed!'); },
      error: (err) => { this.errorMessage = err.error?.message || 'Payment failed.'; }
    });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = { PENDING: 'badge-warning', PARTIAL: 'badge-info', PAID: 'badge-success', CANCELLED: 'badge-danger' };
    return map[status] || 'badge-muted';
  }

  getOutstanding(inv: Invoice): number {
    return Number(inv.totalAmount || 0) - Number(inv.paidAmount || 0);
  }

  get pendingCount(): number  { return this.invoices.filter(i => i.paymentStatus === 'PENDING').length; }
  get paidCount(): number     { return this.invoices.filter(i => i.paymentStatus === 'PAID').length; }
  get partialCount(): number  { return this.invoices.filter(i => i.paymentStatus === 'PARTIAL').length; }
}
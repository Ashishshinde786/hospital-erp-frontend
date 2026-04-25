import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BillingService } from '../../../core/services/billing.service';
import { PatientService } from '../../../core/services/patient.service';
import { Patient, Invoice } from '../../../core/models/models';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  loadingPatients = true;
  error = '';
  patients: Patient[] = [];
  itemTypes = ['CONSULTATION', 'MEDICINE', 'LAB_TEST', 'PROCEDURE', 'ROOM_CHARGE', 'OTHER'];

  constructor(
    private fb: FormBuilder,
    private billingService: BillingService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.patientService.getAll().subscribe({
      next: (res) => { this.patients = res.data || []; this.loadingPatients = false; },
      error: () => { this.loadingPatients = false; }
    });
    this.form = this.fb.group({
      patientId:     ['', Validators.required],
      appointmentId: [''],
      items: this.fb.array([this.createItem()])
    });
  }

  createItem(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      quantity:    [1, [Validators.required, Validators.min(1)]],
      unitPrice:   ['', [Validators.required, Validators.min(0.01)]],
      itemType:    ['CONSULTATION']
    });
  }

  get items(): FormArray { return this.form.get('items') as FormArray; }
  addItem(): void { this.items.push(this.createItem()); }
  removeItem(index: number): void { if (this.items.length > 1) this.items.removeAt(index); }

  get totalAmount(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const qty   = Number(ctrl.get('quantity')?.value)  || 0;
      const price = Number(ctrl.get('unitPrice')?.value) || 0;
      return sum + qty * price;
    }, 0);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const raw = this.form.value;
    const payload: Invoice = {
      patientId:     Number(raw.patientId),
      appointmentId: raw.appointmentId ? Number(raw.appointmentId) : undefined,
      items: raw.items.map((item: any) => ({
        ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice)
      }))
    };
    this.billingService.create(payload).subscribe({
      next:  ()    => { this.loading = false; this.saved.emit(); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Save failed.'; }
    });
  }
}
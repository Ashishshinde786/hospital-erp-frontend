import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Medicine } from '../../../core/models/models';

@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicine-form.component.html'
})
export class MedicineFormComponent implements OnInit {
  @Input() medicine: Medicine | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  error = '';

  categories = [
    'Antibiotic', 'Analgesic / Painkiller', 'Antipyretic', 'Antacid',
    'Antidiabetic', 'Antihypertensive', 'Antihistamine', 'Antifungal',
    'Antiviral', 'Vitamins & Supplements', 'Antiseptic', 'Laxative',
    'Cough & Cold', 'Cardiac', 'Dermatology', 'Other'
  ];

  constructor(private fb: FormBuilder, private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:          [this.medicine?.name          || '', Validators.required],
      manufacturer:  [this.medicine?.manufacturer  || ''],
      category:      [this.medicine?.category      || ''],
      price:         [this.medicine?.price         || '', [Validators.required, Validators.min(0.01)]],
      stockQuantity: [this.medicine?.stockQuantity ?? 0,  [Validators.required, Validators.min(0)]],
      expiryDate:    [this.medicine?.expiryDate    || ''],
      batchNumber:   [this.medicine?.batchNumber   || ''],
    });
  }

  get isEdit(): boolean { return !!this.medicine?.id; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const payload: Medicine = { ...this.form.value, active: true };
    const obs = this.isEdit
      ? this.pharmacyService.update(this.medicine!.id!, payload)
      : this.pharmacyService.create(payload);
    obs.subscribe({
      next:  ()    => { this.loading = false; this.saved.emit(); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Save failed.'; }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Medicine } from '../../../core/models/models';
import { MedicineFormComponent } from '../medicine-form/medicine-form.component';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MedicineFormComponent],
  templateUrl: './medicine-list.component.html',
  styleUrls: ['./medicine-list.component.scss']
})
export class MedicineListComponent implements OnInit {
  medicines: Medicine[] = [];
  filtered: Medicine[] = [];
  loading = false;
  searchQuery = '';
  showLowStock = false;
  showForm = false;
  editingMedicine: Medicine | null = null;
  deleteConfirmId: number | null = null;
  showStockModal = false;
  stockMedicine: Medicine | null = null;
  stockQuantity = 0;
  successMessage = '';
  errorMessage = '';

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void { this.loadMedicines(); }

  loadMedicines(): void {
    this.loading = true;
    const obs = this.showLowStock
      ? this.pharmacyService.getLowStock(10)
      : this.pharmacyService.getAll();
    obs.subscribe({
      next: (res) => { this.medicines = res.data || []; this.applySearch(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applySearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = q
      ? this.medicines.filter(m =>
          m.name.toLowerCase().includes(q) ||
          (m.manufacturer || '').toLowerCase().includes(q) ||
          (m.category     || '').toLowerCase().includes(q))
      : [...this.medicines];
  }

  openCreate(): void { this.editingMedicine = null; this.showForm = true; }
  openEdit(m: Medicine): void { this.editingMedicine = { ...m }; this.showForm = true; }
  onFormSaved(): void { this.showForm = false; this.editingMedicine = null; this.loadMedicines(); this.showSuccess('Medicine saved!'); }
  onFormCancelled(): void { this.showForm = false; this.editingMedicine = null; }

  openStockUpdate(m: Medicine): void { this.stockMedicine = m; this.stockQuantity = 0; this.showStockModal = true; }

  confirmStockUpdate(): void {
    if (!this.stockMedicine?.id || this.stockQuantity === 0) return;
    this.pharmacyService.updateStock(this.stockMedicine.id, this.stockQuantity).subscribe({
      next: () => { this.showStockModal = false; this.stockMedicine = null; this.loadMedicines(); this.showSuccess('Stock updated!'); },
      error: (err) => { this.errorMessage = err.error?.message || 'Stock update failed.'; }
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  doDelete(): void {
    if (!this.deleteConfirmId) return;
    this.pharmacyService.delete(this.deleteConfirmId).subscribe({
      next: () => { this.deleteConfirmId = null; this.loadMedicines(); this.showSuccess('Medicine deactivated.'); },
      error: (err) => { this.errorMessage = err.error?.message || 'Delete failed.'; this.deleteConfirmId = null; }
    });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  isExpired(expiryDate: string): boolean {
    return expiryDate ? new Date(expiryDate) < new Date() : false;
  }

  isExpiringSoon(expiryDate: string): boolean {
    if (!expiryDate) return false;
    const now = new Date();
    const exp = new Date(expiryDate);
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 90;
  }

  get lowStockCount(): number { return this.medicines.filter(m => m.stockQuantity < 10).length; }
  get expiredCount(): number  { return this.medicines.filter(m => this.isExpired(m.expiryDate || '')).length; }
}
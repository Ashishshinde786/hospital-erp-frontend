import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Medicine } from '../../../core/models/models';
import { MedicineFormComponent } from '../medicine-form/medicine-form.component';

/*
=========================================================
COMPONENT: MedicineListComponent
=========================================================

PURPOSE:
--------
This component manages the Pharmacy Inventory system.

It handles:
- Fetching medicines
- Searching & filtering
- Stock management
- Expiry tracking
- Create / Edit / Soft delete
- Inventory analytics (low stock, expired)

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
UI (HTML Template)
        ↓
MedicineListComponent
        ↓
PharmacyService (API)
        ↓
Backend

---------------------------------------------------------

RELATIONSHIP:
-------------
Medicine is used in:
- Pharmacy → stock tracking
- Billing → invoice items
- Dashboard → alerts

---------------------------------------------------------

KEY CONCEPTS:
-------------
- State management (local)
- CRUD operations
- Derived calculations (expiry, stock)
- Modal workflows
- Soft delete pattern
- Conditional API calls
- Getter-based computed values

=========================================================
*/

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MedicineFormComponent],
  templateUrl: './medicine-list.component.html',
  styleUrls: ['./medicine-list.component.scss']
})
export class MedicineListComponent implements OnInit {

  /*
  =========================================================
  DATA STATE
  =========================================================
  */
  medicines: Medicine[] = [];
  filtered: Medicine[] = [];



  /*
  =========================================================
  UI STATE
  =========================================================
  */
  loading = false;



  /*
  =========================================================
  SEARCH + FILTER
  =========================================================
  */
  searchQuery = '';
  showLowStock = false;



  /*
  =========================================================
  FORM MODAL STATE
  =========================================================
  */
  showForm = false;
  editingMedicine: Medicine | null = null;



  /*
  =========================================================
  DELETE STATE (SOFT DELETE)
  =========================================================
  */
  deleteConfirmId: number | null = null;



  /*
  =========================================================
  STOCK UPDATE STATE
  =========================================================
  */
  showStockModal = false;
  stockMedicine: Medicine | null = null;
  stockQuantity = 0;



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
  constructor(private pharmacyService: PharmacyService) {}



  /*
  =========================================================
  LIFECYCLE: ngOnInit
  =========================================================
  */
  ngOnInit(): void {
    this.loadMedicines();
  }



  /*
  =========================================================
  LOAD MEDICINES
  =========================================================

  LOGIC:
  ------
  If "low stock filter" is ON:
      → call getLowStock API
  Else:
      → call getAll API

  =========================================================
  */
  loadMedicines(): void {

    this.loading = true;

    const obs = this.showLowStock
      ? this.pharmacyService.getLowStock(10)
      : this.pharmacyService.getAll();

    obs.subscribe({

      // SUCCESS
      next: (res) => {

        this.medicines = res.data || [];

        this.applySearch();

        this.loading = false;
      },

      // ERROR
      error: () => {
        this.loading = false;
      }
    });
  }



  /*
  =========================================================
  SEARCH LOGIC
  =========================================================
  */
  applySearch(): void {

    const q = this.searchQuery.toLowerCase().trim();

    this.filtered = q
      ? this.medicines.filter(m =>

          m.name.toLowerCase().includes(q) ||

          (m.manufacturer || '')
            .toLowerCase()
            .includes(q) ||

          (m.category || '')
            .toLowerCase()
            .includes(q)
        )

      : [...this.medicines];
  }



  /*
  =========================================================
  CREATE / EDIT FLOW
  =========================================================
  */

  openCreate(): void {
    this.editingMedicine = null;
    this.showForm = true;
  }



  openEdit(m: Medicine): void {
    this.editingMedicine = { ...m }; // clone
    this.showForm = true;
  }



  onFormSaved(): void {

    this.showForm = false;
    this.editingMedicine = null;

    this.loadMedicines();

    this.showSuccess('Medicine saved!');
  }



  onFormCancelled(): void {
    this.showForm = false;
    this.editingMedicine = null;
  }



  /*
  =========================================================
  STOCK UPDATE FLOW
  =========================================================
  */

  /*
  Open modal
  */
  openStockUpdate(m: Medicine): void {
    this.stockMedicine = m;
    this.stockQuantity = 0;
    this.showStockModal = true;
  }



  /*
  Confirm stock update
  */
  confirmStockUpdate(): void {

    if (!this.stockMedicine?.id || this.stockQuantity === 0) return;

    this.pharmacyService
      .updateStock(this.stockMedicine.id, this.stockQuantity)
      .subscribe({

        // SUCCESS
        next: () => {

          this.showStockModal = false;
          this.stockMedicine = null;

          this.loadMedicines();

          this.showSuccess('Stock updated!');
        },

        // ERROR
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Stock update failed.';
        }
      });
  }



  /*
  =========================================================
  DELETE FLOW (SOFT DELETE)
  =========================================================
  */

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }



  cancelDelete(): void {
    this.deleteConfirmId = null;
  }



  doDelete(): void {

    if (!this.deleteConfirmId) return;

    this.pharmacyService.delete(this.deleteConfirmId).subscribe({

      // SUCCESS
      next: () => {

        this.deleteConfirmId = null;

        this.loadMedicines();

        this.showSuccess('Medicine deactivated.');
      },

      // ERROR
      error: (err) => {

        this.errorMessage =
          err.error?.message || 'Delete failed.';

        this.deleteConfirmId = null;
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
  BUSINESS LOGIC: EXPIRY CHECK
  =========================================================
  */

  /*
  Check if expired
  */
  isExpired(expiryDate: string): boolean {
    return expiryDate
      ? new Date(expiryDate) < new Date()
      : false;
  }



  /*
  Check if expiring within 90 days
  */
  isExpiringSoon(expiryDate: string): boolean {

    if (!expiryDate) return false;

    const now = new Date();
    const exp = new Date(expiryDate);

    const diffDays =
      (exp.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 90;
  }



  /*
  =========================================================
  DERIVED STATS (GETTERS)
  =========================================================
  */

  /*
  Low stock count (< 10)
  */
  get lowStockCount(): number {
    return this.medicines.filter(
      m => m.stockQuantity < 10
    ).length;
  }



  /*
  Expired medicines count
  */
  get expiredCount(): number {
    return this.medicines.filter(
      m => this.isExpired(m.expiryDate || '')
    ).length;
  }
}
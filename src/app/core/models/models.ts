export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  medicalHistory?: string;
}

export interface Doctor {
  id?: number;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  email?: string;
  phone?: string;
  qualification?: string;
  bio?: string;
  available: boolean;
  userId?: number;
}

export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  appointmentDateTime: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason?: string;
  notes?: string;
  patientName?: string;
  doctorName?: string;
  doctorSpecialization?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  itemType?: 'CONSULTATION' | 'MEDICINE' | 'LAB_TEST' | 'PROCEDURE' | 'ROOM_CHARGE' | 'OTHER';
}

export interface Invoice {
  id?: number;
  patientId: number;
  appointmentId?: number;
  items: InvoiceItem[];
  totalAmount?: number;
  paidAmount?: number;
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'INSURANCE' | 'ONLINE';
  patientName?: string;
}

export interface Medicine {
  id?: number;
  name: string;
  manufacturer?: string;
  category?: string;
  price: number;
  stockQuantity: number;
  expiryDate?: string;
  batchNumber?: string;
  active: boolean;
}
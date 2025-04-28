// Vehicle related types
export type VehicleStatus = "available" | "rented" | "maintenance" | "unavailable";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: VehicleStatus;
  fuelType: string;
  image?: string;
  odometer: number; // in kilometers
  lastMaintenance?: string; // ISO date string
  notes?: string;
  dateAdded: string; // ISO date string
  lastUpdated: string; // ISO date string
}

// Rental related types
export interface Rental {
  id: string;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startDate: string; // ISO date string
  expectedEndDate: string; // ISO date string
  actualEndDate?: string; // ISO date string
  rentalRate: number; // in cedis per day
  totalAmount?: number; // in cedis
  deposit: number; // in cedis
  status: "active" | "completed" | "overdue" | "cancelled";
  notes?: string;
  dateCreated: string; // ISO date string
  lastUpdated: string; // ISO date string
}

// Maintenance related types
export interface Maintenance {
  id: string;
  vehicleId: string;
  type: "routine" | "repair" | "inspection";
  description: string;
  cost: number; // in cedis
  serviceDate: string; // ISO date string
  nextServiceDate?: string; // ISO date string
  serviceProvider: string;
  notes?: string;
  dateCreated: string; // ISO date string
  lastUpdated: string; // ISO date string
}

// Expenditure related types
export interface Expenditure {
  id: string;
  vehicleId?: string; // Optional, as some expenses might be general
  category: "fuel" | "maintenance" | "insurance" | "tax" | "other";
  amount: number; // in cedis
  date: string; // ISO date string
  description: string;
  receiptImage?: string;
  paymentMethod: "cash" | "card" | "mobile_money" | "bank_transfer";
  notes?: string;
  dateCreated: string; // ISO date string
  lastUpdated: string; // ISO date string
}

// Statistics and metrics
export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  unavailableVehicles: number;
  activeRentals: number;
  overdueRentals: number;
  monthlyRevenue: number; // in cedis
  monthlyExpenses: number; // in cedis
  upcomingMaintenance: number;
}

import { Vehicle, Rental, Maintenance, Expenditure, DashboardStats } from '../types';
import { toast } from '@/components/ui/use-toast';

// Storage keys
const KEYS = {
  VEHICLES: 'wheel-wise-vehicles',
  RENTALS: 'wheel-wise-rentals',
  MAINTENANCE: 'wheel-wise-maintenance',
  EXPENDITURES: 'wheel-wise-expenditures'
};

// Generic function to get items from localStorage
const getItems = <T>(key: string): T[] => {
  try {
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error(`Error getting items from ${key}:`, error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: `Failed to load data from storage. (${key})`
    });
    return [];
  }
};

// Generic function to save items to localStorage
const saveItems = <T>(key: string, items: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Error saving items to ${key}:`, error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: `Failed to save data to storage. (${key})`
    });
  }
};

// Vehicle Operations
export const getVehicles = (): Vehicle[] => getItems<Vehicle>(KEYS.VEHICLES);

export const getVehicleById = (id: string): Vehicle | undefined => {
  const vehicles = getVehicles();
  return vehicles.find(vehicle => vehicle.id === id);
};

export const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'dateAdded' | 'lastUpdated'>): Vehicle => {
  const vehicles = getVehicles();
  const now = new Date().toISOString();
  const newVehicle = {
    ...vehicle,
    id: `v-${Date.now()}`,
    dateAdded: now,
    lastUpdated: now
  };
  
  saveItems(KEYS.VEHICLES, [...vehicles, newVehicle]);
  toast({
    title: 'Vehicle Added',
    description: `${vehicle.make} ${vehicle.model} has been added to the fleet.`
  });
  return newVehicle;
};

export const updateVehicle = (updatedVehicle: Vehicle): Vehicle => {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === updatedVehicle.id);
  
  if (index !== -1) {
    const now = new Date().toISOString();
    const vehicle = {
      ...updatedVehicle,
      lastUpdated: now
    };
    
    vehicles[index] = vehicle;
    saveItems(KEYS.VEHICLES, vehicles);
    toast({
      title: 'Vehicle Updated',
      description: `${vehicle.make} ${vehicle.model} has been updated.`
    });
    return vehicle;
  }
  
  toast({
    variant: 'destructive',
    title: 'Update Failed',
    description: 'Vehicle not found.'
  });
  throw new Error('Vehicle not found');
};

export const deleteVehicle = (id: string): void => {
  const vehicles = getVehicles();
  const vehicle = vehicles.find(v => v.id === id);
  
  if (!vehicle) {
    toast({
      variant: 'destructive',
      title: 'Delete Failed',
      description: 'Vehicle not found.'
    });
    throw new Error('Vehicle not found');
  }
  
  // Check if vehicle has associated rentals or maintenance
  const rentals = getRentals().filter(r => r.vehicleId === id);
  const maintenance = getAllMaintenance().filter(m => m.vehicleId === id);
  
  if (rentals.length > 0 || maintenance.length > 0) {
    toast({
      variant: 'destructive',
      title: 'Delete Failed',
      description: 'Vehicle has associated rentals or maintenance records.'
    });
    throw new Error('Vehicle has associated records');
  }
  
  saveItems(KEYS.VEHICLES, vehicles.filter(v => v.id !== id));
  toast({
    title: 'Vehicle Deleted',
    description: `${vehicle.make} ${vehicle.model} has been removed from the fleet.`
  });
};

// Rental Operations
export const getRentals = (): Rental[] => getItems<Rental>(KEYS.RENTALS);

export const getRentalById = (id: string): Rental | undefined => {
  const rentals = getRentals();
  return rentals.find(rental => rental.id === id);
};

export const getActiveRentalsForVehicle = (vehicleId: string): Rental[] => {
  const rentals = getRentals();
  return rentals.filter(r => r.vehicleId === vehicleId && r.status === 'active');
};

export const addRental = (rental: Omit<Rental, 'id' | 'dateCreated' | 'lastUpdated'>): Rental => {
  const rentals = getRentals();
  const now = new Date().toISOString();
  const newRental = {
    ...rental,
    id: `r-${Date.now()}`,
    dateCreated: now,
    lastUpdated: now
  };
  
  // Update vehicle status if it's available
  const vehicle = getVehicleById(rental.vehicleId);
  if (vehicle && vehicle.status === 'available') {
    updateVehicle({
      ...vehicle,
      status: 'rented'
    });
  }
  
  saveItems(KEYS.RENTALS, [...rentals, newRental]);
  toast({
    title: 'Rental Created',
    description: `Rental for ${rental.customerName} has been created.`
  });
  return newRental;
};

export const updateRental = (updatedRental: Rental): Rental => {
  const rentals = getRentals();
  const index = rentals.findIndex(r => r.id === updatedRental.id);
  
  if (index !== -1) {
    const now = new Date().toISOString();
    const oldRental = rentals[index];
    const rental = {
      ...updatedRental,
      lastUpdated: now
    };
    
    // If rental status changed from active to completed, update vehicle status
    if (oldRental.status === 'active' && rental.status === 'completed') {
      const vehicle = getVehicleById(rental.vehicleId);
      if (vehicle) {
        updateVehicle({
          ...vehicle,
          status: 'available'
        });
      }
    }
    
    rentals[index] = rental;
    saveItems(KEYS.RENTALS, rentals);
    toast({
      title: 'Rental Updated',
      description: `Rental for ${rental.customerName} has been updated.`
    });
    return rental;
  }
  
  toast({
    variant: 'destructive',
    title: 'Update Failed',
    description: 'Rental not found.'
  });
  throw new Error('Rental not found');
};

export const deleteRental = (id: string): void => {
  const rentals = getRentals();
  const rental = rentals.find(r => r.id === id);
  
  if (!rental) {
    toast({
      variant: 'destructive',
      title: 'Delete Failed',
      description: 'Rental not found.'
    });
    throw new Error('Rental not found');
  }
  
  saveItems(KEYS.RENTALS, rentals.filter(r => r.id !== id));
  toast({
    title: 'Rental Deleted',
    description: `Rental for ${rental.customerName} has been deleted.`
  });
};

// Maintenance Operations
export const getAllMaintenance = (): Maintenance[] => getItems<Maintenance>(KEYS.MAINTENANCE);

export const getMaintenanceById = (id: string): Maintenance | undefined => {
  const maintenance = getAllMaintenance();
  return maintenance.find(m => m.id === id);
};

export const getMaintenanceForVehicle = (vehicleId: string): Maintenance[] => {
  const maintenance = getAllMaintenance();
  return maintenance.filter(m => m.vehicleId === vehicleId);
};

export const addMaintenance = (maintenance: Omit<Maintenance, 'id' | 'dateCreated' | 'lastUpdated'>): Maintenance => {
  const maintenanceRecords = getAllMaintenance();
  const now = new Date().toISOString();
  const newMaintenance = {
    ...maintenance,
    id: `m-${Date.now()}`,
    dateCreated: now,
    lastUpdated: now
  };
  
  // Update vehicle status if not already in maintenance
  const vehicle = getVehicleById(maintenance.vehicleId);
  if (vehicle && vehicle.status !== 'maintenance') {
    updateVehicle({
      ...vehicle,
      status: 'maintenance',
      lastMaintenance: maintenance.serviceDate
    });
  }
  
  saveItems(KEYS.MAINTENANCE, [...maintenanceRecords, newMaintenance]);
  toast({
    title: 'Maintenance Recorded',
    description: `Maintenance record has been created.`
  });
  return newMaintenance;
};

export const updateMaintenance = (updatedMaintenance: Maintenance): Maintenance => {
  const maintenanceRecords = getAllMaintenance();
  const index = maintenanceRecords.findIndex(m => m.id === updatedMaintenance.id);
  
  if (index !== -1) {
    const now = new Date().toISOString();
    const maintenance = {
      ...updatedMaintenance,
      lastUpdated: now
    };
    
    maintenanceRecords[index] = maintenance;
    saveItems(KEYS.MAINTENANCE, maintenanceRecords);
    toast({
      title: 'Maintenance Updated',
      description: `Maintenance record has been updated.`
    });
    
    // Update vehicle's last maintenance date
    const vehicle = getVehicleById(maintenance.vehicleId);
    if (vehicle) {
      updateVehicle({
        ...vehicle,
        lastMaintenance: maintenance.serviceDate
      });
    }
    
    return maintenance;
  }
  
  toast({
    variant: 'destructive',
    title: 'Update Failed',
    description: 'Maintenance record not found.'
  });
  throw new Error('Maintenance record not found');
};

export const completeMaintenance = (id: string): void => {
  const maintenanceRecords = getAllMaintenance();
  const maintenance = maintenanceRecords.find(m => m.id === id);
  
  if (!maintenance) {
    toast({
      variant: 'destructive',
      title: 'Action Failed',
      description: 'Maintenance record not found.'
    });
    throw new Error('Maintenance record not found');
  }
  
  // Update vehicle status back to available
  const vehicle = getVehicleById(maintenance.vehicleId);
  if (vehicle && vehicle.status === 'maintenance') {
    updateVehicle({
      ...vehicle,
      status: 'available',
      lastMaintenance: new Date().toISOString()
    });
  }
  
  toast({
    title: 'Maintenance Completed',
    description: `Vehicle is now available.`
  });
};

export const deleteMaintenance = (id: string): void => {
  const maintenanceRecords = getAllMaintenance();
  const maintenance = maintenanceRecords.find(m => m.id === id);
  
  if (!maintenance) {
    toast({
      variant: 'destructive',
      title: 'Delete Failed',
      description: 'Maintenance record not found.'
    });
    throw new Error('Maintenance record not found');
  }
  
  saveItems(KEYS.MAINTENANCE, maintenanceRecords.filter(m => m.id !== id));
  toast({
    title: 'Maintenance Record Deleted',
    description: `Maintenance record has been deleted.`
  });
};

// Expenditure Operations
export const getExpenditures = (): Expenditure[] => getItems<Expenditure>(KEYS.EXPENDITURES);

export const getExpenditureById = (id: string): Expenditure | undefined => {
  const expenditures = getExpenditures();
  return expenditures.find(expenditure => expenditure.id === id);
};

export const getExpendituresForVehicle = (vehicleId: string): Expenditure[] => {
  const expenditures = getExpenditures();
  return expenditures.filter(e => e.vehicleId === vehicleId);
};

export const addExpenditure = (expenditure: Omit<Expenditure, 'id' | 'dateCreated' | 'lastUpdated'>): Expenditure => {
  const expenditures = getExpenditures();
  const now = new Date().toISOString();
  const newExpenditure = {
    ...expenditure,
    id: `e-${Date.now()}`,
    dateCreated: now,
    lastUpdated: now
  };
  
  saveItems(KEYS.EXPENDITURES, [...expenditures, newExpenditure]);
  toast({
    title: 'Expenditure Added',
    description: `₵${expenditure.amount.toFixed(2)} expenditure has been recorded.`
  });
  return newExpenditure;
};

export const updateExpenditure = (updatedExpenditure: Expenditure): Expenditure => {
  const expenditures = getExpenditures();
  const index = expenditures.findIndex(e => e.id === updatedExpenditure.id);
  
  if (index !== -1) {
    const now = new Date().toISOString();
    const expenditure = {
      ...updatedExpenditure,
      lastUpdated: now
    };
    
    expenditures[index] = expenditure;
    saveItems(KEYS.EXPENDITURES, expenditures);
    toast({
      title: 'Expenditure Updated',
      description: `₵${expenditure.amount.toFixed(2)} expenditure has been updated.`
    });
    return expenditure;
  }
  
  toast({
    variant: 'destructive',
    title: 'Update Failed',
    description: 'Expenditure not found.'
  });
  throw new Error('Expenditure not found');
};

export const deleteExpenditure = (id: string): void => {
  const expenditures = getExpenditures();
  const expenditure = expenditures.find(e => e.id === id);
  
  if (!expenditure) {
    toast({
      variant: 'destructive',
      title: 'Delete Failed',
      description: 'Expenditure not found.'
    });
    throw new Error('Expenditure not found');
  }
  
  saveItems(KEYS.EXPENDITURES, expenditures.filter(e => e.id !== id));
  toast({
    title: 'Expenditure Deleted',
    description: `₵${expenditure.amount.toFixed(2)} expenditure has been deleted.`
  });
};

// Dashboard Statistics
export const getDashboardStats = (): DashboardStats => {
  const vehicles = getVehicles();
  const rentals = getRentals();
  const maintenanceRecords = getAllMaintenance();
  const expenditures = getExpenditures();
  
  // Get current month's data for revenue and expenses
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  
  // Calculate monthly revenue from completed rentals
  const monthlyRevenue = rentals
    .filter(r => 
      r.status === 'completed' && 
      r.actualEndDate && 
      r.actualEndDate >= startOfMonth && 
      r.actualEndDate <= endOfMonth
    )
    .reduce((sum, rental) => sum + (rental.totalAmount || 0), 0);
  
  // Calculate monthly expenses
  const monthlyExpenses = expenditures
    .filter(e => e.date >= startOfMonth && e.date <= endOfMonth)
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  return {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    rentedVehicles: vehicles.filter(v => v.status === 'rented').length,
    maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
    unavailableVehicles: vehicles.filter(v => v.status === 'unavailable').length,
    activeRentals: rentals.filter(r => r.status === 'active').length,
    overdueRentals: rentals.filter(r => r.status === 'overdue').length,
    monthlyRevenue,
    monthlyExpenses,
    upcomingMaintenance: maintenanceRecords.filter(m => {
      if (!m.nextServiceDate) return false;
      const nextService = new Date(m.nextServiceDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return nextService <= weekFromNow;
    }).length
  };
};

// Initialize with sample data if storage is empty
export const initializeData = () => {
  if (getVehicles().length === 0) {
    const now = new Date().toISOString();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthDate = lastMonth.toISOString();
    
    // Sample vehicles
    const vehicles: Vehicle[] = [
      {
        id: 'v-1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'GR 1234-20',
        status: 'available',
        fuelType: 'Petrol',
        odometer: 45000,
        lastMaintenance: lastMonthDate,
        notes: 'Regular servicing up to date',
        dateAdded: lastMonthDate,
        lastUpdated: now
      },
      {
        id: 'v-2',
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        licensePlate: 'GR 5678-19',
        status: 'rented',
        fuelType: 'Petrol',
        odometer: 62000,
        lastMaintenance: lastMonthDate,
        notes: 'Minor scratch on rear bumper',
        dateAdded: lastMonthDate,
        lastUpdated: now
      },
      {
        id: 'v-3',
        make: 'Ford',
        model: 'Ranger',
        year: 2021,
        licensePlate: 'GE 9012-21',
        status: 'maintenance',
        fuelType: 'Diesel',
        odometer: 38000,
        lastMaintenance: now,
        notes: 'In for brake replacement',
        dateAdded: lastMonthDate,
        lastUpdated: now
      }
    ];
    
    // Sample rentals
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString();
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekDate = nextWeek.toISOString();
    
    const rentals: Rental[] = [
      {
        id: 'r-1',
        vehicleId: 'v-2',
        customerName: 'John Mensah',
        customerPhone: '+233 50 123 4567',
        customerEmail: 'john.mensah@example.com',
        startDate: yesterdayDate,
        expectedEndDate: nextWeekDate,
        rentalRate: 150,
        deposit: 300,
        status: 'active',
        notes: 'Regular customer',
        dateCreated: yesterdayDate,
        lastUpdated: yesterdayDate
      }
    ];
    
    // Sample maintenance records
    const maintenance: Maintenance[] = [
      {
        id: 'm-1',
        vehicleId: 'v-3',
        type: 'repair',
        description: 'Brake pad and rotor replacement',
        cost: 800,
        serviceDate: now,
        nextServiceDate: nextWeekDate,
        serviceProvider: 'AutoFix Garage',
        notes: 'All four wheels',
        dateCreated: now,
        lastUpdated: now
      }
    ];
    
    // Sample expenditures
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const twoMonthsAgoDate = twoMonthsAgo.toISOString();
    
    const expenditures: Expenditure[] = [
      {
        id: 'e-1',
        vehicleId: 'v-1',
        category: 'fuel',
        amount: 200,
        date: yesterdayDate,
        description: 'Full tank refuel',
        paymentMethod: 'mobile_money',
        dateCreated: yesterdayDate,
        lastUpdated: yesterdayDate
      },
      {
        id: 'e-2',
        vehicleId: 'v-3',
        category: 'maintenance',
        amount: 800,
        date: now,
        description: 'Brake replacement',
        paymentMethod: 'card',
        dateCreated: now,
        lastUpdated: now
      },
      {
        id: 'e-3',
        category: 'insurance',
        amount: 2400,
        date: twoMonthsAgoDate,
        description: 'Annual insurance premium for fleet',
        paymentMethod: 'bank_transfer',
        dateCreated: twoMonthsAgoDate,
        lastUpdated: twoMonthsAgoDate
      }
    ];
    
    saveItems(KEYS.VEHICLES, vehicles);
    saveItems(KEYS.RENTALS, rentals);
    saveItems(KEYS.MAINTENANCE, maintenance);
    saveItems(KEYS.EXPENDITURES, expenditures);
  }
};

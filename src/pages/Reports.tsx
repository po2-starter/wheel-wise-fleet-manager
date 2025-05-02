
import React, { useState } from "react";
import Layout from "../components/Layout";
import { getRentals, getVehicles } from "@/utils/localStorage";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, Printer } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";
import { Rental, Vehicle } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [vehicleFilter, setVehicleFilter] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Get rentals and vehicles
  const allRentals = getRentals();
  const vehicles = getVehicles();

  // Filter rentals by selected month
  const filteredRentals = allRentals.filter(rental => {
    const startDate = parseISO(rental.startDate);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    // Check if the rental falls within the selected month
    const inSelectedMonth = isWithinInterval(startDate, {
      start: monthStart,
      end: monthEnd,
    });
    
    // Apply additional filters
    const matchesVehicle = vehicleFilter 
      ? rental.vehicleId === vehicleFilter 
      : true;
      
    const matchesCustomer = customerFilter 
      ? rental.customerName.toLowerCase().includes(customerFilter.toLowerCase())
      : true;
      
    const matchesStatus = statusFilter 
      ? rental.status === statusFilter 
      : true;
    
    return inSelectedMonth && matchesVehicle && matchesCustomer && matchesStatus;
  });

  // Calculate summary statistics
  const totalRevenue = filteredRentals.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0);
  const completedRentals = filteredRentals.filter(r => r.status === "completed").length;
  const activeRentals = filteredRentals.filter(r => r.status === "active").length;
  const overdueRentals = filteredRentals.filter(r => r.status === "overdue").length;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: "pdf" | "csv" | "word") => {
    // Reusing PDF export mechanism for now
    if (format === "pdf") {
      window.print();
    } else {
      // In the future, this would connect to a proper export function
      alert(`Export to ${format} would be implemented with Supabase backend`);
    }
  };

  const getVehicleName = (vehicleId: string): string => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : "Unknown Vehicle";
  };

  return (
    <Layout>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #report-content,
          #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rental Reports</h1>
            <p className="text-muted-foreground">
              View and analyze rental data by month, vehicle, and customer.
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0 no-print">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print Report
            </Button>
            <ExportButton onExport={handleExport} label="Export Report" />
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-4 border rounded-md bg-white no-print">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Month Selector */}
              <div className="space-y-2">
                <Label htmlFor="month">Select Month</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="month"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedMonth, "MMMM yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedMonth}
                      onSelect={(date) => date && setSelectedMonth(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Vehicle Filter */}
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select
                  value={vehicleFilter}
                  onValueChange={setVehicleFilter}
                >
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="All vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-vehicles">All vehicles</SelectItem>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Filter */}
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Input
                  id="customer"
                  placeholder="Filter by customer name"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-statuses">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Rentals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredRentals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Rentals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeRentals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue Rentals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{overdueRentals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₵{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Rentals Table */}
        <div id="report-content" className="bg-white border rounded-md overflow-hidden">
          <div className="p-4 text-center print-only hidden">
            <h1 className="text-xl font-bold">SIRREV TRANSPORT SERVICES</h1>
            <h2 className="text-lg">Rental Report - {format(selectedMonth, "MMMM yyyy")}</h2>
          </div>
          
          {filteredRentals.length === 0 ? (
            <div className="text-center py-10">
              <Filter className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No rentals found</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your filters or selecting a different month.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue (₵)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRentals.map((rental) => {
                    const startDate = parseISO(rental.startDate);
                    const endDate = rental.actualEndDate 
                      ? parseISO(rental.actualEndDate) 
                      : parseISO(rental.expectedEndDate);
                    
                    return (
                      <TableRow key={rental.id}>
                        <TableCell className="font-medium">
                          {rental.customerName}
                          <div className="text-sm text-muted-foreground">
                            {rental.customerPhone}
                          </div>
                        </TableCell>
                        <TableCell>{getVehicleName(rental.vehicleId)}</TableCell>
                        <TableCell>{format(startDate, "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {format(endDate, "MMM d, yyyy")}
                          {rental.actualEndDate ? "" : " (Expected)"}
                        </TableCell>
                        <TableCell>
                          {/* Calculate days difference + 1 to include both start and end days */}
                          {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                        </TableCell>
                        <TableCell>
                          <div className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${rental.status === "active" ? "bg-blue-100 text-blue-800" : ""}
                            ${rental.status === "completed" ? "bg-green-100 text-green-800" : ""}
                            ${rental.status === "overdue" ? "bg-amber-100 text-amber-800" : ""}
                            ${rental.status === "cancelled" ? "bg-gray-100 text-gray-800" : ""}
                          `}>
                            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₵{(rental.totalAmount || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Summary section at the bottom of the report */}
          {filteredRentals.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between">
                <div>
                  <p><strong>Total Rentals:</strong> {filteredRentals.length}</p>
                  <p>
                    <strong>Status Breakdown:</strong> {completedRentals} Completed, {activeRentals} Active, {overdueRentals} Overdue
                  </p>
                </div>
                <div className="text-right">
                  <p><strong>Total Revenue:</strong> ₵{totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;

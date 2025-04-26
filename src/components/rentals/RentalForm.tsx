
import React, { useState, useEffect } from "react";
import { addRental, updateRental, getVehicles } from "@/utils/localStorage";
import { Rental, Vehicle } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format, addDays, differenceInDays } from "date-fns";

interface RentalFormProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
}

const RentalForm: React.FC<RentalFormProps> = ({ rental, isOpen, onClose }) => {
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  
  const [form, setForm] = useState({
    vehicleId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    expectedEndDate: format(addDays(new Date(), 3), "yyyy-MM-dd"),
    actualEndDate: "",
    rentalRate: 150,
    totalAmount: 0,
    deposit: 300,
    status: "active" as "active" | "completed" | "overdue" | "cancelled",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load available vehicles
    const vehicles = getVehicles().filter(v => 
      v.status === "available" || (rental && v.id === rental.vehicleId)
    );
    setAvailableVehicles(vehicles);
    
    if (rental) {
      // Format dates for input fields
      const startDate = format(new Date(rental.startDate), "yyyy-MM-dd");
      const expectedEndDate = format(new Date(rental.expectedEndDate), "yyyy-MM-dd");
      const actualEndDate = rental.actualEndDate 
        ? format(new Date(rental.actualEndDate), "yyyy-MM-dd")
        : rental.status === "completed"
          ? format(new Date(), "yyyy-MM-dd")
          : "";
      
      // Calculate total if it's being marked as completed
      let totalAmount = rental.totalAmount;
      if (rental.status !== "completed" && form.status === "completed" && !rental.actualEndDate) {
        const days = differenceInDays(
          new Date(actualEndDate || new Date()),
          new Date(startDate)
        ) + 1;
        totalAmount = days * rental.rentalRate;
      }
      
      setForm({
        vehicleId: rental.vehicleId,
        customerName: rental.customerName,
        customerPhone: rental.customerPhone,
        customerEmail: rental.customerEmail || "",
        startDate,
        expectedEndDate,
        actualEndDate,
        rentalRate: rental.rentalRate,
        totalAmount: totalAmount || 0,
        deposit: rental.deposit,
        status: rental.status,
        notes: rental.notes || "",
      });
    } else {
      // Reset form for new rental
      setForm({
        vehicleId: vehicles.length > 0 ? vehicles[0].id : "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        expectedEndDate: format(addDays(new Date(), 3), "yyyy-MM-dd"),
        actualEndDate: "",
        rentalRate: 150,
        totalAmount: 0,
        deposit: 300,
        status: "active",
        notes: "",
      });
    }
  }, [rental]);

  // Update total amount when dates or rate changes
  useEffect(() => {
    if (form.startDate && form.expectedEndDate) {
      const days = differenceInDays(
        new Date(form.expectedEndDate),
        new Date(form.startDate)
      ) + 1;
      
      if (days > 0) {
        const total = days * form.rentalRate;
        setForm(prev => ({
          ...prev,
          totalAmount: total
        }));
      }
    }
  }, [form.startDate, form.expectedEndDate, form.rentalRate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: Number(value) });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "status" && value === "completed" && !form.actualEndDate) {
      // If marking as completed and no actual end date is set, use today
      const today = format(new Date(), "yyyy-MM-dd");
      setForm({ 
        ...form, 
        [name]: value,
        actualEndDate: today 
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!form.vehicleId || !form.customerName || !form.customerPhone || !form.startDate || !form.expectedEndDate) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields.",
        });
        setIsSubmitting(false);
        return;
      }

      // Calculate final total amount for completed rentals
      let finalTotalAmount = form.totalAmount;
      if (form.status === "completed" && form.actualEndDate) {
        const days = differenceInDays(
          new Date(form.actualEndDate),
          new Date(form.startDate)
        ) + 1;
        finalTotalAmount = days * form.rentalRate;
      }

      if (rental) {
        // Update existing rental
        updateRental({
          ...rental,
          ...form,
          totalAmount: finalTotalAmount,
        });
      } else {
        // Add new rental
        addRental({
          ...form,
          totalAmount: finalTotalAmount,
        });
      }

      onClose(true); // Close with refresh
    } catch (error) {
      console.error("Error saving rental:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save rental. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rental ? "Edit Rental" : "Add New Rental"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehicle *</Label>
            <Select
              value={form.vehicleId}
              onValueChange={(value) => handleSelectChange("vehicleId", value)}
              disabled={rental !== null} // Can't change vehicle on edit
            >
              <SelectTrigger id="vehicleId">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.length > 0 ? (
                  availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No available vehicles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                value={form.customerPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedEndDate">Expected Return Date *</Label>
              <Input
                id="expectedEndDate"
                name="expectedEndDate"
                type="date"
                value={form.expectedEndDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {(form.status === "completed" || rental?.status === "completed") && (
            <div className="space-y-2">
              <Label htmlFor="actualEndDate">Actual Return Date *</Label>
              <Input
                id="actualEndDate"
                name="actualEndDate"
                type="date"
                value={form.actualEndDate}
                onChange={handleChange}
                required={form.status === "completed"}
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentalRate">Daily Rate (₵) *</Label>
              <Input
                id="rentalRate"
                name="rentalRate"
                type="number"
                min="0"
                step="0.01"
                value={form.rentalRate}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit (₵)</Label>
              <Input
                id="deposit"
                name="deposit"
                type="number"
                min="0"
                step="0.01"
                value={form.deposit}
                onChange={handleNumberChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={form.status}
                onValueChange={(value) => handleSelectChange("status", value as any)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount (₵)</Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              min="0"
              step="0.01"
              value={form.totalAmount}
              onChange={handleNumberChange}
              disabled={form.status !== "completed"}
              className={form.status !== "completed" ? "bg-gray-100" : ""}
            />
            <p className="text-xs text-muted-foreground">
              {form.status !== "completed" 
                ? "Total will be calculated upon completion" 
                : "You can adjust the final amount"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Enter any additional information"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : rental ? "Update" : "Add Rental"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RentalForm;

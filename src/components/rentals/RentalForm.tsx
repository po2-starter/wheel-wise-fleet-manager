
import React from "react";
import { Rental, Vehicle } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRentalForm } from "@/hooks/useRentalForm";
import RentalCustomerFields from "./RentalCustomerFields";
import RentalDateFields from "./RentalDateFields";
import RentalPaymentFields from "./RentalPaymentFields";

interface RentalFormProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
}

const RentalForm: React.FC<RentalFormProps> = ({ rental, isOpen, onClose }) => {
  const {
    form,
    isSubmitting,
    validationErrors,
    availableVehicles,
    handleSubmit,
    handleChange,
    handleNumberChange,
    handleSelectChange,
  } = useRentalForm({ rental, onClose });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rental ? "Edit Rental" : "Add New Rental"}
          </DialogTitle>
          <DialogDescription>
            {rental ? "Update rental details below" : "Enter rental information"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehicle {!rental && '*'}</Label>
            <Select
              value={form.vehicleId}
              onValueChange={(value) => handleSelectChange("vehicleId", value)}
              disabled={rental !== null}
            >
              <SelectTrigger id="vehicleId" className={validationErrors.vehicleId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.length > 0 ? (
                  availableVehicles.map((vehicle: Vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-vehicles-available" disabled>
                    No available vehicles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {validationErrors.vehicleId && (
              <p className="text-xs text-red-500">{validationErrors.vehicleId}</p>
            )}
          </div>

          <RentalCustomerFields
            customerName={form.customerName}
            customerPhone={form.customerPhone}
            customerEmail={form.customerEmail}
            onChange={handleChange}
            validationErrors={validationErrors}
          />

          <RentalDateFields
            startDate={form.startDate}
            expectedEndDate={form.expectedEndDate}
            actualEndDate={form.actualEndDate}
            showActualEndDate={form.status === "completed"}
            onChange={handleChange}
            validationErrors={validationErrors}
          />

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={form.status}
              onValueChange={(value) => handleSelectChange("status", value)}
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

          <RentalPaymentFields
            rentalRate={form.rentalRate}
            deposit={form.deposit}
            totalAmount={form.totalAmount}
            status={form.status}
            onChange={handleNumberChange}
          />

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

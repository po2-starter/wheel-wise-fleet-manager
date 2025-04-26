
import React, { useState, useEffect } from "react";
import { addMaintenance, updateMaintenance, getVehicles } from "@/utils/localStorage";
import { Maintenance, Vehicle } from "@/types";
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
import { format, addMonths } from "date-fns";

interface MaintenanceFormProps {
  maintenance: Maintenance | null;
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ maintenance, isOpen, onClose }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [form, setForm] = useState({
    vehicleId: "",
    type: "routine" as "routine" | "repair" | "inspection",
    description: "",
    cost: 0,
    serviceDate: format(new Date(), "yyyy-MM-dd"),
    nextServiceDate: format(addMonths(new Date(), 3), "yyyy-MM-dd"),
    serviceProvider: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load all vehicles
    const allVehicles = getVehicles();
    setVehicles(allVehicles);
    
    if (maintenance) {
      // Format dates for input fields
      const serviceDate = format(new Date(maintenance.serviceDate), "yyyy-MM-dd");
      const nextServiceDate = maintenance.nextServiceDate 
        ? format(new Date(maintenance.nextServiceDate), "yyyy-MM-dd")
        : "";
      
      setForm({
        vehicleId: maintenance.vehicleId,
        type: maintenance.type,
        description: maintenance.description,
        cost: maintenance.cost,
        serviceDate,
        nextServiceDate,
        serviceProvider: maintenance.serviceProvider,
        notes: maintenance.notes || "",
      });
    } else {
      // Reset form for new maintenance record
      setForm({
        vehicleId: allVehicles.length > 0 ? allVehicles[0].id : "",
        type: "routine",
        description: "",
        cost: 0,
        serviceDate: format(new Date(), "yyyy-MM-dd"),
        nextServiceDate: format(addMonths(new Date(), 3), "yyyy-MM-dd"),
        serviceProvider: "",
        notes: "",
      });
    }
  }, [maintenance]);

  // Suggest next service date based on type
  useEffect(() => {
    if (!maintenance && form.serviceDate) {
      let months = 3; // default for routine
      
      if (form.type === "repair") {
        months = 6;
      } else if (form.type === "inspection") {
        months = 12;
      }
      
      const nextDate = format(
        addMonths(new Date(form.serviceDate), months),
        "yyyy-MM-dd"
      );
      
      setForm(prev => ({
        ...prev,
        nextServiceDate: nextDate
      }));
    }
  }, [form.type, form.serviceDate, maintenance]);

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
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!form.vehicleId || !form.description || !form.serviceDate || !form.serviceProvider) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields.",
        });
        setIsSubmitting(false);
        return;
      }

      if (maintenance) {
        // Update existing maintenance record
        updateMaintenance({
          ...maintenance,
          ...form,
        });
      } else {
        // Add new maintenance record
        addMaintenance(form);
      }

      onClose(true); // Close with refresh
    } catch (error) {
      console.error("Error saving maintenance record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save maintenance record. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {maintenance ? "Edit Maintenance Record" : "Add New Maintenance"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehicle *</Label>
            <Select
              value={form.vehicleId}
              onValueChange={(value) => handleSelectChange("vehicleId", value)}
            >
              <SelectTrigger id="vehicleId">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No vehicles available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={form.type}
                onValueChange={(value) => handleSelectChange("type", value as any)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (₵) *</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={handleNumberChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the maintenance"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceDate">Service Date *</Label>
              <Input
                id="serviceDate"
                name="serviceDate"
                type="date"
                value={form.serviceDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextServiceDate">Next Service Date</Label>
              <Input
                id="nextServiceDate"
                name="nextServiceDate"
                type="date"
                value={form.nextServiceDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceProvider">Service Provider *</Label>
            <Input
              id="serviceProvider"
              name="serviceProvider"
              value={form.serviceProvider}
              onChange={handleChange}
              placeholder="Name of garage or service provider"
              required
            />
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
              {isSubmitting ? "Saving..." : maintenance ? "Update" : "Add Maintenance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceForm;

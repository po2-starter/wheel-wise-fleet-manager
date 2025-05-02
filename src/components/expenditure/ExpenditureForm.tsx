import React, { useState, useEffect } from "react";
import { addExpenditure, updateExpenditure, getVehicles } from "@/utils/localStorage";
import { Expenditure, Vehicle } from "@/types";
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
import { format } from "date-fns";

interface ExpenditureFormProps {
  expenditure: Expenditure | null;
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
}

const ExpenditureForm: React.FC<ExpenditureFormProps> = ({ expenditure, isOpen, onClose }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [form, setForm] = useState({
    vehicleId: "",
    category: "fuel" as "fuel" | "maintenance" | "insurance" | "tax" | "other",
    amount: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    paymentMethod: "cash" as "cash" | "card" | "mobile_money" | "bank_transfer",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load all vehicles
    const allVehicles = getVehicles();
    setVehicles(allVehicles);
    
    if (expenditure) {
      // Format dates for input fields
      const date = format(new Date(expenditure.date), "yyyy-MM-dd");
      
      setForm({
        vehicleId: expenditure.vehicleId || "",
        category: expenditure.category,
        amount: expenditure.amount,
        date,
        description: expenditure.description,
        paymentMethod: expenditure.paymentMethod,
        notes: expenditure.notes || "",
      });
    } else {
      // Reset form for new expenditure record
      setForm({
        vehicleId: "", // No default vehicle for expenditures
        category: "fuel",
        amount: 0,
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
        paymentMethod: "cash",
        notes: "",
      });
    }
  }, [expenditure]);

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
      if (!form.description || !form.date || !form.amount) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields.",
        });
        setIsSubmitting(false);
        return;
      }

      if (expenditure) {
        // Update existing expenditure record
        updateExpenditure({
          ...expenditure,
          ...form,
          vehicleId: form.vehicleId || undefined,
        });
      } else {
        // Add new expenditure record
        addExpenditure({
          ...form,
          vehicleId: form.vehicleId || undefined,
        });
      }

      onClose(true); // Close with refresh
    } catch (error) {
      console.error("Error saving expenditure record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save expenditure record. Please try again.",
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
            {expenditure ? "Edit Expenditure Record" : "Add New Expenditure"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehicle (Optional)</Label>
            <Select
              value={form.vehicleId}
              onValueChange={(value) => handleSelectChange("vehicleId", value)}
            >
              <SelectTrigger id="vehicleId">
                <SelectValue placeholder="Select a vehicle (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General Expense (No vehicle)</SelectItem>
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-vehicles" disabled>
                    No vehicles available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.category}
                onValueChange={(value) => handleSelectChange("category", value as any)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(value) => handleSelectChange("paymentMethod", value as any)}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₵) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
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
              placeholder="Brief description of the expenditure"
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
              {isSubmitting ? "Saving..." : expenditure ? "Update" : "Add Expenditure"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenditureForm;

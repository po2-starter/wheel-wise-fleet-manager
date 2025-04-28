
import { useState, useEffect } from "react";
import { addRental, updateRental, getVehicles } from "@/utils/localStorage";
import { Rental, Vehicle } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { format, addDays, differenceInDays } from "date-fns";

interface UseRentalFormProps {
  rental: Rental | null;
  onClose: (refresh: boolean) => void;
}

export const useRentalForm = ({ rental, onClose }: UseRentalFormProps) => {
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
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

  useEffect(() => {
    const vehicles = getVehicles().filter(v => 
      v.status === "available" || (rental && v.id === rental.vehicleId)
    );
    setAvailableVehicles(vehicles);
    
    if (rental) {
      const startDate = format(new Date(rental.startDate), "yyyy-MM-dd");
      const expectedEndDate = format(new Date(rental.expectedEndDate), "yyyy-MM-dd");
      const actualEndDate = rental.actualEndDate 
        ? format(new Date(rental.actualEndDate), "yyyy-MM-dd")
        : rental.status === "completed"
          ? format(new Date(), "yyyy-MM-dd")
          : "";
      
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
      setForm(prev => ({
        ...prev,
        vehicleId: vehicles.length > 0 ? vehicles[0].id : "",
      }));
    }
  }, [rental]);

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

  useEffect(() => {
    if (form.status === "completed" && !form.actualEndDate) {
      setForm(prev => ({
        ...prev,
        actualEndDate: format(new Date(), "yyyy-MM-dd")
      }));
    }
  }, [form.status]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!rental && !form.vehicleId) errors.vehicleId = "Vehicle is required";
    if (!form.customerName) errors.customerName = "Customer name is required";
    if (!form.customerPhone) errors.customerPhone = "Phone number is required";
    if (!form.startDate) errors.startDate = "Start date is required";
    if (!form.expectedEndDate) errors.expectedEndDate = "Expected return date is required";
    
    if (form.status === "completed" && !form.actualEndDate) {
      errors.actualEndDate = "Actual return date is required for completed rentals";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      let finalTotalAmount = form.totalAmount;
      if (form.status === "completed" && form.actualEndDate) {
        const days = differenceInDays(
          new Date(form.actualEndDate),
          new Date(form.startDate)
        ) + 1;
        finalTotalAmount = days * form.rentalRate;
      }

      if (rental) {
        updateRental({
          ...rental,
          ...form,
          totalAmount: finalTotalAmount,
        });
        
        toast({
          title: "Rental Updated",
          description: `Rental for ${form.customerName} has been updated.`
        });
      } else {
        addRental({
          ...form,
          totalAmount: finalTotalAmount,
        });
        
        toast({
          title: "Rental Added",
          description: `New rental for ${form.customerName} has been created.`
        });
      }

      onClose(true);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: Number(value) });
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return {
    form,
    isSubmitting,
    validationErrors,
    availableVehicles,
    handleSubmit,
    handleChange,
    handleNumberChange,
    handleSelectChange,
  };
};

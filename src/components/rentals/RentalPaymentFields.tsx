
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RentalPaymentFieldsProps {
  rentalRate: number;
  deposit: number;
  totalAmount: number;
  status: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RentalPaymentFields: React.FC<RentalPaymentFieldsProps> = ({
  rentalRate,
  deposit,
  totalAmount,
  status,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="rentalRate">Daily Rate (₵) *</Label>
        <Input
          id="rentalRate"
          name="rentalRate"
          type="number"
          min="0"
          step="0.01"
          value={rentalRate}
          onChange={onChange}
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
          value={deposit}
          onChange={onChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="totalAmount">Total Amount (₵)</Label>
        <Input
          id="totalAmount"
          name="totalAmount"
          type="number"
          min="0"
          step="0.01"
          value={totalAmount}
          onChange={onChange}
          className={status !== "completed" ? "bg-gray-100" : ""}
        />
        <p className="text-xs text-muted-foreground">
          {status !== "completed" 
            ? "Total will be calculated upon completion" 
            : "You can adjust the final amount"}
        </p>
      </div>
    </div>
  );
};

export default RentalPaymentFields;

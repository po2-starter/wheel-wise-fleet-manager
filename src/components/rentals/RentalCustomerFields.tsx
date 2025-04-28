
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RentalCustomerFieldsProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validationErrors: Record<string, string>;
}

const RentalCustomerFields: React.FC<RentalCustomerFieldsProps> = ({
  customerName,
  customerPhone,
  customerEmail,
  onChange,
  validationErrors,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name *</Label>
        <Input
          id="customerName"
          name="customerName"
          value={customerName}
          onChange={onChange}
          className={validationErrors.customerName ? "border-red-500" : ""}
        />
        {validationErrors.customerName && (
          <p className="text-xs text-red-500">{validationErrors.customerName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerPhone">Phone Number *</Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          value={customerPhone}
          onChange={onChange}
          className={validationErrors.customerPhone ? "border-red-500" : ""}
        />
        {validationErrors.customerPhone && (
          <p className="text-xs text-red-500">{validationErrors.customerPhone}</p>
        )}
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          id="customerEmail"
          name="customerEmail"
          type="email"
          value={customerEmail}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default RentalCustomerFields;

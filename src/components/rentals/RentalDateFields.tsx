
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RentalDateFieldsProps {
  startDate: string;
  expectedEndDate: string;
  actualEndDate: string;
  showActualEndDate: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validationErrors: Record<string, string>;
}

const RentalDateFields: React.FC<RentalDateFieldsProps> = ({
  startDate,
  expectedEndDate,
  actualEndDate,
  showActualEndDate,
  onChange,
  validationErrors,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date *</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={startDate}
          onChange={onChange}
          className={validationErrors.startDate ? "border-red-500" : ""}
        />
        {validationErrors.startDate && (
          <p className="text-xs text-red-500">{validationErrors.startDate}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="expectedEndDate">Expected Return Date *</Label>
        <Input
          id="expectedEndDate"
          name="expectedEndDate"
          type="date"
          value={expectedEndDate}
          onChange={onChange}
          className={validationErrors.expectedEndDate ? "border-red-500" : ""}
        />
        {validationErrors.expectedEndDate && (
          <p className="text-xs text-red-500">{validationErrors.expectedEndDate}</p>
        )}
      </div>
      {showActualEndDate && (
        <div className="space-y-2 col-span-2">
          <Label htmlFor="actualEndDate">Actual Return Date *</Label>
          <Input
            id="actualEndDate"
            name="actualEndDate"
            type="date"
            value={actualEndDate}
            onChange={onChange}
            className={validationErrors.actualEndDate ? "border-red-500" : ""}
          />
          {validationErrors.actualEndDate && (
            <p className="text-xs text-red-500">{validationErrors.actualEndDate}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RentalDateFields;

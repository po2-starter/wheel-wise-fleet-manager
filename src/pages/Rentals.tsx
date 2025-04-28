
import React, { useState } from "react";
import Layout from "../components/Layout";
import RentalList from "../components/rentals/RentalList";
import RentalAgreement from "../components/rentals/RentalAgreement";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getRentals } from "@/utils/localStorage";
import { Rental } from "@/types";

const RentalsPage: React.FC = () => {
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const rentals = getRentals();
  const activeRentals = rentals.filter(r => r.status === "active").length;
  const overdueRentals = rentals.filter(r => r.status === "overdue").length;

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rental Management</h1>
            <p className="text-muted-foreground">
              Manage vehicle rentals, customer information, and track rental status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 md:mt-0">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md flex items-center">
              <span className="font-medium">{activeRentals}</span>
              <span className="ml-1 text-sm">Active</span>
            </div>
            <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-md flex items-center">
              <span className="font-medium">{overdueRentals}</span>
              <span className="ml-1 text-sm">Overdue</span>
            </div>
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-md flex items-center">
              <span className="font-medium">{rentals.length}</span>
              <span className="ml-1 text-sm">Total</span>
            </div>
          </div>
        </div>
        <RentalList onViewAgreement={setSelectedRental} />

        <Dialog 
          open={!!selectedRental} 
          onOpenChange={(open) => {
            if (!open) setSelectedRental(null);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedRental && <RentalAgreement rental={selectedRental} />}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default RentalsPage;

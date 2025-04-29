
import React from "react";
import { Rental } from "@/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getVehicleById } from "@/utils/localStorage";
import { DialogTitle } from "@/components/ui/dialog";

interface RentalAgreementProps {
  rental: Rental;
}

const RentalAgreement: React.FC<RentalAgreementProps> = ({ rental }) => {
  const vehicle = getVehicleById(rental.vehicleId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body * {
            visibility: hidden;
          }
          
          #rental-agreement, 
          #rental-agreement * {
            visibility: visible;
          }
          
          #rental-agreement {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            margin: 0;
            background-color: white !important;
            color: black !important;
            font-size: 12pt;
          }

          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <DialogTitle className="text-xl font-bold mb-4 no-print">Rental Agreement</DialogTitle>
      
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={handlePrint}>
          Print Agreement
        </Button>
      </div>

      <div id="rental-agreement" className="p-6 bg-white border rounded-lg">
        <div className="text-center mb-6 page-break-inside-avoid">
          <h1 className="text-2xl font-bold">SIRREV TRANSPORT SERVICES</h1>
          <h2 className="text-xl font-semibold mt-2">Vehicle Rental Agreement</h2>
        </div>

        <div className="space-y-6">
          <section className="page-break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Agreement Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Agreement Date</p>
                <p className="font-medium">{format(new Date(rental.dateCreated), "PPP")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Agreement ID</p>
                <p className="font-medium">{rental.id}</p>
              </div>
            </div>
          </section>

          <section className="page-break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="font-medium">{vehicle?.make} {vehicle?.model} ({vehicle?.year})</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">License Plate</p>
                <p className="font-medium">{vehicle?.licensePlate}</p>
              </div>
            </div>
          </section>

          <section className="page-break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Rental Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{format(new Date(rental.startDate), "PPP")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Return Date</p>
                <p className="font-medium">{format(new Date(rental.expectedEndDate), "PPP")}</p>
              </div>
            </div>
          </section>

          <section className="page-break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{rental.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{rental.customerPhone}</p>
              </div>
              {rental.customerEmail && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{rental.customerEmail}</p>
                </div>
              )}
            </div>
          </section>

          <section className="page-break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Daily Rate</p>
                <p className="font-medium">₵{rental.rentalRate.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deposit</p>
                <p className="font-medium">₵{rental.deposit.toFixed(2)}</p>
              </div>
            </div>
          </section>

          <section className="mt-6 page-break-inside-avoid">
            <h3 className="text-lg font-semibold mb-3">Signatures</h3>
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <div className="border-t border-black pt-2">
                  <p className="text-sm text-gray-600">Customer Signature</p>
                  <p className="text-sm text-gray-600">{rental.customerName}</p>
                </div>
              </div>
              <div>
                <div className="border-t border-black pt-2">
                  <p className="text-sm text-gray-600">SIRREV TRANSPORT SERVICES Representative</p>
                  <p className="text-sm text-gray-600">Authorized Signature</p>
                </div>
              </div>
            </div>
          </section>

          {rental.notes && (
            <section className="mt-6 page-break-inside-avoid">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-sm">{rental.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalAgreement;


import React, { useRef, useState } from "react";
import { Rental } from "@/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getVehicleById } from "@/utils/localStorage";
import { DialogTitle } from "@/components/ui/dialog";
import { ExportButton } from "@/components/ui/export-button";
import { exportRentalAgreement } from "@/utils/exportUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Signature } from "lucide-react";

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.beginPath();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    } else {
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    if ('touches' in e) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    } else {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
    
    ctx.stroke();
  };
  
  const endDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL("image/png");
    onSave(signatureData);
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border border-gray-300 rounded">
        <canvas 
          ref={canvasRef}
          width={300}
          height={150}
          className="bg-white cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={clearSignature}>Clear</Button>
        <Button onClick={saveSignature}>Apply Signature</Button>
      </div>
    </div>
  );
};

interface RentalAgreementProps {
  rental: Rental;
}

const RentalAgreement: React.FC<RentalAgreementProps> = ({ rental }) => {
  const vehicle = getVehicleById(rental.vehicleId);
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [representativeSignature, setRepresentativeSignature] = useState<string | null>(null);
  const [signatureMode, setSignatureMode] = useState<"physical" | "digital">("physical");

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: "pdf" | "csv" | "word") => {
    exportRentalAgreement(rental, format);
  };

  return (
    <div>
      {/* Print-only styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 15mm;
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
            display: block !important;
            overflow: visible !important;
          }
          
          .agreement-section {
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          
          .no-print {
            display: none !important;
          }

          .signature-img {
            display: block !important;
            max-height: 80px;
          }
        }
      `}} />

      <DialogTitle className="text-xl font-bold mb-4 no-print">Rental Agreement</DialogTitle>
      
      <div className="flex justify-end mb-4 no-print gap-2">
        <Button onClick={handlePrint}>
          Print Agreement
        </Button>
        <ExportButton onExport={handleExport} label="Export" />
      </div>

      <div id="rental-agreement" className="p-6 bg-white border rounded-lg">
        <div className="text-center mb-6 agreement-section">
          <h1 className="text-2xl font-bold">SIRREV TRANSPORT SERVICES</h1>
          <h2 className="text-xl font-semibold mt-2">Vehicle Rental Agreement</h2>
        </div>

        <div className="space-y-6">
          <section className="agreement-section">
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

          <section className="agreement-section">
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

          <section className="agreement-section">
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

          <section className="agreement-section">
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

          <section className="agreement-section">
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

          <section className="mt-6 agreement-section">
            <h3 className="text-lg font-semibold mb-3">Signatures</h3>
            
            <div className="no-print mb-4">
              <Tabs defaultValue={signatureMode} onValueChange={(v) => setSignatureMode(v as "physical" | "digital")}>
                <TabsList className="mb-2">
                  <TabsTrigger value="physical">Physical Signature</TabsTrigger>
                  <TabsTrigger value="digital">Digital Signature</TabsTrigger>
                </TabsList>
                <TabsContent value="physical" className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Print this document and sign it physically. This section will not be visible in the printed document.
                  </p>
                </TabsContent>
                <TabsContent value="digital" className="mt-2 space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Customer Signature</h4>
                    {customerSignature ? (
                      <div className="flex flex-col items-start gap-2">
                        <img src={customerSignature} alt="Customer Signature" className="border border-gray-300 rounded max-h-[100px]" />
                        <Button variant="outline" size="sm" onClick={() => setCustomerSignature(null)}>
                          Reset Signature
                        </Button>
                      </div>
                    ) : (
                      <SignatureCanvas onSave={setCustomerSignature} />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Representative Signature</h4>
                    {representativeSignature ? (
                      <div className="flex flex-col items-start gap-2">
                        <img src={representativeSignature} alt="Representative Signature" className="border border-gray-300 rounded max-h-[100px]" />
                        <Button variant="outline" size="sm" onClick={() => setRepresentativeSignature(null)}>
                          Reset Signature
                        </Button>
                      </div>
                    ) : (
                      <SignatureCanvas onSave={setRepresentativeSignature} />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <div className="border-t border-black pt-2">
                  {customerSignature && signatureMode === "digital" ? (
                    <img src={customerSignature} alt="Customer Signature" className="signature-img max-h-[80px] mb-2" />
                  ) : null}
                  <p className="text-sm text-gray-600">Customer Signature</p>
                  <p className="text-sm text-gray-600">{rental.customerName}</p>
                </div>
              </div>
              <div>
                <div className="border-t border-black pt-2">
                  {representativeSignature && signatureMode === "digital" ? (
                    <img src={representativeSignature} alt="Representative Signature" className="signature-img max-h-[80px] mb-2" />
                  ) : null}
                  <p className="text-sm text-gray-600">SIRREV TRANSPORT SERVICES Representative</p>
                  <p className="text-sm text-gray-600">Authorized Signature</p>
                </div>
              </div>
            </div>
          </section>

          {rental.notes && (
            <section className="mt-6 agreement-section">
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

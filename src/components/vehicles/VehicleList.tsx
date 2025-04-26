
import React, { useState, useEffect } from "react";
import { getVehicles, deleteVehicle } from "@/utils/localStorage";
import { Vehicle } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Car, Search, MoreHorizontal, Plus, Trash, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import VehicleForm from "./VehicleForm";

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = () => {
    const allVehicles = getVehicles();
    setVehicles(allVehicles);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchStr = `${vehicle.make} ${vehicle.model} ${vehicle.licensePlate}`.toLowerCase();
    return searchStr.includes(searchTerm);
  });

  const handleAddClick = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vehicleId: string) => {
    setVehicleToDelete(vehicleId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      try {
        deleteVehicle(vehicleToDelete);
        loadVehicles();
      } catch (error) {
        if (error instanceof Error) {
          toast({
            variant: "destructive",
            title: "Delete Failed",
            description: error.message,
          });
        }
      }
    }
    setIsDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleFormClose = (shouldRefresh: boolean) => {
    setIsFormOpen(false);
    if (shouldRefresh) {
      loadVehicles();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="status-available">Available</span>;
      case "rented":
        return <span className="status-rented">Rented</span>;
      case "maintenance":
        return <span className="status-maintenance">Maintenance</span>;
      case "unavailable":
        return <span className="status-unavailable">Unavailable</span>;
      default:
        return <span className="status-badge bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vehicles..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={handleAddClick} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-white">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No vehicles</h3>
          <p className="mt-1 text-gray-500">Get started by adding a vehicle to your fleet.</p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Vehicle
            </Button>
          </div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-white">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No matching vehicles</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search term.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.fuelType}</div>
                    </TableCell>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>{vehicle.odometer.toLocaleString()} km</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(vehicle)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(vehicle.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle and remove the data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Vehicle Form Dialog */}
      {isFormOpen && (
        <VehicleForm
          vehicle={selectedVehicle}
          isOpen={isFormOpen}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default VehicleList;

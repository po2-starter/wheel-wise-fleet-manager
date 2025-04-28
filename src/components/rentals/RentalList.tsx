
import React, { useState, useEffect } from "react";
import { getRentals, deleteRental } from "@/utils/localStorage";
import { Rental } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Search, MoreHorizontal, Plus, Trash, Edit, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import RentalForm from "./RentalForm";
import { format } from "date-fns";

interface RentalListProps {
  onViewAgreement?: (rental: Rental) => void;
}

const RentalList: React.FC<RentalListProps> = ({ onViewAgreement }) => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [rentalToDelete, setRentalToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = () => {
    const allRentals = getRentals();
    setRentals(allRentals);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredRentals = rentals.filter((rental) => {
    const searchStr = `${rental.customerName} ${rental.customerPhone} ${rental.customerEmail || ""}`.toLowerCase();
    return searchStr.includes(searchTerm);
  });

  const handleAddClick = () => {
    setSelectedRental(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (rental: Rental) => {
    setSelectedRental(rental);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (rentalId: string) => {
    setRentalToDelete(rentalId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (rentalToDelete) {
      try {
        deleteRental(rentalToDelete);
        loadRentals();
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
    setRentalToDelete(null);
  };

  const handleFormClose = (shouldRefresh: boolean) => {
    setIsFormOpen(false);
    if (shouldRefresh) {
      loadRentals();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="status-rented">Active</span>;
      case "completed":
        return <span className="status-available">Completed</span>;
      case "overdue":
        return <span className="status-unavailable">Overdue</span>;
      case "cancelled":
        return <span className="status-maintenance">Cancelled</span>;
      default:
        return <span className="status-badge bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search rentals..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={handleAddClick} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Rental
        </Button>
      </div>

      {rentals.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-white">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No rentals</h3>
          <p className="mt-1 text-gray-500">Get started by creating a rental record.</p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Rental
            </Button>
          </div>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-white">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No matching rentals</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search term.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Rate (₵/day)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <div className="font-medium">{rental.customerName}</div>
                      <div className="text-sm text-muted-foreground">{rental.customerPhone}</div>
                    </TableCell>
                    <TableCell>{formatDate(rental.startDate)}</TableCell>
                    <TableCell>{formatDate(rental.expectedEndDate)}</TableCell>
                    <TableCell>₵{rental.rentalRate.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(rental.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onViewAgreement && (
                            <DropdownMenuItem onClick={() => onViewAgreement(rental)}>
                              <Calendar className="mr-2 h-4 w-4" /> View Agreement
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditClick(rental)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {rental.status === "active" && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedRental({...rental, status: "completed"});
                              setIsFormOpen(true);
                            }}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark as Returned
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(rental.id)}
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
              This action cannot be undone. This will permanently delete the rental record from the system.
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

      {/* Rental Form Dialog */}
      {isFormOpen && (
        <RentalForm
          rental={selectedRental}
          isOpen={isFormOpen}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default RentalList;

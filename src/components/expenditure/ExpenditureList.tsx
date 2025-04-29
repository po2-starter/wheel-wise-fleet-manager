import React, { useState, useEffect } from "react";
import { getExpenditures, deleteExpenditure } from "@/utils/localStorage";
import { Expenditure } from "@/types";
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
import { CircleDollarSign, Search, MoreHorizontal, Plus, Trash, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ExpenditureForm from "./ExpenditureForm";
import { format } from "date-fns";
import { ExportButton } from "@/components/ui/export-button"; 
import { exportExpendituresList } from "@/utils/exportUtils";

const ExpenditureList: React.FC = () => {
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpenditure, setSelectedExpenditure] = useState<Expenditure | null>(null);
  const [expenditureToDelete, setExpenditureToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadExpenditures();
  }, []);

  const loadExpenditures = () => {
    const allExpenditures = getExpenditures();
    setExpenditures(allExpenditures);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredExpenditures = expenditures.filter((expenditure) => {
    const searchStr = `${expenditure.description} ${expenditure.category}`.toLowerCase();
    return searchStr.includes(searchTerm);
  });

  const handleAddClick = () => {
    setSelectedExpenditure(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (expenditure: Expenditure) => {
    setSelectedExpenditure(expenditure);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (expenditureId: string) => {
    setExpenditureToDelete(expenditureId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenditureToDelete) {
      try {
        deleteExpenditure(expenditureToDelete);
        loadExpenditures();
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
    setExpenditureToDelete(null);
  };

  const handleFormClose = (shouldRefresh: boolean) => {
    setIsFormOpen(false);
    if (shouldRefresh) {
      loadExpenditures();
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "fuel":
        return <span className="status-rented">Fuel</span>;
      case "maintenance":
        return <span className="status-maintenance">Maintenance</span>;
      case "insurance":
        return <span className="status-available">Insurance</span>;
      case "tax":
        return <span className="status-unavailable">Tax</span>;
      case "other":
        return <span className="status-badge bg-gray-100 text-gray-800">Other</span>;
      default:
        return <span className="status-badge bg-gray-100 text-gray-800">{category}</span>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "card":
        return "Card";
      case "mobile_money":
        return "Mobile Money";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return method;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toFixed(2)}`;
  };

  // Calculate total expenditure
  const totalExpenditure = filteredExpenditures.reduce((sum, exp) => sum + exp.amount, 0);

  const handleExport = (format: "pdf" | "csv" | "word") => {
    exportExpendituresList(filteredExpenditures, format);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenditures..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton onExport={handleExport} />
          <Button onClick={handleAddClick} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Expenditure
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-md shadow-sm p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Expenditure</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenditure)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Records</h3>
            <p className="text-2xl font-bold">{filteredExpenditures.length}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date Range</h3>
            <p className="text-sm">
              {filteredExpenditures.length > 0 
                ? `${formatDate(filteredExpenditures[filteredExpenditures.length - 1].date)} - ${formatDate(filteredExpenditures[0].date)}`
                : "No data"}
            </p>
          </div>
        </div>
      </div>

      {expenditures.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-white">
          <CircleDollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No expenditures</h3>
          <p className="mt-1 text-gray-500">Get started by adding an expenditure record.</p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Expenditure
            </Button>
          </div>
        </div>
      ) : filteredExpenditures.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-white">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No matching expenditures</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search term.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount (₵)</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenditures.map((expenditure) => (
                  <TableRow key={expenditure.id}>
                    <TableCell>
                      <div className="font-medium">{expenditure.description}</div>
                      {expenditure.vehicleId && (
                        <div className="text-xs text-muted-foreground">Vehicle ID: {expenditure.vehicleId}</div>
                      )}
                    </TableCell>
                    <TableCell>{getCategoryBadge(expenditure.category)}</TableCell>
                    <TableCell>{formatDate(expenditure.date)}</TableCell>
                    <TableCell>{formatCurrency(expenditure.amount)}</TableCell>
                    <TableCell>{getPaymentMethodBadge(expenditure.paymentMethod)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(expenditure)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(expenditure.id)}
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
              This action cannot be undone. This will permanently delete the expenditure record from the system.
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

      {/* Expenditure Form Dialog */}
      {isFormOpen && (
        <ExpenditureForm
          expenditure={selectedExpenditure}
          isOpen={isFormOpen}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default ExpenditureList;


import React, { useState, useEffect } from "react";
import { getAllMaintenance, deleteMaintenance, completeMaintenance } from "@/utils/localStorage";
import { Maintenance } from "@/types";
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
import { Settings, Search, MoreHorizontal, Plus, Trash, Edit, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import MaintenanceForm from "./MaintenanceForm";
import { format } from "date-fns";

const MaintenanceList: React.FC = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadMaintenanceRecords();
  }, []);

  const loadMaintenanceRecords = () => {
    const records = getAllMaintenance();
    setMaintenanceRecords(records);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredRecords = maintenanceRecords.filter((record) => {
    const searchStr = `${record.serviceProvider} ${record.type} ${record.description}`.toLowerCase();
    return searchStr.includes(searchTerm);
  });

  const handleAddClick = () => {
    setSelectedMaintenance(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (record: Maintenance) => {
    setSelectedMaintenance(record);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (recordId: string) => {
    setMaintenanceToDelete(recordId);
    setIsDeleteDialogOpen(true);
  };

  const handleCompleteClick = (recordId: string) => {
    try {
      completeMaintenance(recordId);
      loadMaintenanceRecords();
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Action Failed",
          description: error.message,
        });
      }
    }
  };

  const confirmDelete = () => {
    if (maintenanceToDelete) {
      try {
        deleteMaintenance(maintenanceToDelete);
        loadMaintenanceRecords();
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
    setMaintenanceToDelete(null);
  };

  const handleFormClose = (shouldRefresh: boolean) => {
    setIsFormOpen(false);
    if (shouldRefresh) {
      loadMaintenanceRecords();
    }
  };

  const getMaintenanceTypeBadge = (type: string) => {
    switch (type) {
      case "routine":
        return <span className="status-available">Routine</span>;
      case "repair":
        return <span className="status-unavailable">Repair</span>;
      case "inspection":
        return <span className="status-maintenance">Inspection</span>;
      default:
        return <span className="status-badge bg-gray-100 text-gray-800">{type}</span>;
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search maintenance records..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={handleAddClick} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Maintenance
        </Button>
      </div>

      {maintenanceRecords.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-white">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No maintenance records</h3>
          <p className="mt-1 text-gray-500">Get started by adding a maintenance record.</p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Maintenance
            </Button>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-white">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No matching records</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search term.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Next Service</TableHead>
                  <TableHead>Cost (₵)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">{record.serviceProvider}</div>
                      <div className="text-sm text-muted-foreground">{record.description}</div>
                    </TableCell>
                    <TableCell>{getMaintenanceTypeBadge(record.type)}</TableCell>
                    <TableCell>{formatDate(record.serviceDate)}</TableCell>
                    <TableCell>
                      {record.nextServiceDate ? formatDate(record.nextServiceDate) : "—"}
                    </TableCell>
                    <TableCell>{formatCurrency(record.cost)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(record)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCompleteClick(record.id)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(record.id)}
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
              This action cannot be undone. This will permanently delete the maintenance record from the system.
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

      {/* Maintenance Form Dialog */}
      {isFormOpen && (
        <MaintenanceForm
          maintenance={selectedMaintenance}
          isOpen={isFormOpen}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default MaintenanceList;

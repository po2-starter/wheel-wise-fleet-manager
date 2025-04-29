
import React from "react";
import { Button } from "./button";
import { FileText, FileDown, File, FileType } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface ExportOption {
  label: string;
  format: "pdf" | "csv" | "word";
  icon: React.ReactNode;
}

interface ExportButtonProps {
  onExport: (format: "pdf" | "csv" | "word") => void;
  label?: string;
}

const exportOptions: ExportOption[] = [
  {
    label: "PDF",
    format: "pdf",
    icon: <FileText className="mr-2 h-4 w-4" />,
  },
  {
    label: "CSV",
    format: "csv",
    icon: <FileType className="mr-2 h-4 w-4" />,
  },
  {
    label: "Word",
    format: "word",
    icon: <File className="mr-2 h-4 w-4" />,
  },
];

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  label = "Export",
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {exportOptions.map((option) => (
          <DropdownMenuItem
            key={option.format}
            onClick={() => onExport(option.format)}
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

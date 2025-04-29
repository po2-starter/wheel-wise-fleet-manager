
import { Rental, Expenditure } from "@/types";
import { format } from "date-fns";
import { getVehicleById } from "./localStorage";

// Helper to trigger file download
export const downloadFile = (
  content: string,
  fileName: string,
  contentType: string
) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Format date to a readable string
export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return "Invalid date";
  }
};

// Export to CSV
export const exportToCSV = (
  data: Array<Record<string, any>>,
  headers: Record<string, string>,
  fileName: string
) => {
  // Create header row
  const headerRow = Object.values(headers).join(",");
  
  // Create data rows
  const dataRows = data.map(item => 
    Object.keys(headers)
      .map(key => {
        const value = item[key];
        // Handle strings with commas by wrapping in quotes
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value || "";
      })
      .join(",")
  );
  
  // Combine header and data
  const csvContent = [headerRow, ...dataRows].join("\n");
  
  // Trigger download
  downloadFile(csvContent, `${fileName}.csv`, "text/csv");
};

// Export to Word (simplified HTML that Word can open)
export const exportToWord = (
  htmlContent: string,
  fileName: string
) => {
  // Basic Word-compatible HTML template
  const wordTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${fileName}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
  
  downloadFile(wordTemplate, `${fileName}.doc`, "application/msword");
};

// Special function for rental agreement export
export const exportRentalAgreement = (rental: Rental, format: "pdf" | "csv" | "word") => {
  switch (format) {
    case "pdf":
      window.print();
      break;
    
    case "csv":
      const vehicle = getVehicleById(rental.vehicleId);
      const rentalData = [
        {
          id: rental.id,
          customerName: rental.customerName,
          customerPhone: rental.customerPhone,
          customerEmail: rental.customerEmail || "",
          vehicleInfo: `${vehicle?.make} ${vehicle?.model} (${vehicle?.year})`,
          licensePlate: vehicle?.licensePlate || "",
          startDate: formatDate(rental.startDate),
          expectedEndDate: formatDate(rental.expectedEndDate),
          actualEndDate: rental.actualEndDate ? formatDate(rental.actualEndDate) : "",
          rentalRate: rental.rentalRate,
          deposit: rental.deposit,
          status: rental.status,
          notes: rental.notes || ""
        }
      ];
      
      const headers = {
        id: "Agreement ID",
        customerName: "Customer Name",
        customerPhone: "Phone",
        customerEmail: "Email",
        vehicleInfo: "Vehicle",
        licensePlate: "License Plate",
        startDate: "Start Date",
        expectedEndDate: "Expected Return Date",
        actualEndDate: "Actual Return Date",
        rentalRate: "Daily Rate (₵)",
        deposit: "Deposit (₵)",
        status: "Status",
        notes: "Notes"
      };
      
      exportToCSV(rentalData, headers, `rental_agreement_${rental.id}`);
      break;
    
    case "word":
      // Get the rental agreement HTML content
      const agreementElement = document.getElementById("rental-agreement");
      if (!agreementElement) return;
      
      // Create a clean version for Word
      const content = agreementElement.cloneNode(true) as HTMLElement;
      
      // Remove any unwanted classes or elements
      const buttonsToRemove = content.querySelectorAll(".no-print");
      buttonsToRemove.forEach(btn => btn.remove());
      
      exportToWord(content.innerHTML, `rental_agreement_${rental.id}`);
      break;
  }
};

// Function to export rentals list
export const exportRentalsList = (rentals: Rental[], format: "pdf" | "csv" | "word") => {
  switch (format) {
    case "pdf":
      // Create a temporary div with all rentals data formatted for print
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = `
        <h1 style="text-align: center;">Rentals List</h1>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Customer</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Start Date</th>
              <th style="border: 1px solid #ddd; padding: 8px;">End Date</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Rate (₵/day)</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rentals.map(rental => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  <div>${rental.customerName}</div>
                  <div style="font-size: 0.8em;">${rental.customerPhone}</div>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(rental.startDate)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(rental.expectedEndDate)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₵${rental.rentalRate.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${rental.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      
      // Add the temp div to the body
      document.body.appendChild(tempDiv);
      
      // Add print styles
      const style = document.createElement("style");
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          ${tempDiv.tagName.toLowerCase()} * {
            visibility: visible;
          }
          ${tempDiv.tagName.toLowerCase()} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Trigger print
      window.print();
      
      // Clean up
      document.body.removeChild(tempDiv);
      document.head.removeChild(style);
      break;
    
    case "csv":
      const rentalData = rentals.map(rental => {
        const vehicle = getVehicleById(rental.vehicleId);
        return {
          id: rental.id,
          customerName: rental.customerName,
          customerPhone: rental.customerPhone,
          customerEmail: rental.customerEmail || "",
          vehicle: `${vehicle?.make} ${vehicle?.model} (${vehicle?.year})`,
          startDate: formatDate(rental.startDate),
          expectedEndDate: formatDate(rental.expectedEndDate),
          rentalRate: rental.rentalRate,
          status: rental.status
        };
      });
      
      const headers = {
        id: "ID",
        customerName: "Customer Name",
        customerPhone: "Phone",
        customerEmail: "Email",
        vehicle: "Vehicle",
        startDate: "Start Date",
        expectedEndDate: "Expected End Date",
        rentalRate: "Daily Rate (₵)",
        status: "Status"
      };
      
      exportToCSV(rentalData, headers, "rentals_list");
      break;
    
    case "word":
      // Create a table for Word
      const wordContent = `
        <h1>Rentals List</h1>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Rate (₵/day)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rentals.map(rental => `
              <tr>
                <td>
                  <p>${rental.customerName}</p>
                  <p style="font-size: smaller;">${rental.customerPhone}</p>
                </td>
                <td>${formatDate(rental.startDate)}</td>
                <td>${formatDate(rental.expectedEndDate)}</td>
                <td>${rental.rentalRate.toFixed(2)}</td>
                <td>${rental.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      
      exportToWord(wordContent, "rentals_list");
      break;
  }
};

// Function to export expenditures list
export const exportExpendituresList = (expenditures: Expenditure[], format: "pdf" | "csv" | "word") => {
  switch (format) {
    case "pdf":
      // Create a temporary div with all expenditures data formatted for print
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = `
        <h1 style="text-align: center;">Expenditures List</h1>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Category</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Amount (₵)</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            ${expenditures.map(exp => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${exp.description}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${exp.category}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(exp.date)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₵${exp.amount.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${exp.paymentMethod}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      
      // Add the temp div to the body
      document.body.appendChild(tempDiv);
      
      // Add print styles
      const style = document.createElement("style");
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          ${tempDiv.tagName.toLowerCase()} * {
            visibility: visible;
          }
          ${tempDiv.tagName.toLowerCase()} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Trigger print
      window.print();
      
      // Clean up
      document.body.removeChild(tempDiv);
      document.head.removeChild(style);
      break;
    
    case "csv":
      const expData = expenditures.map(exp => {
        return {
          description: exp.description,
          category: exp.category,
          date: formatDate(exp.date),
          amount: exp.amount.toFixed(2),
          paymentMethod: exp.paymentMethod,
          notes: exp.notes || ""
        };
      });
      
      const headers = {
        description: "Description",
        category: "Category",
        date: "Date",
        amount: "Amount (₵)",
        paymentMethod: "Payment Method",
        notes: "Notes"
      };
      
      exportToCSV(expData, headers, "expenditures_list");
      break;
    
    case "word":
      // Create a table for Word
      const wordContent = `
        <h1>Expenditures List</h1>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount (₵)</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            ${expenditures.map(exp => `
              <tr>
                <td>${exp.description}</td>
                <td>${exp.category}</td>
                <td>${formatDate(exp.date)}</td>
                <td>${exp.amount.toFixed(2)}</td>
                <td>${exp.paymentMethod}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      
      exportToWord(wordContent, "expenditures_list");
      break;
  }
};

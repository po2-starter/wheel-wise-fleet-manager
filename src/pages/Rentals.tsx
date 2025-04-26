
import React from "react";
import Layout from "../components/Layout";
import RentalList from "../components/rentals/RentalList";

const RentalsPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Rental Management</h1>
        <p className="text-muted-foreground">
          Manage vehicle rentals, customer information, and track rental status.
        </p>
        <RentalList />
      </div>
    </Layout>
  );
};

export default RentalsPage;

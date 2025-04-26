
import React from "react";
import Layout from "../components/Layout";
import VehicleList from "../components/vehicles/VehicleList";

const VehiclesPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <p className="text-muted-foreground">
          Manage your fleet vehicles, including status updates and maintenance scheduling.
        </p>
        <VehicleList />
      </div>
    </Layout>
  );
};

export default VehiclesPage;

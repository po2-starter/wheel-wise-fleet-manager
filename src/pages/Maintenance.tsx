
import React from "react";
import Layout from "../components/Layout";
import MaintenanceList from "../components/maintenance/MaintenanceList";

const MaintenancePage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Maintenance Records</h1>
        <p className="text-muted-foreground">
          Track vehicle maintenance history, schedule services, and manage repairs.
        </p>
        <MaintenanceList />
      </div>
    </Layout>
  );
};

export default MaintenancePage;


import React from "react";
import Layout from "../components/Layout";
import ExpenditureList from "../components/expenditure/ExpenditureList";

const ExpenditurePage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Expenditure Management</h1>
        <p className="text-muted-foreground">
          Track and manage all fleet-related expenses in cedis.
        </p>
        <ExpenditureList />
      </div>
    </Layout>
  );
};

export default ExpenditurePage;

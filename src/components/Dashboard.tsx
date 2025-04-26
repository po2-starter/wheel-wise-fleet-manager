
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initializeData, getDashboardStats } from "@/utils/localStorage";
import { DashboardStats, Vehicle, Rental, Expenditure } from "@/types";
import {
  BarChart,
  Calendar,
  Car,
  CircleDollarSign,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Gauge,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const StatusCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: "up" | "down" | "none";
  color?: string;
}> = ({ title, value, icon, description, trend, color = "bg-white" }) => {
  return (
    <Card className={`${color} border-none shadow-md`}>
      <CardContent className="p-6 flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline">
            <h2 className="text-3xl font-bold">{value}</h2>
            {trend && (
              <span className="ml-2">
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : null}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize sample data if needed
    initializeData();
    
    // Get statistics
    const dashboardStats = getDashboardStats();
    setStats(dashboardStats);
    setIsLoading(false);
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-light text-gray-500">Loading dashboard...</div>
      </div>
    );
  }
  
  // Format financial values
  const formatCedis = (value: number) => {
    return `₵${value.toFixed(2)}`;
  };
  
  // Data for vehicle status chart
  const vehicleStatusData = [
    { name: "Available", value: stats.availableVehicles, color: "#10B981" },
    { name: "Rented", value: stats.rentedVehicles, color: "#0EA5E9" },
    { name: "Maintenance", value: stats.maintenanceVehicles, color: "#F59E0B" },
    { name: "Unavailable", value: stats.unavailableVehicles, color: "#EF4444" },
  ];
  
  // Data for financial comparison
  const financialData = [
    { name: "Revenue", amount: stats.monthlyRevenue },
    { name: "Expenses", amount: stats.monthlyExpenses },
    { name: "Profit", amount: stats.monthlyRevenue - stats.monthlyExpenses },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          icon={<Car className="h-5 w-5 text-fleet-primary" />}
        />
        <StatusCard
          title="Active Rentals"
          value={stats.activeRentals}
          icon={<Calendar className="h-5 w-5 text-fleet-secondary" />}
        />
        <StatusCard
          title="Monthly Revenue"
          value={formatCedis(stats.monthlyRevenue)}
          icon={<TrendingUp className="h-5 w-5 text-fleet-accent" />}
          trend="up"
        />
        <StatusCard
          title="Monthly Expenses"
          value={formatCedis(stats.monthlyExpenses)}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          trend="down"
        />
      </div>

      {/* Alert for overdue rentals and upcoming maintenance */}
      {(stats.overdueRentals > 0 || stats.upcomingMaintenance > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <div>
            <h4 className="font-medium text-amber-800">Attention Required</h4>
            <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
              {stats.overdueRentals > 0 && (
                <li>{stats.overdueRentals} overdue rental(s) need attention</li>
              )}
              {stats.upcomingMaintenance > 0 && (
                <li>{stats.upcomingMaintenance} vehicle(s) due for maintenance this week</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Charts and Detailed Info */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Vehicle Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vehicleStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {vehicleStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} vehicles`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {vehicleStatusData.map((status) => (
                    <div key={status.name} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span>{status.name} ({status.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={financialData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₵${Number(value).toFixed(2)}`, 'Amount']} />
                      <Bar 
                        dataKey="amount" 
                        name="Amount (₵)" 
                        fill="#0EA5E9" 
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-medium">{formatCedis(stats.monthlyRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="font-medium">{formatCedis(stats.monthlyExpenses)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit</p>
                    <p className={`font-medium ${stats.monthlyRevenue - stats.monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCedis(stats.monthlyRevenue - stats.monthlyExpenses)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatusCard
                  title="Available"
                  value={stats.availableVehicles}
                  description={`${((stats.availableVehicles / stats.totalVehicles) * 100).toFixed(0)}% of fleet`}
                  icon={<Car className="h-4 w-4 text-green-500" />}
                  color="bg-green-50"
                />
                <StatusCard
                  title="Rented"
                  value={stats.rentedVehicles}
                  description={`${((stats.rentedVehicles / stats.totalVehicles) * 100).toFixed(0)}% of fleet`}
                  icon={<Calendar className="h-4 w-4 text-blue-500" />}
                  color="bg-blue-50"
                />
                <StatusCard
                  title="In Maintenance"
                  value={stats.maintenanceVehicles}
                  description={`${((stats.maintenanceVehicles / stats.totalVehicles) * 100).toFixed(0)}% of fleet`}
                  icon={<Gauge className="h-4 w-4 text-yellow-500" />}
                  color="bg-yellow-50"
                />
                <StatusCard
                  title="Unavailable"
                  value={stats.unavailableVehicles}
                  description={`${((stats.unavailableVehicles / stats.totalVehicles) * 100).toFixed(0)}% of fleet`}
                  icon={<AlertCircle className="h-4 w-4 text-red-500" />}
                  color="bg-red-50"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <StatusCard
                  title="Monthly Revenue"
                  value={formatCedis(stats.monthlyRevenue)}
                  icon={<CircleDollarSign className="h-4 w-4 text-green-500" />}
                  color="bg-green-50"
                />
                <StatusCard
                  title="Monthly Expenses"
                  value={formatCedis(stats.monthlyExpenses)}
                  icon={<CircleDollarSign className="h-4 w-4 text-red-500" />}
                  color="bg-red-50"
                />
                <StatusCard
                  title="Monthly Profit"
                  value={formatCedis(stats.monthlyRevenue - stats.monthlyExpenses)}
                  icon={<BarChart className="h-4 w-4 text-blue-500" />}
                  color="bg-blue-50"
                  trend={stats.monthlyRevenue - stats.monthlyExpenses > 0 ? "up" : "down"}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

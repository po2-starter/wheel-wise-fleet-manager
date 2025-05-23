
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Car,
  Calendar,
  Settings,
  ChevronRight,
  ChevronLeft,
  CircleDollarSign,
  Gauge,
  Menu,
  X,
  LogOut,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import Footer from "./Footer";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const navLinks = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Gauge className="h-5 w-5" />,
    },
    {
      name: "Vehicles",
      path: "/vehicles",
      icon: <Car className="h-5 w-5" />,
    },
    {
      name: "Rentals",
      path: "/rentals",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Maintenance",
      path: "/maintenance",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: "Expenditure",
      path: "/expenditure",
      icon: <CircleDollarSign className="h-5 w-5" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    // Remove the login token
    localStorage.removeItem("isLoggedIn");
    
    // Show toast notification
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system."
    });
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <aside
          className={cn(
            "hidden lg:block bg-fleet-dark text-white transition-all duration-300 ease-in-out",
            collapsed ? "lg:w-20" : "lg:w-64"
          )}
        >
          <div className="p-4 flex items-center justify-between">
            {!collapsed && <h1 className="text-xl font-bold">SIRREV TRANSPORT SERVICES</h1>}
            <button
              onClick={toggleSidebar}
              className={cn(
                "p-2 rounded-md hover:bg-gray-700 transition-colors",
                collapsed && "mx-auto"
              )}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>
          <nav className="mt-6">
            <ul className="space-y-2 px-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center py-3 px-4 rounded-md transition-colors",
                        isActive
                          ? "bg-fleet-secondary text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      )
                    }
                  >
                    <span className="mr-3">{link.icon}</span>
                    {!collapsed && <span>{link.name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm z-10">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">SIRREV TRANSPORT SERVICES Fleet Manager</h1>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Welcome, Admin</span>
                <div className="h-8 w-8 rounded-full bg-fleet-primary text-white flex items-center justify-center">
                  A
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-md hover:bg-gray-100 flex items-center gap-1 text-sm text-gray-600"
                >
                  <LogOut className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-gray-900/50">
              <div className="w-64 h-full bg-fleet-dark text-white p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-bold">SIRREV TRANSPORT SERVICES</h1>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-md hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav>
                  <ul className="space-y-2">
                    {navLinks.map((link) => (
                      <li key={link.path}>
                        <NavLink
                          to={link.path}
                          onClick={toggleMobileMenu}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center py-3 px-4 rounded-md transition-colors",
                              isActive
                                ? "bg-fleet-secondary text-white"
                                : "text-gray-300 hover:bg-gray-700"
                            )
                          }
                        >
                          <span className="mr-3">{link.icon}</span>
                          <span>{link.name}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-6">
            {children}
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;

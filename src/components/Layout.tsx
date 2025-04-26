
import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Car,
  Calendar,
  Settings,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  CircleDollarSign,
  Gauge,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block bg-fleet-dark text-white transition-all duration-300 ease-in-out",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-bold">WheelWise</h1>}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">WheelWise Fleet Manager</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <div className="h-8 w-8 rounded-full bg-fleet-primary text-white flex items-center justify-center">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-gray-900/50">
            <div className="w-64 h-full bg-fleet-dark text-white p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">WheelWise</h1>
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

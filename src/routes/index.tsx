import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import RootLayout from "../components/layout/RootLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import SuperAdminLayout from "../components/layout/SuperAdminLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Tenant Portal Pages
import Dashboard from "../pages/Dashboard";
import Customers from "../pages/Customers";
import Sales from "../pages/Sales";
import Tickets from "../pages/Tickets";
import Complaints from "../pages/Complaints";
import JobWorks from "../pages/JobWorks";
import Users from "../pages/Users";
import Logs from "../pages/Logs";
import Contracts from "../pages/Contracts";
import ContractDetail from "../pages/ContractDetail";
import ProductSales from "../pages/ProductSales";
import ServiceContracts from "../pages/ServiceContracts";
import Notifications from "../pages/Notifications";
import TenantConfiguration from "../pages/TenantConfiguration";
import ConfigurationTest from "../pages/ConfigurationTest";
import Companies from "../pages/masters/Companies";
import Products from "../pages/masters/Products";
import CustomersMaster from "../pages/masters/CustomersMaster";
import { PDFTemplates } from "../pages/PDFTemplates";

// RBAC Management Pages
import UserManagement from "../pages/UserManagement";
import RoleManagement from "../pages/RoleManagement";
import PermissionMatrix from "../pages/PermissionMatrix";
import DemoAccounts from "../pages/DemoAccounts";

// Super Admin Portal Pages
import SuperAdminDashboard from "../pages/SuperAdminDashboard";
import SuperAdminTenants from "../pages/SuperAdminTenants";
import SuperAdminUsers from "../pages/SuperAdminUsers";
import SuperAdminRoleRequests from "../pages/SuperAdminRoleRequests";
import SuperAdminAnalytics from "../pages/SuperAdminAnalytics";
import SuperAdminHealth from "../pages/SuperAdminHealth";
import SuperAdminConfiguration from "../pages/SuperAdminConfiguration";

const routes = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/tenant/dashboard" replace />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "demo-accounts",
        element: <DemoAccounts />,
      },
      // Direct route redirects for common paths
      {
        path: "dashboard",
        element: <Navigate to="/tenant/dashboard" replace />,
      },
      {
        path: "customers",
        element: <Navigate to="/tenant/customers" replace />,
      },
      {
        path: "sales",
        element: <Navigate to="/tenant/sales" replace />,
      },
      {
        path: "product-sales",
        element: <Navigate to="/tenant/product-sales" replace />,
      },
      {
        path: "service-contracts",
        element: <Navigate to="/tenant/service-contracts" replace />,
      },
      {
        path: "tickets",
        element: <Navigate to="/tenant/tickets" replace />,
      },
      {
        path: "complaints",
        element: <Navigate to="/tenant/complaints" replace />,
      },
      {
        path: "job-works",
        element: <Navigate to="/tenant/job-works" replace />,
      },
      {
        path: "contracts",
        element: <Navigate to="/tenant/contracts" replace />,
      },
      {
        path: "notifications",
        element: <Navigate to="/tenant/notifications" replace />,
      },
      {
        path: "users",
        element: <Navigate to="/tenant/users" replace />,
      },
      {
        path: "logs",
        element: <Navigate to="/tenant/logs" replace />,
      },
      {
        path: "configuration",
        element: <Navigate to="/tenant/configuration" replace />,
      },
      // Tenant Portal Routes
      {
        path: "tenant",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "customers",
            element: <Customers />,
          },
          {
            path: "sales",
            element: <Sales />,
          },
          {
            path: "product-sales",
            element: <ProductSales />,
          },
          {
            path: "service-contracts",
            element: <ServiceContracts />,
          },
          {
            path: "service-contracts/:id",
            element: <ServiceContracts />,
          },
          {
            path: "tickets",
            element: <Tickets />,
          },
          {
            path: "complaints",
            element: <Complaints />,
          },
          {
            path: "job-works",
            element: <JobWorks />,
          },
          {
            path: "contracts",
            element: <Contracts />,
          },
          {
            path: "contracts/:id",
            element: <ContractDetail />,
          },
          {
            path: "notifications",
            element: <Notifications />,
          },
          {
            path: "users",
            element: <Users />,
          },
          {
            path: "logs",
            element: <Logs />,
          },
          {
            path: "configuration",
            element: <TenantConfiguration />,
          },
          {
            path: "configuration-test",
            element: <ConfigurationTest />,
          },
          {
            path: "masters/companies",
            element: <Companies />,
          },
          {
            path: "masters/products",
            element: <Products />,
          },
          {
            path: "masters/customers",
            element: <CustomersMaster />,
          },
          {
            path: "pdf-templates",
            element: <PDFTemplates />,
          },
          // RBAC Management Routes
          {
            path: "user-management",
            element: <UserManagement />,
          },
          {
            path: "role-management",
            element: <RoleManagement />,
          },
          {
            path: "permission-matrix",
            element: <PermissionMatrix />,
          },
        ],
      },
      // Super Admin Portal Routes
      {
        path: "super-admin",
        element: (
          <ProtectedRoute>
            <SuperAdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <SuperAdminDashboard />,
          },
          {
            path: "tenants",
            element: <SuperAdminTenants />,
          },
          {
            path: "users",
            element: <SuperAdminUsers />,
          },
          {
            path: "role-requests",
            element: <SuperAdminRoleRequests />,
          },
          {
            path: "analytics",
            element: <SuperAdminAnalytics />,
          },
          {
            path: "health",
            element: <SuperAdminHealth />,
          },
          {
            path: "configuration",
            element: <SuperAdminConfiguration />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { useApp } from './context/AppContext';

// Lazy loaded page components
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const KanbanPage = React.lazy(() => import('./pages/KanbanPage').then((m) => ({ default: m.KanbanPage })));
const CampaignsPage = React.lazy(() => import('./pages/CampaignsPage').then((m) => ({ default: m.CampaignsPage })));
const DriveVaultPage = React.lazy(() => import('./pages/DriveVaultPage').then((m) => ({ default: m.DriveVaultPage })));
const BrandTerritoryPage = React.lazy(() => import('./pages/BrandTerritoryPage').then((m) => ({ default: m.BrandTerritoryPage })));
const EquipmentPage = React.lazy(() => import('./pages/EquipmentPage').then((m) => ({ default: m.EquipmentPage })));
const DualCalendarPage = React.lazy(() => import('./pages/DualCalendarPage').then((m) => ({ default: m.DualCalendarPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const DirectorOperationsDashboard = React.lazy(() => import('./components/DirectorOperationsDashboard').then((m) => ({ default: m.DirectorOperationsDashboard })));
const ClientHubPage = React.lazy(() => import('./pages/ClientHubPage').then((m) => ({ default: m.ClientHubPage })));
const SystemSpecsPage = React.lazy(() => import('./pages/SystemSpecsPage').then((m) => ({ default: m.SystemSpecsPage })));
const MobileCompanionPage = React.lazy(() => import('./pages/MobileCompanionPage').then((m) => ({ default: m.MobileCompanionPage })));

const IndexRedirect: React.FC = () => {
  const { currentUser } = useApp();
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobileScreen) {
    return <Navigate to="/mobile" replace />;
  }

  if (currentUser?.role === 'cliente') {
    return <Navigate to="/client/hub" replace />;
  }
  return <Navigate to="/kanban" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    errorElement: <RouteErrorBoundary />,
    element: (
      <React.Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-medium text-xs">Cargando acceso...</div>}>
        <LoginPage />
      </React.Suspense>
    ),
  },
  {
    path: '/mobile',
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-medium text-xs">Cargando N. Studios Mobile...</div>}>
            <MobileCompanionPage />
          </React.Suspense>
        ),
      },
    ],
  },
  {
    path: '/client/mobile',
    element: <ProtectedRoute allowedRoles={['cliente', 'webadmin', 'director']} />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-medium text-xs">Cargando Portal de Cliente Móvil...</div>}>
            <MobileCompanionPage />
          </React.Suspense>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: <IndexRedirect />,
          },
          {
            path: 'kanban',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Tablero Kanban...</div>}>
                <KanbanPage />
              </React.Suspense>
            ),
          },
          {
            path: 'campaigns',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Gestor de Campañas...</div>}>
                <CampaignsPage />
              </React.Suspense>
            ),
          },
          {
            path: 'drive',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Drive Vault & Media Hub...</div>}>
                <DriveVaultPage />
              </React.Suspense>
            ),
          },
          {
            path: 'drive-vault',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Drive Vault & Media Hub...</div>}>
                <DriveVaultPage />
              </React.Suspense>
            ),
          },
          {
            path: 'brands',
            element: <ProtectedRoute allowedRoles={['webadmin', 'director']} />,
            children: [
              {
                index: true,
                element: (
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Gestión de Marcas & Territorios...</div>}>
                    <BrandTerritoryPage />
                  </React.Suspense>
                ),
              },
            ],
          },
          {
            path: 'equipment',
            element: <ProtectedRoute allowedRoles={['webadmin', 'director', 'colaborador']} />,
            children: [
              {
                index: true,
                element: (
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Inventario de Hardware & Equipos...</div>}>
                    <EquipmentPage />
                  </React.Suspense>
                ),
              },
            ],
          },
          {
            path: 'calendar',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Calendarios Duales...</div>}>
                <DualCalendarPage />
              </React.Suspense>
            ),
          },
          {
            path: 'operations',
            element: <ProtectedRoute allowedRoles={['director', 'webadmin']} />,
            children: [
              {
                index: true,
                element: (
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Panel de Dirección & Operaciones...</div>}>
                    <DirectorOperationsDashboard />
                  </React.Suspense>
                ),
              },
            ],
          },
          {
            path: 'admin',
            element: <ProtectedRoute allowedRoles={['webadmin']} />,
            children: [
              {
                index: true,
                element: (
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando WebAdmin Dashboard...</div>}>
                    <AdminPage />
                  </React.Suspense>
                ),
              },
            ],
          },
          {
            path: 'client/hub',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Hub de Marca & Co-Creación...</div>}>
                <ClientHubPage />
              </React.Suspense>
            ),
          },
          {
            path: 'specs',
            element: <ProtectedRoute allowedRoles={['webadmin', 'director']} />,
            children: [
              {
                index: true,
                element: (
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando System Specs Hub...</div>}>
                    <SystemSpecsPage />
                  </React.Suspense>
                ),
              },
            ],
          },
          {
            path: '*',
            element: <RouteErrorBoundary />,
          },
        ],
      },
    ],
  },
]);

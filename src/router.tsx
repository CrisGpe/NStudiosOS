import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { useApp } from './context/AppContext';

// Lazy loading views
const LoginView = React.lazy(() => import('./components/LoginView').then((m) => ({ default: m.LoginView })));
const KanbanBoard = React.lazy(() => import('./components/KanbanBoard').then((m) => ({ default: m.KanbanBoard })));
const CampaignManager = React.lazy(() => import('./components/CampaignManager').then((m) => ({ default: m.CampaignManager })));
const DriveVaultManager = React.lazy(() => import('./components/DriveVaultManager').then((m) => ({ default: m.DriveVaultManager })));
const BrandTerritoryManager = React.lazy(() => import('./components/BrandTerritoryManager').then((m) => ({ default: m.BrandTerritoryManager })));
const EquipmentManager = React.lazy(() => import('./components/EquipmentManager').then((m) => ({ default: m.EquipmentManager })));
const DualCalendar = React.lazy(() => import('./components/DualCalendar').then((m) => ({ default: m.DualCalendar })));
const WebAdminDashboard = React.lazy(() => import('./components/WebAdminDashboard').then((m) => ({ default: m.WebAdminDashboard })));
const ClientBrandHub = React.lazy(() => import('./components/ClientBrandHub').then((m) => ({ default: m.ClientBrandHub })));
const SystemSpecsHub = React.lazy(() => import('./components/SystemSpecsHub').then((m) => ({ default: m.SystemSpecsHub })));
const MobileCompanionHub = React.lazy(() => import('./components/mobile/MobileCompanionHub').then((m) => ({ default: m.MobileCompanionHub })));

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
      <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-xs">Cargando acceso...</div>}>
        <LoginView />
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
          <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-xs">Cargando N. Studios Mobile...</div>}>
            <MobileCompanionHub />
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
          <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-xs">Cargando Portal de Cliente Móvil...</div>}>
            <MobileCompanionHub />
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
                <KanbanBoard />
              </React.Suspense>
            ),
          },
          {
            path: 'campaigns',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Gestor de Campañas...</div>}>
                <CampaignManager />
              </React.Suspense>
            ),
          },
          {
            path: 'drive',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Drive Vault & Media Hub...</div>}>
                <DriveVaultManager />
              </React.Suspense>
            ),
          },
          {
            path: 'drive-vault',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Drive Vault & Media Hub...</div>}>
                <DriveVaultManager />
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
                    <BrandTerritoryManager />
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
                    <EquipmentManager />
                  </React.Suspense>
                ),
              },
            ],
          },
          {
            path: 'calendar',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Calendarios Duales...</div>}>
                <DualCalendar />
              </React.Suspense>
            ),
          },
          {
            path: 'admin',
            element: <ProtectedRoute allowedRoles={['webadmin']} />,
            children: [
              {
                index: true,
                element: (
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando WebAdmin Dashboard...</div>}>
                    <WebAdminDashboard />
                  </React.Suspense>
                ),
              },
            ],
          },
          {
            path: 'client/hub',
            element: (
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Hub de Marca & Co-Creación...</div>}>
                <ClientBrandHub />
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
                    <SystemSpecsHub />
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

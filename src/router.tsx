import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { useApp } from './context/AppContext';

// Resilient Lazy Loading that auto-reloads on new Vercel deployments
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    const pageHasBeenRefreshed = sessionStorage.getItem('page-refreshed-for-chunk');

    try {
      const component = await factory();
      sessionStorage.removeItem('page-refreshed-for-chunk');
      return component;
    } catch (error: any) {
      const isChunkError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.message?.includes('dynamically imported module') ||
        error?.name === 'ChunkLoadError';

      if (isChunkError && !pageHasBeenRefreshed) {
        sessionStorage.setItem('page-refreshed-for-chunk', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {}); // Suspend while reload occurs
      }
      throw error;
    }
  });
}

// Lazy loaded page components with auto-retry
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const KanbanPage = lazyWithRetry(() => import('./pages/KanbanPage').then((m) => ({ default: m.KanbanPage })));
const CampaignsPage = lazyWithRetry(() => import('./pages/CampaignsPage').then((m) => ({ default: m.CampaignsPage })));
const DriveVaultPage = lazyWithRetry(() => import('./pages/DriveVaultPage').then((m) => ({ default: m.DriveVaultPage })));
const BrandTerritoryPage = lazyWithRetry(() => import('./pages/BrandTerritoryPage').then((m) => ({ default: m.BrandTerritoryPage })));
const EquipmentPage = lazyWithRetry(() => import('./pages/EquipmentPage').then((m) => ({ default: m.EquipmentPage })));
const DualCalendarPage = lazyWithRetry(() => import('./pages/DualCalendarPage').then((m) => ({ default: m.DualCalendarPage })));
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const OperationsPage = lazyWithRetry(() => import('./pages/OperationsPage').then((m) => ({ default: m.OperationsPage })));
const ClientHubPage = lazyWithRetry(() => import('./pages/ClientHubPage').then((m) => ({ default: m.ClientHubPage })));
const SystemSpecsPage = lazyWithRetry(() => import('./pages/SystemSpecsPage').then((m) => ({ default: m.SystemSpecsPage })));
const MobileCompanionPage = lazyWithRetry(() => import('./pages/MobileCompanionPage').then((m) => ({ default: m.MobileCompanionPage })));

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
                    <OperationsPage />
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
            element: <ProtectedRoute allowedRoles={['cliente', 'webadmin', 'director']} />,
            children: [
              {
                index: true,
                element: (
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-medium">Cargando Hub de Marca & Co-Creación...</div>}>
                    <ClientHubPage />
                  </React.Suspense>
                ),
              },
            ],
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

import { useApp } from '../context/AppContext';
import { UserRole, DeliverablePhase } from '../types';

export const useRBAC = () => {
  const { currentUser } = useApp();

  const isRole = (role: UserRole) => currentUser.role === role;
  const isClient = () => isRole('cliente');
  const isDirector = () => isRole('director');
  const isWebAdmin = () => isRole('webadmin');
  const isColaborador = () => isRole('colaborador');

  const can = (action: string, resource: string) => {
    // Basic RBAC logic based on roles
    if (isWebAdmin()) return true;
    
    if (isDirector()) {
      // Directors can do mostly everything except maybe some admin stuff
      return true;
    }

    if (isColaborador()) {
      if (action === 'delete') return false;
      return true;
    }

    if (isClient()) {
      if (['create', 'update', 'delete'].includes(action) && resource !== 'sandboxIdea') return false;
      return true; // Read-only for most things
    }

    return false;
  };

  const canAdvancePhase = (currentPhase: DeliverablePhase, targetPhase: DeliverablePhase) => {
    if (isWebAdmin() || isDirector()) return true;
    
    // Clients can only approve
    if (isClient()) {
      return targetPhase === 'aprobacion_cliente';
    }

    // Colaboradores can advance through production
    if (isColaborador()) {
      if (targetPhase === 'publicado') return false;
      return true;
    }

    return false;
  };

  return {
    isRole,
    isClient,
    isDirector,
    isWebAdmin,
    isColaborador,
    can,
    canAdvancePhase,
    currentUser
  };
};

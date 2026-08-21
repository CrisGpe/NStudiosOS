import { DeliverablePhase } from '../../types';

export interface KanbanColumnConfig {
  id: DeliverablePhase;
  macroPhase: 'pre_produccion' | 'produccion' | 'post_produccion';
  title: string;
  graphicTitle?: string;
  subtitle: string;
  graphicSubtitle?: string;
  chronologyTag: string;
  colorClass: string;
  badgeBg: string;
  accentHex: string;
}

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'ideacion',
    macroPhase: 'pre_produccion',
    title: '1. Ideación Co-creativa',
    graphicTitle: '1. Ideación & Brief',
    subtitle: 'Co-creación cliente + equipo',
    graphicSubtitle: 'Copywriting y concepto',
    chronologyTag: 'Día 1-15',
    colorClass: 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    accentHex: '#3b82f6',
  },
  {
    id: 'calendarizacion',
    macroPhase: 'pre_produccion',
    title: '2. Calendarización',
    graphicTitle: '2. Planificación',
    subtitle: 'Definición de fechas y rodaje',
    graphicSubtitle: 'Fechas de entrega y pauta',
    chronologyTag: 'Día 15-20',
    colorClass: 'border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    accentHex: '#6366f1',
  },
  {
    id: 'guia_tecnica',
    macroPhase: 'pre_produccion',
    title: '3. Guía Técnica AV',
    graphicTitle: '3. Guía Gráfica & Moodboard',
    subtitle: 'Consolidación técnica y gear',
    graphicSubtitle: 'Paleta, tipografía y estilo',
    chronologyTag: 'Día 20 a Fin-5',
    colorClass: 'border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    accentHex: '#f59e0b',
  },
  {
    id: 'produccion',
    macroPhase: 'produccion',
    title: '4. En Rodaje',
    graphicTitle: '4. Diseño Activo',
    subtitle: 'Ejecución en set / exteriores',
    graphicSubtitle: 'Layouts, carousels y mockups',
    chronologyTag: 'Rodaje Activo',
    colorClass: 'border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-300',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    accentHex: '#f43f5e',
  },
  {
    id: 'post_produccion',
    macroPhase: 'post_produccion',
    title: '5. Post-Producción',
    graphicTitle: '5. Ajustes & Export',
    subtitle: 'Edición, Color grading & Audio',
    graphicSubtitle: 'Retoque y assets de salida',
    chronologyTag: 'Edición & VFX',
    colorClass: 'border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    accentHex: '#a855f7',
  },
  {
    id: 'aprobacion_cliente',
    macroPhase: 'post_produccion',
    title: '6. Aprobación Cliente',
    graphicTitle: '6. Aprobación Cliente',
    subtitle: 'Revisión (Regla ventana T-3)',
    graphicSubtitle: 'Revisión final de piezas',
    chronologyTag: 'Ventana T-3',
    colorClass: 'border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-300',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
    accentHex: '#14b8a6',
  },
  {
    id: 'publicado',
    macroPhase: 'post_produccion',
    title: '7. Publicado',
    graphicTitle: '7. Publicado / Live',
    subtitle: 'Distribución y master listo',
    graphicSubtitle: 'Listo para pauta y redes',
    chronologyTag: 'Finalizado',
    colorClass: 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    accentHex: '#10b981',
  },
];

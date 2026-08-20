import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileCode,
  Layers,
  Database,
  GitBranch,
  Table,
  Copy,
  Check,
  Download,
  Terminal,
  ShieldCheck,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { INITIAL_DATA_SNAPSHOT } from '../data/initialData';

export const SystemSpecsHub: React.FC = () => {
  const [activeSpecTab, setActiveSpecTab] = useState<'erd' | 'stateMachine' | 'apiDocs' | 'mockData'>('erd');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const erdMermaid = `erDiagram
    ORGANIZATION ||--o{ USER : contains
    ORGANIZATION ||--o{ BRAND : manages
    ORGANIZATION ||--o{ EQUIPMENT : owns
    
    BRAND ||--|{ COMMUNICATION_TERRITORY : "has at least 3"
    BRAND ||--o{ DIGITAL_ASSET : owns
    BRAND ||--o{ DELIVERABLE : commissions
    
    USER ||--o{ DELIVERABLE : creates_or_assigned
    USER ||--o{ EQUIPMENT_RESERVATION : reserves
    USER ||--o{ AUDIT_LOG : triggers
    
    DELIVERABLE ||--o{ EQUIPMENT_RESERVATION : requires
    DELIVERABLE ||--o{ CHANGE_REQUEST : has
    DELIVERABLE ||--|| TECHNICAL_GUIDE : specifies
    
    EQUIPMENT ||--o{ EQUIPMENT_RESERVATION : allocated_in

    USER {
        string id PK
        string email
        enum role "webadmin|director|colaborador|cliente"
        string roleTitle
        string quotaSlot "Cupo #1 | Cupo #2"
    }

    BRAND {
        string id PK
        string name
        string industry
        string primaryColor
        string contactEmail
    }

    COMMUNICATION_TERRITORY {
        string id PK
        string brandId FK
        string name
        string objective
        string[] contentPillars
        boolean active "Strict Rule >=3 Active"
    }

    DELIVERABLE {
        string id PK
        string code "e.g. CF-APX-001"
        string brandId FK
        string territoryId FK
        string assigneeId FK
        enum phase "ideacion|calendarizacion|guia_tecnica|produccion|post_produccion|aprobacion_cliente|publicado"
        enum priority "low|medium|high|urgent"
        date productionStartDate
        date productionEndDate
        date publishDate "Enforces T-3 Rule"
    }

    EQUIPMENT {
        string id PK
        string name
        string serialNumber
        enum category "camera|lens|audio|lighting|mobile_capture|editing_station"
        enum status "available|reserved|in_shoot|maintenance"
        number dailyRateUSD
    }

    EQUIPMENT_RESERVATION {
        string id PK
        string equipmentId FK
        string deliverableId FK
        date startDate
        date endDate
        string collisionChecksum
    }

    CHANGE_REQUEST {
        string id PK
        string deliverableId FK
        string requestedById FK
        number daysToPublishAtSubmission "T-3 calculation"
        enum status "submitted|approved|rejected|blocked_t3"
        number extraCostUSD
        number delayHours
    }`;

  const erdDbml = `// DBML Specification for CineFlow Studio OS

Table users {
  id varchar [pk]
  email varchar [unique, not null]
  name varchar [not null]
  role varchar [note: "webadmin | director | colaborador | cliente"]
  role_title varchar
  quota_slot varchar [note: "Cupo #1 o Cupo #2 para colaboradores demo"]
  created_at timestamp
}

Table brands {
  id varchar [pk]
  name varchar [not null]
  industry varchar
  primary_color varchar
  slogan varchar
  contact_person varchar
  contact_email varchar
}

Table communication_territories {
  id varchar [pk]
  brand_id varchar [ref: > brands.id]
  name varchar [not null]
  description text
  objective text
  content_pillars text[]
  target_audience text
  active boolean [default: true, note: "Business Rule: Min 3 active per brand"]
}

Table digital_assets {
  id varchar [pk]
  brand_id varchar [ref: > brands.id]
  name varchar
  type varchar [note: "website | mobile_app | landing_page | brand_guidelines | catalog | media_kit"]
  url varchar
  status varchar
}

Table hardware_equipment {
  id varchar [pk]
  name varchar [not null]
  category varchar [note: "camera | lens | audio | lighting | mobile_capture | editing_station"]
  model varchar
  serial_number varchar [unique]
  specs text
  status varchar [note: "available | reserved | in_shoot | maintenance"]
  daily_rate_usd numeric
}

Table equipment_reservations {
  id varchar [pk]
  equipment_id varchar [ref: > hardware_equipment.id]
  deliverable_id varchar [ref: > deliverables.id]
  start_date date [not null]
  end_date date [not null]
  reserved_by_id varchar [ref: > users.id]
  status varchar [note: "confirmed | cancelled"]
}

Table deliverables {
  id varchar [pk]
  code varchar [unique, not null]
  title varchar [not null]
  brand_id varchar [ref: > brands.id]
  territory_id varchar [ref: > communication_territories.id]
  assignee_id varchar [ref: > users.id]
  phase varchar [note: "ideacion | calendarizacion | guia_tecnica | produccion | post_produccion | aprobacion_cliente | publicado"]
  priority varchar [note: "low | medium | high | urgent"]
  production_start_date date
  production_end_date date
  publish_date date [note: "Baseline for T-3 change block"]
  concept_hook text
  description text
}

Table change_requests {
  id varchar [pk]
  deliverable_id varchar [ref: > deliverables.id]
  requested_by_id varchar [ref: > users.id]
  reason varchar
  description text
  days_to_publish_at_submission integer
  status varchar [note: "submitted | approved | rejected | blocked_t3"]
  director_override boolean [default: false]
  extra_cost_usd numeric
  delay_hours integer
}`;

  return (
    <div className="space-y-4">
      
      {/* Header - High Density */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <FileCode className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Especificaciones Técnicas & Arquitectura</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                DBML • ERD • State Machine • OpenAPI
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Modelo relacional, reglas cronológicas de negocio, máquina de transiciones y dataset inicial.
            </p>
          </div>
        </div>

        {/* Spec Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveSpecTab('erd')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeSpecTab === 'erd'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Diagrama ERD & DBML</span>
          </button>

          <button
            onClick={() => setActiveSpecTab('stateMachine')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeSpecTab === 'stateMachine'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Máquina de Estados & T-3</span>
          </button>

          <button
            onClick={() => setActiveSpecTab('apiDocs')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeSpecTab === 'apiDocs'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Contratos REST</span>
          </button>

          <button
            onClick={() => setActiveSpecTab('mockData')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeSpecTab === 'mockData'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Dataset (JSON)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DIAGRAMA ERD & DBML */}
      {activeSpecTab === 'erd' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Mermaid Schema Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Diagrama Entidad-Relación (Mermaid Format)</span>
                </h3>
                <button
                  onClick={() => handleCopy(erdMermaid, 'mermaid')}
                  className="flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded cursor-pointer"
                >
                  {copiedCode === 'mermaid' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'mermaid' ? 'Copiado' : 'Copiar Mermaid'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[440px] custom-scrollbar">
                {erdMermaid}
              </pre>
            </div>

            {/* DBML Schema Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Esquema Relacional en DBML</span>
                </h3>
                <button
                  onClick={() => handleCopy(erdDbml, 'dbml')}
                  className="flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded cursor-pointer"
                >
                  {copiedCode === 'dbml' ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'dbml' ? 'Copiado' : 'Copiar DBML'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto max-h-[440px] custom-scrollbar">
                {erdDbml}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: MÁQUINA DE ESTADOS Y TRANSICIONES */}
      {activeSpecTab === 'stateMachine' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-2xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Máquina de Estados & Matriz de Transiciones Cronológicas
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Eventos, disparadores cronológicos, condiciones de guarda y roles con permiso de transición.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[9px]">
                  <th className="p-2.5">Fase Origen ➔ Destino</th>
                  <th className="p-2.5">Ventana Cronológica</th>
                  <th className="p-2.5">Evento / Disparador</th>
                  <th className="p-2.5">Validación / Condición de Guarda</th>
                  <th className="p-2.5">Roles Autorizados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-blue-700">
                    Ideación ➔ Calendarización
                  </td>
                  <td className="p-2.5 font-mono text-slate-500 text-[11px]">Día 1 al 15</td>
                  <td className="p-2.5 text-[11px]">Aprobación de concepto narrativo y hook inicial</td>
                  <td className="p-2.5 text-slate-600 text-[11px]">
                    Marca con ≥ 3 territorios activos y territorio seleccionado.
                  </td>
                  <td className="p-2.5 font-semibold text-emerald-800 text-[11px]">
                    Cliente, Colaborador, Director
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-indigo-700">
                    Calendarización ➔ Guía Técnica
                  </td>
                  <td className="p-2.5 font-mono text-slate-500 text-[11px]">Día 15 al 20</td>
                  <td className="p-2.5 text-[11px]">Definición de fechas de rodaje y publicación</td>
                  <td className="p-2.5 text-slate-600 text-[11px]">
                    Fechas de producción y publicación válidas. Sin colisión de hardware.
                  </td>
                  <td className="p-2.5 font-semibold text-emerald-800 text-[11px]">
                    Colaborador, Director
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-amber-700">
                    Guía Técnica ➔ En Rodaje
                  </td>
                  <td className="p-2.5 font-mono text-slate-500 text-[11px]">Día 20 a Fin-5</td>
                  <td className="p-2.5 text-[11px]">Firma técnica y visto bueno de Dirección</td>
                  <td className="p-2.5 text-slate-600 text-[11px]">
                    Shotlist compilado, equipos reservados y Visto Bueno del Director.
                  </td>
                  <td className="p-2.5 font-semibold text-purple-800 text-[11px]">
                    Director de Proyecto, WebAdmin
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-rose-700">
                    En Rodaje ➔ Post-Producción
                  </td>
                  <td className="p-2.5 font-mono text-slate-500 text-[11px]">Ventana Rodaje</td>
                  <td className="p-2.5 text-[11px]">Cierre de rodaje e ingesta de metraje bruto (RAW/Log)</td>
                  <td className="p-2.5 text-slate-600 text-[11px]">
                    Liberación de hardware en inventario para otros rodajes.
                  </td>
                  <td className="p-2.5 font-semibold text-blue-800 text-[11px]">
                    Colaborador Audiovisual
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-purple-700">
                    Post-Producción ➔ Aprobación Cliente
                  </td>
                  <td className="p-2.5 font-mono text-slate-500 text-[11px]">Fin-5 a Fin-3</td>
                  <td className="p-2.5 text-[11px]">Exportación de corte preliminar (Rough Cut / Color)</td>
                  <td className="p-2.5 text-slate-600 text-[11px]">
                    Render en relaciones de aspecto especificadas (9:16, 16:9).
                  </td>
                  <td className="p-2.5 font-semibold text-blue-800 text-[11px]">
                    Colaborador, Director
                  </td>
                </tr>

                <tr className="hover:bg-red-50/50 bg-red-50/30 border-l-2 border-red-500">
                  <td className="p-2.5 font-bold text-red-700">
                    Aprobación Cliente (Ventana T-3)
                  </td>
                  <td className="p-2.5 font-mono text-red-700 font-bold text-[11px]">≤ 3 Días de Publicación</td>
                  <td className="p-2.5 text-[11px]">Solicitud de ajuste de último minuto por cliente</td>
                  <td className="p-2.5 text-red-900 text-[11px]">
                    <strong>REGLA T-3:</strong> Bloqueo automático. Requiere "Director Override" con sobrecosto y retraso en horas.
                  </td>
                  <td className="p-2.5 font-bold text-purple-800 text-[11px]">
                    Director (Override Exclusivo)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-emerald-700">
                    Aprobación ➔ Publicado
                  </td>
                  <td className="p-2.5 font-mono text-slate-500 text-[11px]">Fecha de Lanzamiento</td>
                  <td className="p-2.5 text-[11px]">Aprobación final del cliente o Director</td>
                  <td className="p-2.5 text-slate-600 text-[11px]">
                    Masters exportados en ProRes/H.265 y checklist de calidad cerrado.
                  </td>
                  <td className="p-2.5 font-semibold text-emerald-800 text-[11px]">
                    Cliente, Director, WebAdmin
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTRATOS DE API REST */}
      {activeSpecTab === 'apiDocs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            
            {/* Endpoint 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-[11px]">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">/api/gemini/ideate</span>
                <span className="text-[11px] text-slate-500 ml-auto font-medium">
                  Generación Co-creativa con Gemini
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Genera 3 propuestas narrativas completas con gancho de retención de 3 segundos basado en el territorio de comunicación.
              </p>
              <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto">
{`// Payload Request:
{
  "brandName": "Apex Athletics",
  "industry": "Indumentaria Deportiva de Alto Rendimiento",
  "brandTone": "Épico, enérgico y cinemático",
  "territory": "Rendimiento Extremo & Atletas Pro",
  "briefPrompt": "Spot de calzado Kinetic Aero"
}

// Response:
{
  "ideas": [
    {
      "title": "Apex Kinetic Aero - Desafío de la Gravedad",
      "hook": "¿Qué se siente correr a 30km/h en medio de la niebla?",
      "narrativeConcept": "Plano secuencia dinámico siguiendo...",
      "visualStyle": "Alto contraste, color grading frío...",
      "audioDesign": "Sonido de respiración rítmica y drop musical...",
      "format": "Video Vertical 9:16 UHD"
    }
  ]
}`}
              </pre>
            </div>

            {/* Endpoint 2 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-[11px]">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">/api/gemini/technical-guide</span>
                <span className="text-[11px] text-slate-500 ml-auto font-medium">
                  Compilación de Guía Técnica Audiovisual
                </span>
              </div>
              <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`// Payload Request:
{
  "deliverable": { "title": "Lumina Skin Glow", "format": "9:16 UHD", ... },
  "styleNotes": "Estilo macro anamórfico, iluminación key suave..."
}

// Response:
{
  "aspectRatios": ["9:16", "4:5"],
  "frameRate": "60fps slow-motion",
  "colorSpace": "Apple Log ProRes 422HQ",
  "audioSpecs": "Audio 32-bit Float (-18dB target)",
  "lightingScheme": "Difusor de 120cm + Rim Light 3200K cálido",
  "shotlist": [
    {
      "shotNumber": 1,
      "description": "Macro a gota de serum cayendo en pómulo",
      "cameraAngle": "Extreme Close-Up Macro",
      "movement": "Push-in lento",
      "durationSec": 3,
      "audioNote": "ASMR nítido de apertura"
    }
  ]
}`}
              </pre>
            </div>

            {/* Endpoint 3 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-[11px]">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">/api/gemini/evaluate-change</span>
                <span className="text-[11px] text-slate-500 ml-auto font-medium">
                  Evaluador de Regla de Ventana T-3
                </span>
              </div>
              <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-amber-300 overflow-x-auto">
{`// Payload Request:
{
  "deliverable": { "id": "del-1", "publishDate": "2026-08-19" },
  "changeRequestDescription": "Cambiar toda la música y reeditar el segundo acto",
  "daysToPublish": 2
}

// Response:
{
  "verdict": "blocked_t3_override_required",
  "incursTMinus3Penalty": true,
  "estimatedDelayHours": 36,
  "additionalCostUSD": 450,
  "riskAssessment": "Alto riesgo de retrasar el estreno oficial de la marca.",
  "directorRationale": "Solicitud recibida a T-2 días. Reedición exige desarmar timeline y nuevo render."
}`}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: MOCK DATASET INICIAL (JSON) */}
      {activeSpecTab === 'mockData' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Dataset Inicial de Demostración Completo
              </h3>
              <p className="text-[11px] text-slate-500">
                1 Director de Proyecto, 2 Colaboradores con cupos, 6 Clientes/Marcas con ≥3 territorios, inventario de hardware y 12 entregables.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(JSON.stringify(INITIAL_DATA_SNAPSHOT, null, 2), 'mockJson')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                {copiedCode === 'mockJson' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'mockJson' ? 'Copiado' : 'Copiar JSON'}</span>
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(INITIAL_DATA_SNAPSHOT, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'cineflow-dataset.json';
                  a.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Dataset</span>
              </button>
            </div>
          </div>

          <pre className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-[460px] custom-scrollbar">
            {JSON.stringify(INITIAL_DATA_SNAPSHOT, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};

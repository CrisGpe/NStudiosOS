export type UserRole = 'webadmin' | 'director' | 'colaborador' | 'cliente';

export type NavigationPosition = 'topbar' | 'sidebar';
export type ThemePalette = 'light-density' | 'nataraja-dark' | 'midnight-slate' | 'cyber-cinema';

export interface CollaboratorSchedule {
  workDays: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
  startHour: string; // '09:00'
  endHour: string; // '18:00'
  isOnVacation: boolean;
  alertsEnabled: boolean;
  vacationNotes?: string;
}

export interface UserPreferences {
  navPosition: NavigationPosition;
  theme: ThemePalette;
  compactCards: boolean;
  enableNotifications: boolean;
  defaultView?: 'kanban' | 'calendar' | 'campaigns' | 'brands' | 'equipment' | 'drive' | 'brand_hub';
  kanbanViewMode?: 'toggle_pipeline' | 'unified_macro_phases';
  kanbanTypeFilter?: 'all' | 'audiovisual' | 'graphic';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  assignedBrandIds?: string[]; // If cliente or specific manager
  quotaSlot?: string; // e.g. "Cupo 1/2 Colaborador Demo"
  preferences?: UserPreferences;
  schedule?: CollaboratorSchedule;
}

export interface Brand {
  id: string;
  name: string;
  industry: string;
  logo: string;
  primaryColor: string;
  secondaryColor?: string;
  slogan: string;
  contactPerson: string;
  contactEmail: string;
  driveFolderId?: string;
  driveFilesCount?: number;
  createdAt: string;
}

export interface CommunicationTerritory {
  id: string;
  brandId: string;
  name: string;
  description: string;
  objective: string;
  contentPillars: string[];
  targetAudience: string;
  active: boolean;
  colorTag: string;
}

export type AssetType =
  | 'website'
  | 'mobile_app'
  | 'landing_page'
  | 'catalog'
  | 'brand_guidelines'
  | 'media_kit'
  | 'social_channel';

export interface DigitalAsset {
  id: string;
  brandId: string;
  name: string;
  type: AssetType;
  url: string;
  status: 'active' | 'under_review' | 'deprecated';
  notes?: string;
  updatedAt: string;
}

export type EquipmentCategory =
  | 'camera'
  | 'lens'
  | 'audio'
  | 'lighting'
  | 'mobile_capture'
  | 'editing_station';

export type EquipmentStatus = 'available' | 'reserved' | 'in_shoot' | 'maintenance';

export interface HardwareEquipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  specs: string;
  dailyRateUSD: number;
  image: string;
  currentReservationId?: string;
}

export interface EquipmentReservation {
  id: string;
  equipmentId: string;
  deliverableId: string;
  deliverableTitle: string;
  brandName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reservedById: string;
  reservedByName: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export type DeliverablePhase =
  | 'ideacion' // Day 1-15
  | 'calendarizacion' // Day 15-20
  | 'guia_tecnica' // Day 20 to T-5
  | 'produccion' // Rodaje
  | 'post_produccion' // Edición / Color / Audio
  | 'aprobacion_cliente' // Revisión final cliente
  | 'publicado' // Lanzado
  | 'cancelado';

export type DeliverablePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ShotItem {
  shotNumber: number;
  description: string;
  cameraAngle: string;
  movement: string;
  durationSec: number;
  audioNote?: string;
}

export interface TechnicalGuide {
  aspectRatios: string[]; // e.g. ["9:16", "1:1", "16:9"]
  frameRate: string; // "24fps" | "60fps" | "120fps"
  colorSpace: string; // "S-Log3 / S-Gamut3.Cine"
  audioSpecs: string;
  lightingScheme: string;
  shotlist: ShotItem[];
  equipmentList: string[];
  exportTargets: string[];
  directorSignOff?: {
    approved: boolean;
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  };
}

export interface ChangeRequest {
  id: string;
  requestedAt: string;
  requestedByRole: UserRole;
  requestedByName: string;
  title: string;
  description: string;
  category: 'script' | 'visual' | 'audio' | 'schedule' | 'gear';
  isWithinTMinus3: boolean; // True if requested <= 3 days before publish date
  status: 'submitted' | 'approved' | 'rejected' | 'director_override' | 'blocked_t3';
  directorNotes?: string;
  costImpactUSD?: number;
  delayHours?: number;
  reason?: string;
  daysToPublishAtSubmission?: number;
}

export type DeliverableType = 'audiovisual' | 'graphic';

export type CampaignStatus = 'planning' | 'active' | 'completed' | 'paused';

export type CampaignType =
  | 'brand_awareness'
  | 'performance_paid_ads'
  | 'ecommerce_launch'
  | 'lead_generation';

export interface CampaignKPI {
  id: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
}

export interface Campaign {
  id: string;
  code: string;
  brandId: string;
  name: string;
  description: string;
  objective: string;
  campaignType: CampaignType;
  startDate: string;
  endDate: string;
  budgetUSD: number;
  spentUSD?: number;
  productionBudgetUSD?: number;
  adSpendUSD?: number;
  targetROAS?: number;
  targetCPAUSD?: number;
  adChannels?: string[]; // e.g. ['Meta Ads', 'Google Ads', 'TikTok Ads']
  status: CampaignStatus;
  deliverableIds: string[];
  kpis: CampaignKPI[];
  driveFolderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  code: string;
  title: string;
  brandId: string;
  campaignId?: string;
  territoryId: string;
  assigneeId: string;
  deliverableType?: DeliverableType; // 'audiovisual' | 'graphic'
  phase: DeliverablePhase;
  priority: DeliverablePriority;
  format: string;
  conceptHook?: string;
  description: string;
  
  productionStartDate: string;
  productionEndDate: string;
  publishDate: string;
  
  technicalGuide: TechnicalGuide;
  equipmentReservedIds: string[];
  assetsLinked: string[];
  
  changeRequests: ChangeRequest[];
  clientApproved: boolean;
  directorApproved: boolean;
  
  driveFolderId?: string;
  driveFilesCount?: number;
  firstDeliveryDriveUrl?: string; // Direct link to preview/folder in Drive Vault
  
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'deliverable' | 'equipment' | 'territory' | 'brand' | 'system' | 'drive';
  entityId: string;
  details: string;
  entity?: string;
  performedBy?: string;
  metadata?: Record<string, any>;
}

/* ========================================================
   GOOGLE DRIVE MULTI-ACCOUNT & MEDIA VAULT TYPES
   ======================================================== */

export interface DriveAccount {
  id: string;
  name: string;
  type: 'corporate_workspace' | 'personal_vault';
  email: string;
  rootFolderId: string;
  quotaTotalGB: number;
  quotaUsedGB: number;
  isConnected: boolean;
  status: 'active' | 'syncing' | 'error';
  lastSyncedAt: string;
  serviceAccountEmail?: string;
  sharedDriveName?: string;
}

export interface DriveFolder {
  id: string;
  accountId: string;
  brandId?: string;
  campaignId?: string;
  deliverableId?: string;
  parentFolderId?: string;
  name: string;
  path: string;
  isSystemGenerated: boolean;
  itemCount: number;
  createdAt: string;
}

export type DriveFileType = 'video' | 'audio' | 'image' | 'document' | 'archive';

export interface GeneratedDocumentSection {
  title: string;
  content: string;
  tableData?: { headers: string[]; rows: string[][] };
}

export interface GeneratedDocument {
  id: string;
  type: 'brand_manual' | 'digital_assets_inventory' | 'equipment_sla';
  brandId: string;
  title: string;
  subtitle: string;
  version: string;
  generatedAt: string;
  sections: GeneratedDocumentSection[];
  exportUrlGoogleDocs?: string;
}

export interface DriveFileTechnicalSpecs {
  resolution?: string; // e.g. "3840x2160 (4K DCI)"
  codec?: string; // e.g. "Apple ProRes 422 HQ" or "H.264 High@L5.1"
  frameRate?: string; // e.g. "23.976 fps"
  audioSpecs?: string; // e.g. "24-bit 48kHz Stereo / 32-bit Float"
  duration?: string; // e.g. "00:00:30:12"
  colorSpace?: string; // e.g. "Rec.709 / S-Log3"
  bitrate?: string; // e.g. "150 Mbps"
}

export interface DriveFile {
  id: string;
  accountId: string;
  folderId: string;
  brandId: string;
  campaignId?: string;
  deliverableId?: string;
  name: string;
  type: DriveFileType;
  mimeType: string;
  sizeFormatted: string; // e.g. "1.85 GB"
  sizeBytes: number;
  url: string; // Google Drive Web View URL
  previewUrl?: string; // Direct stream or embed preview
  proxyUrl?: string; // Lightweight 1080p proxy
  isOriginalMaster?: boolean;
  technicalSpecs?: DriveFileTechnicalSpecs;
  generatedDocument?: GeneratedDocument;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

/* ========================================================
   CLIENT SANDBOX & CO-CREATION TYPES
   ======================================================== */

export type MobileCaptureType = 'social_link' | 'camera_photo' | 'quick_note' | 'voice_memo';

export interface ClientIdeaSandboxItem {
  id: string;
  brandId: string;
  title: string;
  notes: string;
  referenceUrls: string[];
  targetTerritoryId?: string;
  formatSuggested?: string;
  captureType?: MobileCaptureType;
  sourcePlatform?: 'tiktok' | 'instagram' | 'pinterest' | 'youtube' | 'facebook' | 'camera' | 'voice' | 'manual';
  attachmentUrl?: string;
  audioDurationSeconds?: number;
  status: 'draft' | 'converted_to_deliverable';
  convertedDeliverableId?: string;
  aiGeneratedBrief?: {
    hook: string;
    narrativeAngle: string;
    suggestedDuration: string;
    recommendedPlatforms: string[];
  };
  createdAt: string;
  updatedAt: string;
}

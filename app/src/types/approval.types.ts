/**
 * Approval Workflow Types - CONSAR Compliance
 *
 * Type definitions for multi-level approval workflow with SLA tracking
 * Complies with Maker-Checker principle and CONSAR regulatory requirements
 */

// ============================================
// ENUMS
// ============================================

/**
 * Approval levels based on organizational hierarchy
 * Level 0: Auto-validation (system)
 * Level 1: Analyst
 * Level 2: Supervisor
 * Level 3: Manager
 * Level 4: Director
 */
export enum ApprovalLevel {
  AUTO = 0,
  ANALYST = 1,
  SUPERVISOR = 2,
  MANAGER = 3,
  DIRECTOR = 4,
}

/**
 * Status of approval request
 */
export enum ApprovalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  ESCALATED = 'escalated',
  ON_HOLD = 'on_hold',
}

/**
 * SLA status indicators
 */
export enum SLAStatus {
  ON_TIME = 'on_time', // Green: < 50% of SLA time used
  WARNING = 'warning', // Yellow: 50-75% of SLA time used
  CRITICAL = 'critical', // Orange: 75-90% of SLA time used
  BREACHED = 'breached', // Red: > 90% of SLA time used or expired
}

/**
 * Action types in approval workflow
 */
export enum ApprovalAction {
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_INFO = 'request_info',
  PROVIDE_INFO = 'provide_info',
  ESCALATE = 'escalate',
  CANCEL = 'cancel',
  REASSIGN = 'reassign',
}

/**
 * Priority levels for approval requests
 */
export enum ApprovalPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// ============================================
// INTERFACES
// ============================================

/**
 * User performing approval actions
 */
export interface ApprovalUser {
  id: string
  name: string
  email: string
  role: string
  level: ApprovalLevel
  department?: string
  avatar?: string
}

/**
 * SLA configuration for each approval level
 */
export interface SLAConfiguration {
  level: ApprovalLevel
  maxDurationMinutes: number // Maximum time allowed for this level
  warningThresholdPercent: number // When to show warning (default: 75%)
  criticalThresholdPercent: number // When to show critical (default: 90%)
  autoEscalate: boolean // Auto-escalate if SLA breached
  escalateToLevel?: ApprovalLevel // Which level to escalate to
  businessHoursOnly: boolean // Count only business hours (8am-6pm, Mon-Fri)
}

/**
 * Approval stage in the workflow
 */
export interface ApprovalStage {
  id: string
  level: ApprovalLevel
  status: ApprovalStatus
  slaStatus: SLAStatus
  assignedTo: ApprovalUser[]
  currentApprover?: ApprovalUser
  startedAt?: string // ISO timestamp
  completedAt?: string // ISO timestamp
  durationMinutes?: number
  slaConfig: SLAConfiguration
  requiredApprovals: number // How many approvals needed (for maker-checker)
  currentApprovals: number
  comments?: ApprovalComment[]
}

/**
 * Comment or justification in approval workflow
 */
export interface ApprovalComment {
  id: string
  author: ApprovalUser
  action: ApprovalAction
  message: string
  timestamp: string // ISO timestamp
  attachments?: ApprovalAttachment[]
  isSystemGenerated: boolean
}

/**
 * Attachment in approval workflow
 */
export interface ApprovalAttachment {
  id: string
  filename: string
  filesize: number
  mimeType: string
  url: string
  uploadedBy: ApprovalUser
  uploadedAt: string // ISO timestamp
}

/**
 * Complete approval workflow for a validation file
 */
export interface ApprovalWorkflow {
  id: string
  fileId: string
  fileName: string
  fileType: string // NOMINA, CONTABLE, REGULARIZACION
  afore: string
  priority: ApprovalPriority
  status: ApprovalStatus
  currentLevel: ApprovalLevel
  stages: ApprovalStage[]
  submittedBy: ApprovalUser
  submittedAt: string // ISO timestamp
  completedAt?: string // ISO timestamp
  totalDurationMinutes?: number
  overallSLAStatus: SLAStatus
  metadata: ApprovalMetadata
  history: ApprovalHistoryEntry[]
}

/**
 * Metadata for approval workflow
 */
export interface ApprovalMetadata {
  totalRecords: number
  totalErrors: number
  totalWarnings: number
  criticalErrors: number
  validationScore: number // 0-100
  complianceStatus: 'compliant' | 'non_compliant' | 'pending'
  tags?: string[]
  customFields?: Record<string, unknown>
}

/**
 * History entry for approval actions
 */
export interface ApprovalHistoryEntry {
  id: string
  timestamp: string // ISO timestamp
  action: ApprovalAction
  level: ApprovalLevel
  performedBy: ApprovalUser
  fromStatus: ApprovalStatus
  toStatus: ApprovalStatus
  comment?: string
  metadata?: Record<string, unknown>
}

/**
 * Approval configuration for organization
 */
export interface ApprovalConfiguration {
  id: string
  organizationId: string
  name: string
  description: string
  isActive: boolean
  fileTypes: string[] // Which file types this config applies to
  levels: SLAConfiguration[]
  makerCheckerEnabled: boolean
  minApproversPerLevel: number
  allowParallelApprovals: boolean
  allowSkipLevels: boolean
  autoApproveThreshold?: number // Auto-approve if validation score >= this
  createdAt: string
  updatedAt: string
  createdBy: ApprovalUser
}

/**
 * Approval statistics and metrics
 */
export interface ApprovalMetrics {
  organizationId: string
  period: {
    from: string
    to: string
  }
  totalRequests: number
  approvedRequests: number
  rejectedRequests: number
  cancelledRequests: number
  pendingRequests: number
  averageApprovalTimeMinutes: number
  averageTimePerLevel: Record<ApprovalLevel, number>
  slaComplianceRate: number // Percentage
  breachedSLAs: number
  approvalRate: number // Percentage of approved requests
  rejectionRate: number // Percentage of rejected requests
  byPriority: Record<ApprovalPriority, number>
  byFileType: Record<string, number>
  topApprovers: Array<{
    user: ApprovalUser
    totalApprovals: number
    averageTimeMinutes: number
  }>
}

/**
 * Notification for approval workflow
 */
export interface ApprovalNotification {
  id: string
  workflowId: string
  type: 'assignment' | 'reminder' | 'escalation' | 'completion' | 'sla_warning'
  recipients: ApprovalUser[]
  subject: string
  message: string
  priority: ApprovalPriority
  sentAt: string
  read: boolean
  actionUrl?: string
}

/**
 * Bulk approval request
 */
export interface BulkApprovalRequest {
  workflowIds: string[]
  action: ApprovalAction
  comment: string
  performedBy: ApprovalUser
  timestamp: string
}

/**
 * Delegation configuration
 */
export interface ApprovalDelegation {
  id: string
  delegator: ApprovalUser
  delegate: ApprovalUser
  startDate: string
  endDate: string
  levels: ApprovalLevel[]
  isActive: boolean
  reason?: string
}

// ============================================
// TYPE GUARDS
// ============================================

export function isApprovalPending(status: ApprovalStatus): boolean {
  return status === ApprovalStatus.PENDING || status === ApprovalStatus.IN_PROGRESS
}

export function isApprovalCompleted(status: ApprovalStatus): boolean {
  return (
    status === ApprovalStatus.APPROVED ||
    status === ApprovalStatus.REJECTED ||
    status === ApprovalStatus.CANCELLED
  )
}

export function isSLABreached(status: SLAStatus): boolean {
  return status === SLAStatus.BREACHED
}

export function isSLACritical(status: SLAStatus): boolean {
  return status === SLAStatus.CRITICAL || status === SLAStatus.BREACHED
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Filters for approval workflow queries
 */
export interface ApprovalFilters {
  status?: ApprovalStatus[]
  level?: ApprovalLevel[]
  priority?: ApprovalPriority[]
  fileType?: string[]
  afore?: string[]
  assignedToUserId?: string
  submittedByUserId?: string
  dateFrom?: string
  dateTo?: string
  slaStatus?: SLAStatus[]
  search?: string
}

/**
 * Sorting options for approval workflows
 */
export interface ApprovalSort {
  field: 'submittedAt' | 'priority' | 'slaStatus' | 'fileName' | 'status'
  order: 'asc' | 'desc'
}

/**
 * Pagination for approval workflows
 */
export interface ApprovalPagination {
  page: number
  pageSize: number
  total: number
}

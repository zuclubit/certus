/**
 * Compliance Portal Type Definitions
 *
 * Comprehensive types for GRC (Governance, Risk, Compliance) functionality
 * Based on SOC 2 Type II, ISO 27001:2022, NIST CSF 2.0, and CONSAR requirements
 *
 * @version 1.0.0
 * @compliance SOC 2 Type II, ISO 27001:2022, NIST CSF 2.0
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type ComplianceFramework =
  | 'SOC2'
  | 'ISO27001'
  | 'NIST_CSF'
  | 'CIS_V8'
  | 'CONSAR'
  | 'CNBV'
  | 'GDPR'
  | 'LFPDPPP'
  | 'PCI_DSS'

export type ControlStatus =
  | 'not_implemented'
  | 'in_progress'
  | 'implemented'
  | 'not_applicable'
  | 'failed'

export type ControlEffectiveness =
  | 'not_tested'
  | 'ineffective'
  | 'partially_effective'
  | 'effective'

export type EvidenceStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'

export type EvidenceType =
  | 'document'
  | 'screenshot'
  | 'log'
  | 'configuration'
  | 'policy'
  | 'procedure'
  | 'certificate'
  | 'report'
  | 'other'

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type RiskStatus =
  | 'identified'
  | 'assessed'
  | 'mitigating'
  | 'mitigated'
  | 'accepted'
  | 'closed'

export type RiskCategory =
  | 'security'
  | 'operational'
  | 'compliance'
  | 'financial'
  | 'reputational'
  | 'strategic'
  | 'technology'

export type AuditStatus =
  | 'planned'
  | 'in_progress'
  | 'fieldwork'
  | 'review'
  | 'completed'
  | 'cancelled'

export type AuditType =
  | 'internal'
  | 'external'
  | 'certification'
  | 'surveillance'
  | 'special'

export type FindingSeverity = 'critical' | 'major' | 'minor' | 'observation'

export type FindingStatus =
  | 'open'
  | 'in_remediation'
  | 'pending_verification'
  | 'closed'
  | 'risk_accepted'

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'

export type PolicyStatus = 'draft' | 'pending_approval' | 'approved' | 'retired'

// ============================================================================
// FRAMEWORK TYPES
// ============================================================================

export interface Framework {
  id: string
  code: ComplianceFramework
  name: string
  version: string
  description: string
  isActive: boolean
  totalControls: number
  implementedControls: number
  inProgressControls: number
  notImplementedControls: number
  notApplicableControls: number
  complianceScore: number
  lastAssessmentDate?: string
  nextAssessmentDate?: string
  certificationDate?: string
  certificationExpiry?: string
  categories: FrameworkCategory[]
  metadata?: Record<string, unknown>
}

export interface FrameworkCategory {
  id: string
  code: string
  name: string
  description: string
  order: number
  controlCount: number
  complianceScore: number
}

export interface FrameworkRequirement {
  id: string
  frameworkId: string
  code: string
  name: string
  description: string
  category: string
  subcategory?: string
  guidance?: string
  mappedControls: string[]
}

// ============================================================================
// CONTROL TYPES
// ============================================================================

export interface Control {
  id: string
  code: string
  name: string
  description: string
  objective: string
  frameworkId: string
  frameworkCode: ComplianceFramework
  categoryId: string
  categoryName: string
  status: ControlStatus
  effectiveness: ControlEffectiveness
  implementationNotes?: string
  owner: ControlOwner
  frequency: ControlFrequency
  testingFrequency: TestingFrequency
  lastTestedDate?: string
  nextTestDate?: string
  evidenceCount: number
  riskCount: number
  findingCount: number
  automationLevel: 'manual' | 'semi_automated' | 'fully_automated'
  tags: string[]
  mappedRequirements: string[]
  relatedControls: string[]
  createdAt: string
  updatedAt: string
}

export interface ControlOwner {
  id: string
  name: string
  email: string
  department: string
}

export type ControlFrequency =
  | 'continuous'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'on_demand'

export type TestingFrequency =
  | 'continuous'
  | 'monthly'
  | 'quarterly'
  | 'semi_annually'
  | 'annually'

export interface ControlTest {
  id: string
  controlId: string
  testDate: string
  tester: string
  result: ControlEffectiveness
  findings: string
  evidenceIds: string[]
  nextTestDate: string
}

export interface ControlActivity {
  id: string
  controlId: string
  type: 'status_change' | 'evidence_added' | 'test_performed' | 'comment' | 'owner_changed'
  description: string
  user: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// ============================================================================
// EVIDENCE TYPES
// ============================================================================

export interface Evidence {
  id: string
  name: string
  description: string
  type: EvidenceType
  status: EvidenceStatus
  controlIds: string[]
  frameworkIds: ComplianceFramework[]
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl?: string
  uploadedBy: string
  uploadedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  validFrom: string
  validUntil: string
  isExpired: boolean
  expiresInDays: number
  tags: string[]
  version: number
  previousVersionId?: string
  metadata?: Record<string, unknown>
}

export interface EvidenceRequest {
  id: string
  controlId: string
  controlName: string
  evidenceType: EvidenceType
  description: string
  requestedBy: string
  requestedAt: string
  dueDate: string
  assignedTo: string
  status: 'pending' | 'submitted' | 'overdue'
  priority: TaskPriority
}

export interface EvidenceCollection {
  id: string
  name: string
  description: string
  auditId?: string
  frameworkId?: string
  evidenceIds: string[]
  createdBy: string
  createdAt: string
  status: 'draft' | 'finalized'
}

// ============================================================================
// RISK TYPES
// ============================================================================

export interface Risk {
  id: string
  title: string
  description: string
  category: RiskCategory
  status: RiskStatus
  inherentSeverity: RiskSeverity
  residualSeverity: RiskSeverity
  likelihood: 1 | 2 | 3 | 4 | 5
  impact: 1 | 2 | 3 | 4 | 5
  inherentScore: number
  residualScore: number
  owner: string
  ownerEmail: string
  department: string
  identifiedDate: string
  identifiedBy: string
  dueDate?: string
  mitigationPlan?: string
  mitigationProgress: number
  relatedControls: string[]
  relatedAssets: string[]
  treatmentStrategy: 'mitigate' | 'accept' | 'transfer' | 'avoid'
  acceptanceJustification?: string
  acceptedBy?: string
  acceptedDate?: string
  reviewFrequency: 'monthly' | 'quarterly' | 'annually'
  lastReviewDate?: string
  nextReviewDate?: string
  tags: string[]
  attachments: string[]
  comments: RiskComment[]
  history: RiskHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export interface RiskComment {
  id: string
  author: string
  content: string
  timestamp: string
}

export interface RiskHistoryEntry {
  id: string
  field: string
  oldValue: string
  newValue: string
  changedBy: string
  changedAt: string
  reason?: string
}

export interface RiskMatrix {
  likelihood: number
  impact: number
  count: number
  risks: string[]
}

export interface RiskMetrics {
  total: number
  bySeverity: Record<RiskSeverity, number>
  byStatus: Record<RiskStatus, number>
  byCategory: Record<RiskCategory, number>
  overdueCount: number
  avgMitigationProgress: number
  riskTrend: { date: string; count: number; avgScore: number }[]
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export interface Audit {
  id: string
  name: string
  description: string
  type: AuditType
  status: AuditStatus
  frameworkIds: ComplianceFramework[]
  scope: string
  objectives: string[]
  auditorFirm?: string
  leadAuditor: string
  auditTeam: string[]
  internalContact: string
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  fieldworkStartDate?: string
  fieldworkEndDate?: string
  reportDueDate?: string
  reportIssuedDate?: string
  findingsCount: number
  criticalFindings: number
  majorFindings: number
  minorFindings: number
  observations: number
  controlsTested: number
  evidenceRequested: number
  evidenceProvided: number
  budget?: number
  actualCost?: number
  reportUrl?: string
  notes?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface AuditFinding {
  id: string
  auditId: string
  controlId?: string
  title: string
  description: string
  severity: FindingSeverity
  status: FindingStatus
  rootCause?: string
  recommendation: string
  managementResponse?: string
  responsiblePerson: string
  dueDate: string
  completedDate?: string
  verifiedBy?: string
  verifiedDate?: string
  evidence: string[]
  comments: FindingComment[]
  history: FindingHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export interface FindingComment {
  id: string
  author: string
  content: string
  timestamp: string
  isInternal: boolean
}

export interface FindingHistoryEntry {
  id: string
  field: string
  oldValue: string
  newValue: string
  changedBy: string
  changedAt: string
}

export interface AuditSchedule {
  id: string
  auditId?: string
  name: string
  type: AuditType
  frameworkId: ComplianceFramework
  frequency: 'quarterly' | 'semi_annually' | 'annually' | 'biannually'
  nextScheduledDate: string
  lastCompletedDate?: string
  isActive: boolean
}

// ============================================================================
// TASK TYPES
// ============================================================================

export interface ComplianceTask {
  id: string
  title: string
  description: string
  type: 'evidence_collection' | 'control_review' | 'risk_assessment' | 'audit_prep' | 'remediation' | 'policy_review' | 'training' | 'other'
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string
  assignedToEmail: string
  assignedBy: string
  relatedControlId?: string
  relatedControlName?: string
  relatedRiskId?: string
  relatedAuditId?: string
  relatedEvidenceId?: string
  frameworkId?: ComplianceFramework
  dueDate: string
  completedDate?: string
  estimatedHours?: number
  actualHours?: number
  notes?: string
  attachments: string[]
  checklist: TaskChecklistItem[]
  reminders: TaskReminder[]
  createdAt: string
  updatedAt: string
}

export interface TaskChecklistItem {
  id: string
  text: string
  isCompleted: boolean
  completedAt?: string
  completedBy?: string
}

export interface TaskReminder {
  id: string
  daysBefore: number
  sent: boolean
  sentAt?: string
}

export interface TaskMetrics {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  completionRate: number
  avgCompletionTime: number
  byPriority: Record<TaskPriority, number>
  byType: Record<string, number>
  upcomingDeadlines: { date: string; count: number }[]
}

// ============================================================================
// POLICY TYPES
// ============================================================================

export interface Policy {
  id: string
  code: string
  title: string
  description: string
  category: string
  status: PolicyStatus
  version: string
  effectiveDate?: string
  reviewDate?: string
  nextReviewDate?: string
  owner: string
  ownerEmail: string
  approver?: string
  approvedDate?: string
  documentUrl?: string
  relatedControls: string[]
  relatedFrameworks: ComplianceFramework[]
  tags: string[]
  acknowledgements: PolicyAcknowledgement[]
  history: PolicyVersion[]
  createdAt: string
  updatedAt: string
}

export interface PolicyAcknowledgement {
  userId: string
  userName: string
  acknowledgedAt: string
  version: string
}

export interface PolicyVersion {
  version: string
  changes: string
  changedBy: string
  changedAt: string
  documentUrl?: string
}

// ============================================================================
// DASHBOARD & METRICS TYPES
// ============================================================================

export interface ComplianceDashboard {
  overallScore: number
  scoreChange: number
  frameworkScores: FrameworkScore[]
  controlsOverview: ControlsOverview
  risksOverview: RisksOverview
  tasksOverview: TasksOverview
  auditsOverview: AuditsOverview
  evidenceOverview: EvidenceOverview
  recentActivity: ComplianceActivity[]
  upcomingDeadlines: UpcomingDeadline[]
  alerts: ComplianceAlert[]
}

export interface FrameworkScore {
  framework: ComplianceFramework
  name: string
  score: number
  previousScore: number
  change: number
  status: 'on_track' | 'at_risk' | 'behind'
  controlsTotal: number
  controlsImplemented: number
}

export interface ControlsOverview {
  total: number
  implemented: number
  inProgress: number
  notImplemented: number
  notApplicable: number
  failed: number
  effectivenessRate: number
  testingCoverage: number
}

export interface RisksOverview {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  overdue: number
  avgScore: number
  mitigationRate: number
}

export interface TasksOverview {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  dueThisWeek: number
  completionRate: number
}

export interface AuditsOverview {
  planned: number
  inProgress: number
  completed: number
  openFindings: number
  criticalFindings: number
  upcomingAudits: { name: string; date: string; type: AuditType }[]
}

export interface EvidenceOverview {
  total: number
  approved: number
  pending: number
  expired: number
  expiringThisMonth: number
  collectionRate: number
}

export interface ComplianceActivity {
  id: string
  type: 'control' | 'evidence' | 'risk' | 'audit' | 'task' | 'policy'
  action: string
  description: string
  user: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface UpcomingDeadline {
  id: string
  type: 'task' | 'evidence' | 'audit' | 'risk_review' | 'policy_review'
  title: string
  dueDate: string
  daysUntilDue: number
  priority: TaskPriority
  assignedTo?: string
}

export interface ComplianceAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  link?: string
  dismissible: boolean
  createdAt: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ComplianceApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface CompliancePaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

export interface ControlFilters {
  search?: string
  frameworkId?: ComplianceFramework
  categoryId?: string
  status?: ControlStatus[]
  effectiveness?: ControlEffectiveness[]
  owner?: string
  tags?: string[]
}

export interface RiskFilters {
  search?: string
  category?: RiskCategory[]
  status?: RiskStatus[]
  severity?: RiskSeverity[]
  owner?: string
  department?: string
  overdue?: boolean
}

export interface EvidenceFilters {
  search?: string
  type?: EvidenceType[]
  status?: EvidenceStatus[]
  controlId?: string
  frameworkId?: ComplianceFramework
  expired?: boolean
  expiringWithinDays?: number
}

export interface TaskFilters {
  search?: string
  type?: string[]
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignedTo?: string
  frameworkId?: ComplianceFramework
  overdue?: boolean
  dueDateFrom?: string
  dueDateTo?: string
}

export interface AuditFilters {
  search?: string
  type?: AuditType[]
  status?: AuditStatus[]
  frameworkId?: ComplianceFramework
  year?: number
}

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: string
  direction: SortDirection
}

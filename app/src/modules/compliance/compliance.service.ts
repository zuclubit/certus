/**
 * Compliance Service
 *
 * Service layer for compliance operations using Certus API v1
 * All services use apiClient for authenticated API calls
 *
 * @version 2.1.0
 * @updated Integrated with API_ENDPOINTS constants
 */

import type {
  Framework,
  Control,
  Evidence,
  Risk,
  Audit,
  AuditFinding,
  ComplianceTask,
  Policy,
  ComplianceDashboard,
  ComplianceApiResponse,
  CompliancePaginatedResponse,
  ControlFilters,
  RiskFilters,
  EvidenceFilters,
  TaskFilters,
  AuditFilters,
  TaskMetrics,
  RiskMetrics,
  SortConfig,
  ControlStatus,
  EvidenceStatus,
  RiskStatus,
  TaskStatus,
} from '@/types/compliance.types'

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'

// ============================================================================
// FRAMEWORK SERVICE
// ============================================================================

export const FrameworkService = {
  async getAll(): Promise<ComplianceApiResponse<Framework[]>> {
    const response = await apiClient.get<Framework[]>(API_ENDPOINTS.COMPLIANCE.FRAMEWORKS)
    return { success: true, data: response.data }
  },

  async getById(id: string): Promise<ComplianceApiResponse<Framework>> {
    const response = await apiClient.get<Framework>(API_ENDPOINTS.COMPLIANCE.FRAMEWORK_DETAIL(id))
    return { success: true, data: response.data }
  },

  async getByCode(code: string): Promise<ComplianceApiResponse<Framework>> {
    const response = await apiClient.get<Framework>(API_ENDPOINTS.COMPLIANCE.FRAMEWORK_BY_CODE(code))
    return { success: true, data: response.data }
  },
}

// ============================================================================
// CONTROL SERVICE
// ============================================================================

export interface ControlListParams {
  page?: number
  pageSize?: number
  sort?: SortConfig
  filters?: ControlFilters
}

export const ControlService = {
  async getAll(params: ControlListParams = {}): Promise<CompliancePaginatedResponse<Control>> {
    const { page = 1, pageSize = 20, filters } = params
    const response = await apiClient.get<CompliancePaginatedResponse<Control>>(API_ENDPOINTS.COMPLIANCE.CONTROLS, {
      params: { page, pageSize, ...filters }
    })
    return response.data
  },

  async getById(id: string): Promise<ComplianceApiResponse<Control>> {
    const response = await apiClient.get<Control>(API_ENDPOINTS.COMPLIANCE.CONTROL_DETAIL(id))
    return { success: true, data: response.data }
  },

  async getByFramework(frameworkId: string): Promise<ComplianceApiResponse<Control[]>> {
    const response = await apiClient.get<Control[]>(API_ENDPOINTS.COMPLIANCE.FRAMEWORK_CONTROLS(frameworkId))
    return { success: true, data: response.data }
  },

  async updateStatus(id: string, status: ControlStatus, notes?: string): Promise<ComplianceApiResponse<Control>> {
    const response = await apiClient.patch<Control>(API_ENDPOINTS.COMPLIANCE.CONTROL_STATUS(id), { status, notes })
    return { success: true, data: response.data, message: 'Control status updated' }
  },
}

// ============================================================================
// EVIDENCE SERVICE
// ============================================================================

export interface EvidenceListParams {
  page?: number
  pageSize?: number
  sort?: SortConfig
  filters?: EvidenceFilters
}

export const EvidenceService = {
  async getAll(params: EvidenceListParams = {}): Promise<CompliancePaginatedResponse<Evidence>> {
    const { page = 1, pageSize = 20, filters } = params
    const response = await apiClient.get<CompliancePaginatedResponse<Evidence>>(API_ENDPOINTS.COMPLIANCE.EVIDENCE, {
      params: { page, pageSize, ...filters }
    })
    return response.data
  },

  async getById(id: string): Promise<ComplianceApiResponse<Evidence>> {
    const response = await apiClient.get<Evidence>(API_ENDPOINTS.COMPLIANCE.EVIDENCE_DETAIL(id))
    return { success: true, data: response.data }
  },

  async getByControl(controlId: string): Promise<ComplianceApiResponse<Evidence[]>> {
    const response = await apiClient.get<Evidence[]>(API_ENDPOINTS.COMPLIANCE.CONTROL_EVIDENCE(controlId))
    return { success: true, data: response.data }
  },

  async upload(data: FormData): Promise<ComplianceApiResponse<Evidence>> {
    const response = await apiClient.post<Evidence>(API_ENDPOINTS.COMPLIANCE.EVIDENCE, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return { success: true, data: response.data, message: 'Evidence uploaded successfully' }
  },

  async updateStatus(id: string, status: EvidenceStatus, notes?: string): Promise<ComplianceApiResponse<Evidence>> {
    const response = await apiClient.patch<Evidence>(API_ENDPOINTS.COMPLIANCE.EVIDENCE_STATUS(id), { status, notes })
    return { success: true, data: response.data, message: 'Evidence status updated' }
  },

  async delete(id: string): Promise<ComplianceApiResponse<void>> {
    await apiClient.delete(API_ENDPOINTS.COMPLIANCE.EVIDENCE_DETAIL(id))
    return { success: true, data: undefined, message: 'Evidence deleted' }
  },
}

// ============================================================================
// RISK SERVICE
// ============================================================================

export interface RiskListParams {
  page?: number
  pageSize?: number
  sort?: SortConfig
  filters?: RiskFilters
}

export const RiskService = {
  async getAll(params: RiskListParams = {}): Promise<CompliancePaginatedResponse<Risk>> {
    const { page = 1, pageSize = 20, filters } = params
    const response = await apiClient.get<CompliancePaginatedResponse<Risk>>(API_ENDPOINTS.COMPLIANCE.RISKS, {
      params: { page, pageSize, ...filters }
    })
    return response.data
  },

  async getById(id: string): Promise<ComplianceApiResponse<Risk>> {
    const response = await apiClient.get<Risk>(API_ENDPOINTS.COMPLIANCE.RISK_DETAIL(id))
    return { success: true, data: response.data }
  },

  async create(data: Partial<Risk>): Promise<ComplianceApiResponse<Risk>> {
    const response = await apiClient.post<Risk>(API_ENDPOINTS.COMPLIANCE.RISKS, data)
    return { success: true, data: response.data, message: 'Risk created successfully' }
  },

  async update(id: string, data: Partial<Risk>): Promise<ComplianceApiResponse<Risk>> {
    const response = await apiClient.put<Risk>(API_ENDPOINTS.COMPLIANCE.RISK_DETAIL(id), data)
    return { success: true, data: response.data, message: 'Risk updated' }
  },

  async updateStatus(id: string, status: RiskStatus): Promise<ComplianceApiResponse<Risk>> {
    const response = await apiClient.patch<Risk>(API_ENDPOINTS.COMPLIANCE.RISK_STATUS(id), { status })
    return { success: true, data: response.data, message: 'Risk status updated' }
  },

  async getMetrics(): Promise<ComplianceApiResponse<RiskMetrics>> {
    const response = await apiClient.get<RiskMetrics>(API_ENDPOINTS.COMPLIANCE.RISK_METRICS)
    return { success: true, data: response.data }
  },
}

// ============================================================================
// AUDIT SERVICE
// ============================================================================

export interface AuditListParams {
  page?: number
  pageSize?: number
  sort?: SortConfig
  filters?: AuditFilters
}

export const AuditService = {
  async getAll(params: AuditListParams = {}): Promise<CompliancePaginatedResponse<Audit>> {
    const { page = 1, pageSize = 20 } = params
    const response = await apiClient.get<CompliancePaginatedResponse<Audit>>(API_ENDPOINTS.COMPLIANCE.AUDITS, {
      params: { page, pageSize }
    })
    return response.data
  },

  async getById(id: string): Promise<ComplianceApiResponse<Audit>> {
    const response = await apiClient.get<Audit>(API_ENDPOINTS.COMPLIANCE.AUDIT_DETAIL(id))
    return { success: true, data: response.data }
  },

  async create(data: Partial<Audit>): Promise<ComplianceApiResponse<Audit>> {
    const response = await apiClient.post<Audit>(API_ENDPOINTS.COMPLIANCE.AUDITS, data)
    return { success: true, data: response.data, message: 'Audit created' }
  },

  async getFindings(auditId: string): Promise<ComplianceApiResponse<AuditFinding[]>> {
    const response = await apiClient.get<AuditFinding[]>(API_ENDPOINTS.COMPLIANCE.AUDIT_FINDINGS(auditId))
    return { success: true, data: response.data }
  },
}

// ============================================================================
// TASK SERVICE
// ============================================================================

export interface TaskListParams {
  page?: number
  pageSize?: number
  sort?: SortConfig
  filters?: TaskFilters
}

export const TaskService = {
  async getAll(params: TaskListParams = {}): Promise<CompliancePaginatedResponse<ComplianceTask>> {
    const { page = 1, pageSize = 20, filters } = params
    const response = await apiClient.get<CompliancePaginatedResponse<ComplianceTask>>(API_ENDPOINTS.COMPLIANCE.TASKS, {
      params: { page, pageSize, ...filters }
    })
    return response.data
  },

  async getById(id: string): Promise<ComplianceApiResponse<ComplianceTask>> {
    const response = await apiClient.get<ComplianceTask>(API_ENDPOINTS.COMPLIANCE.TASK_DETAIL(id))
    return { success: true, data: response.data }
  },

  async create(data: Partial<ComplianceTask>): Promise<ComplianceApiResponse<ComplianceTask>> {
    const response = await apiClient.post<ComplianceTask>(API_ENDPOINTS.COMPLIANCE.TASKS, data)
    return { success: true, data: response.data, message: 'Task created' }
  },

  async updateStatus(id: string, status: TaskStatus): Promise<ComplianceApiResponse<ComplianceTask>> {
    const response = await apiClient.patch<ComplianceTask>(API_ENDPOINTS.COMPLIANCE.TASK_STATUS(id), { status })
    return { success: true, data: response.data, message: 'Task status updated' }
  },

  async updateChecklist(id: string, checklistItemId: string, isCompleted: boolean): Promise<ComplianceApiResponse<ComplianceTask>> {
    const response = await apiClient.patch<ComplianceTask>(API_ENDPOINTS.COMPLIANCE.TASK_CHECKLIST(id, checklistItemId), { isCompleted })
    return { success: true, data: response.data, message: 'Checklist updated' }
  },

  async getMetrics(): Promise<ComplianceApiResponse<TaskMetrics>> {
    const response = await apiClient.get<TaskMetrics>(API_ENDPOINTS.COMPLIANCE.TASK_METRICS)
    return { success: true, data: response.data }
  },
}

// ============================================================================
// POLICY SERVICE
// ============================================================================

export const PolicyService = {
  async getAll(): Promise<ComplianceApiResponse<Policy[]>> {
    const response = await apiClient.get<Policy[]>(API_ENDPOINTS.COMPLIANCE.POLICIES)
    return { success: true, data: response.data }
  },

  async getById(id: string): Promise<ComplianceApiResponse<Policy>> {
    const response = await apiClient.get<Policy>(API_ENDPOINTS.COMPLIANCE.POLICY_DETAIL(id))
    return { success: true, data: response.data }
  },
}

// ============================================================================
// DASHBOARD SERVICE
// ============================================================================

export const ComplianceDashboardService = {
  async getDashboard(): Promise<ComplianceApiResponse<ComplianceDashboard>> {
    const response = await apiClient.get<ComplianceDashboard>(API_ENDPOINTS.COMPLIANCE.DASHBOARD)
    return { success: true, data: response.data }
  },
}

// ============================================================================
// COMBINED SERVICE EXPORT
// ============================================================================

export const ComplianceService = {
  frameworks: FrameworkService,
  controls: ControlService,
  evidence: EvidenceService,
  risks: RiskService,
  audits: AuditService,
  tasks: TaskService,
  policies: PolicyService,
  dashboard: ComplianceDashboardService,
}

export default ComplianceService

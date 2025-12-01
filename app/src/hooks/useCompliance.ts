/**
 * useCompliance Hook
 *
 * Comprehensive React hook for compliance operations
 * Uses TanStack Query for data fetching, caching, and optimistic updates
 *
 * @version 1.0.0
 * @compliance SOC 2 Type II, ISO 27001:2022
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ComplianceService,
  FrameworkService,
  ControlService,
  EvidenceService,
  RiskService,
  AuditService,
  TaskService,
  PolicyService,
  ComplianceDashboardService,
  type ControlListParams,
  type EvidenceListParams,
  type RiskListParams,
  type AuditListParams,
  type TaskListParams,
} from '@/modules/compliance/compliance.service'
import type {
  ComplianceFramework,
  ControlStatus,
  EvidenceStatus,
  RiskStatus,
  TaskStatus,
  Risk,
  ComplianceTask,
  Audit,
  ControlFilters,
  RiskFilters,
  EvidenceFilters,
  TaskFilters,
} from '@/types/compliance.types'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const complianceKeys = {
  all: ['compliance'] as const,

  // Dashboard
  dashboard: () => [...complianceKeys.all, 'dashboard'] as const,

  // Frameworks
  frameworks: () => [...complianceKeys.all, 'frameworks'] as const,
  frameworksList: () => [...complianceKeys.frameworks(), 'list'] as const,
  frameworkDetail: (id: string) => [...complianceKeys.frameworks(), 'detail', id] as const,
  frameworkByCode: (code: ComplianceFramework) => [...complianceKeys.frameworks(), 'code', code] as const,

  // Controls
  controls: () => [...complianceKeys.all, 'controls'] as const,
  controlsList: (params: string) => [...complianceKeys.controls(), 'list', params] as const,
  controlDetail: (id: string) => [...complianceKeys.controls(), 'detail', id] as const,
  controlsByFramework: (frameworkId: string) => [...complianceKeys.controls(), 'framework', frameworkId] as const,

  // Evidence
  evidence: () => [...complianceKeys.all, 'evidence'] as const,
  evidenceList: (params: string) => [...complianceKeys.evidence(), 'list', params] as const,
  evidenceDetail: (id: string) => [...complianceKeys.evidence(), 'detail', id] as const,
  evidenceByControl: (controlId: string) => [...complianceKeys.evidence(), 'control', controlId] as const,

  // Risks
  risks: () => [...complianceKeys.all, 'risks'] as const,
  risksList: (params: string) => [...complianceKeys.risks(), 'list', params] as const,
  riskDetail: (id: string) => [...complianceKeys.risks(), 'detail', id] as const,
  riskMetrics: () => [...complianceKeys.risks(), 'metrics'] as const,

  // Audits
  audits: () => [...complianceKeys.all, 'audits'] as const,
  auditsList: (params: string) => [...complianceKeys.audits(), 'list', params] as const,
  auditDetail: (id: string) => [...complianceKeys.audits(), 'detail', id] as const,
  auditFindings: (auditId: string) => [...complianceKeys.audits(), 'findings', auditId] as const,

  // Tasks
  tasks: () => [...complianceKeys.all, 'tasks'] as const,
  tasksList: (params: string) => [...complianceKeys.tasks(), 'list', params] as const,
  taskDetail: (id: string) => [...complianceKeys.tasks(), 'detail', id] as const,
  taskMetrics: () => [...complianceKeys.tasks(), 'metrics'] as const,

  // Policies
  policies: () => [...complianceKeys.all, 'policies'] as const,
  policiesList: () => [...complianceKeys.policies(), 'list'] as const,
  policyDetail: (id: string) => [...complianceKeys.policies(), 'detail', id] as const,
}

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

export function useComplianceDashboard(enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.dashboard(),
    queryFn: () => ComplianceDashboardService.getDashboard(),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  })
}

// ============================================================================
// FRAMEWORK HOOKS
// ============================================================================

export function useFrameworks(enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.frameworksList(),
    queryFn: () => FrameworkService.getAll(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useFramework(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.frameworkDetail(id || ''),
    queryFn: () => FrameworkService.getById(id!),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFrameworkByCode(code: ComplianceFramework | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.frameworkByCode(code || 'SOC2'),
    queryFn: () => FrameworkService.getByCode(code!),
    enabled: enabled && !!code,
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================================
// CONTROL HOOKS
// ============================================================================

export function useControls(params: ControlListParams & { enabled?: boolean } = {}) {
  const { enabled = true, ...listParams } = params

  return useQuery({
    queryKey: complianceKeys.controlsList(JSON.stringify(listParams)),
    queryFn: () => ControlService.getAll(listParams),
    enabled,
    staleTime: 60000, // 1 minute
  })
}

export function useControl(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.controlDetail(id || ''),
    queryFn: () => ControlService.getById(id!),
    enabled: enabled && !!id,
    staleTime: 60000,
  })
}

export function useControlsByFramework(frameworkId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.controlsByFramework(frameworkId || ''),
    queryFn: () => ControlService.getByFramework(frameworkId!),
    enabled: enabled && !!frameworkId,
    staleTime: 60000,
  })
}

export function useUpdateControlStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ControlStatus; notes?: string }) =>
      ControlService.updateStatus(id, status, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.controlDetail(id) })
      queryClient.invalidateQueries({ queryKey: complianceKeys.controls() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.frameworks() })
    },
  })
}

// ============================================================================
// EVIDENCE HOOKS
// ============================================================================

export function useEvidence(params: EvidenceListParams & { enabled?: boolean } = {}) {
  const { enabled = true, ...listParams } = params

  return useQuery({
    queryKey: complianceKeys.evidenceList(JSON.stringify(listParams)),
    queryFn: () => EvidenceService.getAll(listParams),
    enabled,
    staleTime: 60000,
  })
}

export function useEvidenceDetail(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.evidenceDetail(id || ''),
    queryFn: () => EvidenceService.getById(id!),
    enabled: enabled && !!id,
    staleTime: 60000,
  })
}

export function useEvidenceByControl(controlId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.evidenceByControl(controlId || ''),
    queryFn: () => EvidenceService.getByControl(controlId!),
    enabled: enabled && !!controlId,
    staleTime: 60000,
  })
}

export function useUploadEvidence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FormData) => EvidenceService.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.evidence() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
    },
  })
}

export function useUpdateEvidenceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: EvidenceStatus; notes?: string }) =>
      EvidenceService.updateStatus(id, status, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.evidenceDetail(id) })
      queryClient.invalidateQueries({ queryKey: complianceKeys.evidence() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
    },
  })
}

export function useDeleteEvidence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => EvidenceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.evidence() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
    },
  })
}

export function useApproveEvidence() {
  const updateStatus = useUpdateEvidenceStatus()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      updateStatus.mutateAsync({ id, status: 'approved' as EvidenceStatus, notes }),
  })
}

export function useRejectEvidence() {
  const updateStatus = useUpdateEvidenceStatus()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      updateStatus.mutateAsync({ id, status: 'rejected' as EvidenceStatus, notes }),
  })
}

// ============================================================================
// RISK HOOKS
// ============================================================================

export function useRisks(params: RiskListParams & { enabled?: boolean } = {}) {
  const { enabled = true, ...listParams } = params

  return useQuery({
    queryKey: complianceKeys.risksList(JSON.stringify(listParams)),
    queryFn: () => RiskService.getAll(listParams),
    enabled,
    staleTime: 60000,
  })
}

export function useRisk(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.riskDetail(id || ''),
    queryFn: () => RiskService.getById(id!),
    enabled: enabled && !!id,
    staleTime: 60000,
  })
}

export function useRiskMetrics(enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.riskMetrics(),
    queryFn: () => RiskService.getMetrics(),
    enabled,
    staleTime: 60000,
  })
}

export function useCreateRisk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Risk>) => RiskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.risks() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.riskMetrics() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
    },
  })
}

export function useUpdateRisk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Risk> }) =>
      RiskService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.riskDetail(id) })
      queryClient.invalidateQueries({ queryKey: complianceKeys.risks() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.riskMetrics() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
    },
  })
}

export function useUpdateRiskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RiskStatus }) =>
      RiskService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.riskDetail(id) })
      queryClient.invalidateQueries({ queryKey: complianceKeys.risks() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.riskMetrics() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
    },
  })
}

// ============================================================================
// AUDIT HOOKS
// ============================================================================

export function useAudits(params: AuditListParams & { enabled?: boolean } = {}) {
  const { enabled = true, ...listParams } = params

  return useQuery({
    queryKey: complianceKeys.auditsList(JSON.stringify(listParams)),
    queryFn: () => AuditService.getAll(listParams),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAudit(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.auditDetail(id || ''),
    queryFn: () => AuditService.getById(id!),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuditFindings(auditId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.auditFindings(auditId || ''),
    queryFn: () => AuditService.getFindings(auditId!),
    enabled: enabled && !!auditId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateAudit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Audit>) => AuditService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.audits() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
    },
  })
}

// ============================================================================
// TASK HOOKS
// ============================================================================

export function useTasks(params: TaskListParams & { enabled?: boolean } = {}) {
  const { enabled = true, ...listParams } = params

  return useQuery({
    queryKey: complianceKeys.tasksList(JSON.stringify(listParams)),
    queryFn: () => TaskService.getAll(listParams),
    enabled,
    staleTime: 30000, // 30 seconds for tasks
    refetchInterval: 60000, // Refresh every minute
  })
}

export function useTask(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.taskDetail(id || ''),
    queryFn: () => TaskService.getById(id!),
    enabled: enabled && !!id,
    staleTime: 30000,
  })
}

export function useTaskMetrics(enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.taskMetrics(),
    queryFn: () => TaskService.getMetrics(),
    enabled,
    staleTime: 30000,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ComplianceTask>) => TaskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.tasks() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.taskMetrics() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      TaskService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: complianceKeys.taskDetail(id) })
      const previousData = queryClient.getQueryData(complianceKeys.taskDetail(id))

      queryClient.setQueryData(complianceKeys.taskDetail(id), (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: { ...old.data, status },
        }
      })

      return { previousData }
    },
    onError: (_, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(complianceKeys.taskDetail(id), context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.tasks() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.taskMetrics() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() })
    },
  })
}

export function useUpdateTaskChecklist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, checklistItemId, isCompleted }: { taskId: string; checklistItemId: string; isCompleted: boolean }) =>
      TaskService.updateChecklist(taskId, checklistItemId, isCompleted),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.taskDetail(taskId) })
      queryClient.invalidateQueries({ queryKey: complianceKeys.tasks() })
    },
  })
}

// ============================================================================
// POLICY HOOKS
// ============================================================================

export function usePolicies(enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.policiesList(),
    queryFn: () => PolicyService.getAll(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePolicy(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: complianceKeys.policyDetail(id || ''),
    queryFn: () => PolicyService.getById(id!),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================================
// COMBINED HOOK
// ============================================================================

export function useCompliance() {
  const queryClient = useQueryClient()

  return {
    // Dashboard
    useComplianceDashboard,

    // Frameworks
    useFrameworks,
    useFramework,
    useFrameworkByCode,

    // Controls
    useControls,
    useControl,
    useControlsByFramework,
    useUpdateControlStatus,

    // Evidence
    useEvidence,
    useEvidenceDetail,
    useEvidenceByControl,
    useUploadEvidence,
    useUpdateEvidenceStatus,
    useDeleteEvidence,

    // Risks
    useRisks,
    useRisk,
    useRiskMetrics,
    useCreateRisk,
    useUpdateRisk,
    useUpdateRiskStatus,

    // Audits
    useAudits,
    useAudit,
    useAuditFindings,
    useCreateAudit,

    // Tasks
    useTasks,
    useTask,
    useTaskMetrics,
    useCreateTask,
    useUpdateTaskStatus,
    useUpdateTaskChecklist,

    // Policies
    usePolicies,
    usePolicy,

    // Utilities
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: complianceKeys.all }),
  }
}

export default useCompliance

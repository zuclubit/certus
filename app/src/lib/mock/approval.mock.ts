/**
 * Approval Workflows Mock Data
 *
 * Comprehensive mock data for approval workflows including:
 * - Various workflow states (pending, in_progress, approved, rejected, escalated)
 * - Different SLA scenarios (on_time, warning, critical, breached)
 * - Multi-stage workflows with maker-checker approvals
 * - Complete audit trail and history
 *
 * @compliance CONSAR Multi-level Approval System
 */

import type {
  ApprovalWorkflow,
  ApprovalStage,
  ApprovalHistoryEntry,
  ApprovalUser,
  ApprovalLevel,
  ApprovalStatus,
  SLAStatus,
  Priority,
  ApprovalAction,
} from '@/types/approval.types'

// ============================================================================
// MOCK USERS (Approval Hierarchy)
// ============================================================================

export const mockApprovalUsers: ApprovalUser[] = [
  {
    id: 'user-001',
    name: 'Ana García Martínez',
    email: 'ana.garcia@certus.com.mx',
    role: 'Analista de Validaciones',
    level: 1,
    department: 'Validaciones',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 'user-002',
    name: 'Carlos Mendoza Ruiz',
    email: 'carlos.mendoza@certus.com.mx',
    role: 'Supervisor de Validaciones',
    level: 2,
    department: 'Validaciones',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'user-003',
    name: 'Laura Sánchez López',
    email: 'laura.sanchez@certus.com.mx',
    role: 'Gerente de Cumplimiento',
    level: 3,
    department: 'Cumplimiento',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'user-004',
    name: 'Roberto Torres Delgado',
    email: 'roberto.torres@certus.com.mx',
    role: 'Director de Operaciones',
    level: 4,
    department: 'Operaciones',
    avatar: 'https://i.pravatar.cc/150?img=13',
  },
  {
    id: 'user-005',
    name: 'Patricia Ramírez Vega',
    email: 'patricia.ramirez@certus.com.mx',
    role: 'Analista Senior',
    level: 1,
    department: 'Validaciones',
    avatar: 'https://i.pravatar.cc/150?img=9',
  },
  {
    id: 'user-006',
    name: 'Miguel Ángel Hernández',
    email: 'miguel.hernandez@certus.com.mx',
    role: 'Supervisor Senior',
    level: 2,
    department: 'Validaciones',
    avatar: 'https://i.pravatar.cc/150?img=14',
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createStage(
  level: ApprovalLevel,
  assignee: ApprovalUser,
  options: {
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped'
    approvedBy?: ApprovalUser[]
    approvedAt?: string
    rejectedBy?: ApprovalUser
    rejectedAt?: string
    comment?: string
    slaStatus: SLAStatus
    requiresMultipleApprovals?: boolean
    approvalsCount?: number
    duration?: number
  }
): ApprovalStage {
  const startedAt =
    options.status !== 'pending'
      ? new Date(Date.now() - (options.duration || 3600000)).toISOString()
      : undefined

  return {
    level,
    assignee,
    status: options.status,
    startedAt,
    approvedBy: options.approvedBy,
    approvedAt: options.approvedAt,
    rejectedBy: options.rejectedBy,
    rejectedAt: options.rejectedAt,
    comment: options.comment,
    slaStatus: options.slaStatus,
    requiresMultipleApprovals: options.requiresMultipleApprovals || false,
    approvalsCount: options.approvalsCount || (options.approvedBy?.length || 0),
    duration: options.duration,
  }
}

function createHistoryEntry(
  id: string,
  action: ApprovalAction,
  performedBy: ApprovalUser,
  timestamp: string,
  fromLevel: ApprovalLevel,
  toLevel?: ApprovalLevel,
  comment?: string
): ApprovalHistoryEntry {
  return {
    id,
    action,
    performedBy,
    timestamp,
    fromLevel,
    toLevel,
    comment,
  }
}

// ============================================================================
// MOCK APPROVAL WORKFLOWS
// ============================================================================

export const mockApprovalWorkflows: ApprovalWorkflow[] = [
  // 1. Workflow Pendiente - Nivel Analista (SLA On Time)
  {
    id: 'WF-2025-001',
    fileId: 'VAL-2025-001',
    fileName: 'NOMINA_ABC010101ABC_20250123_0001.txt',
    fileType: 'NOMINA',
    afore: 'AFORE XXI BANORTE',
    submittedBy: mockApprovalUsers[4], // Patricia
    submittedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    currentLevel: 1,
    status: 'pending' as ApprovalStatus,
    priority: 'normal' as Priority,
    overallSLAStatus: 'on_time' as SLAStatus,
    stages: [
      createStage(0, mockApprovalUsers[4], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[4]],
        approvedAt: new Date(Date.now() - 1800000).toISOString(),
        slaStatus: 'on_time',
        duration: 300000, // 5 min
      }),
      createStage(1, mockApprovalUsers[0], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
      createStage(2, mockApprovalUsers[1], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
      createStage(3, mockApprovalUsers[2], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
      createStage(4, mockApprovalUsers[3], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
    ],
    history: [
      createHistoryEntry(
        'HIST-001-1',
        'submit',
        mockApprovalUsers[4],
        new Date(Date.now() - 1800000).toISOString(),
        0,
        undefined,
        'Archivo NOMINA validado automáticamente y enviado para aprobación'
      ),
    ],
    metadata: {
      totalRecords: 15420,
      totalErrors: 0,
      totalWarnings: 3,
      validationScore: 98.5,
      criticalErrors: 0,
    },
    notifications: [],
  },

  // 2. Workflow En Proceso - Nivel Supervisor (SLA Warning)
  {
    id: 'WF-2025-002',
    fileId: 'VAL-2025-002',
    fileName: 'CONTABLE_XYZ990101XYZ_20250122_0045.txt',
    fileType: 'CONTABLE',
    afore: 'AFORE COPPEL',
    submittedBy: mockApprovalUsers[0], // Ana
    submittedAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    currentLevel: 2,
    status: 'in_progress' as ApprovalStatus,
    priority: 'high' as Priority,
    overallSLAStatus: 'warning' as SLAStatus,
    stages: [
      createStage(0, mockApprovalUsers[0], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[0]],
        approvedAt: new Date(Date.now() - 14400000).toISOString(),
        slaStatus: 'on_time',
        duration: 600000, // 10 min
      }),
      createStage(1, mockApprovalUsers[0], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[0]],
        approvedAt: new Date(Date.now() - 12600000).toISOString(),
        comment: 'Validación de registros contables correcta. Aprobado para siguiente nivel.',
        slaStatus: 'on_time',
        duration: 1800000, // 30 min
      }),
      createStage(2, mockApprovalUsers[1], {
        status: 'in_progress',
        slaStatus: 'warning',
        duration: 10800000, // 3 hours
      }),
      createStage(3, mockApprovalUsers[2], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
      createStage(4, mockApprovalUsers[3], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
    ],
    history: [
      createHistoryEntry(
        'HIST-002-1',
        'submit',
        mockApprovalUsers[0],
        new Date(Date.now() - 14400000).toISOString(),
        0
      ),
      createHistoryEntry(
        'HIST-002-2',
        'approve',
        mockApprovalUsers[0],
        new Date(Date.now() - 12600000).toISOString(),
        1,
        2,
        'Validación de registros contables correcta. Aprobado para siguiente nivel.'
      ),
    ],
    metadata: {
      totalRecords: 8934,
      totalErrors: 0,
      totalWarnings: 12,
      validationScore: 96.2,
      criticalErrors: 0,
    },
    notifications: [],
  },

  // 3. Workflow Aprobado Completo (SLA On Time)
  {
    id: 'WF-2025-003',
    fileId: 'VAL-2025-003',
    fileName: 'REGULARIZACION_DEF850303DEF_20250120_0012.txt',
    fileType: 'REGULARIZACION',
    afore: 'AFORE INBURSA',
    submittedBy: mockApprovalUsers[4], // Patricia
    submittedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    currentLevel: 4,
    status: 'approved' as ApprovalStatus,
    priority: 'normal' as Priority,
    overallSLAStatus: 'on_time' as SLAStatus,
    completedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    stages: [
      createStage(0, mockApprovalUsers[4], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[4]],
        approvedAt: new Date(Date.now() - 259200000).toISOString(),
        slaStatus: 'on_time',
        duration: 300000,
      }),
      createStage(1, mockApprovalUsers[0], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[0]],
        approvedAt: new Date(Date.now() - 244800000).toISOString(),
        comment: 'Archivo de regularización revisado. Todo en orden.',
        slaStatus: 'on_time',
        duration: 14400000, // 4 hours
      }),
      createStage(2, mockApprovalUsers[1], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[1]],
        approvedAt: new Date(Date.now() - 201600000).toISOString(),
        comment: 'Validación supervisora completada. Aprobado.',
        slaStatus: 'on_time',
        duration: 43200000, // 12 hours
      }),
      createStage(3, mockApprovalUsers[2], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[2]],
        approvedAt: new Date(Date.now() - 129600000).toISOString(),
        comment: 'Cumplimiento normativo verificado. Aprobado para dirección.',
        slaStatus: 'on_time',
        duration: 72000000, // 20 hours
      }),
      createStage(4, mockApprovalUsers[3], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[3]],
        approvedAt: new Date(Date.now() - 86400000).toISOString(),
        comment: 'Aprobación final de dirección. Workflow completado.',
        slaStatus: 'on_time',
        duration: 43200000, // 12 hours
      }),
    ],
    history: [
      createHistoryEntry(
        'HIST-003-1',
        'submit',
        mockApprovalUsers[4],
        new Date(Date.now() - 259200000).toISOString(),
        0
      ),
      createHistoryEntry(
        'HIST-003-2',
        'approve',
        mockApprovalUsers[0],
        new Date(Date.now() - 244800000).toISOString(),
        1,
        2,
        'Archivo de regularización revisado. Todo en orden.'
      ),
      createHistoryEntry(
        'HIST-003-3',
        'approve',
        mockApprovalUsers[1],
        new Date(Date.now() - 201600000).toISOString(),
        2,
        3,
        'Validación supervisora completada. Aprobado.'
      ),
      createHistoryEntry(
        'HIST-003-4',
        'approve',
        mockApprovalUsers[2],
        new Date(Date.now() - 129600000).toISOString(),
        3,
        4,
        'Cumplimiento normativo verificado. Aprobado para dirección.'
      ),
      createHistoryEntry(
        'HIST-003-5',
        'approve',
        mockApprovalUsers[3],
        new Date(Date.now() - 86400000).toISOString(),
        4,
        undefined,
        'Aprobación final de dirección. Workflow completado.'
      ),
    ],
    metadata: {
      totalRecords: 2345,
      totalErrors: 0,
      totalWarnings: 5,
      validationScore: 99.1,
      criticalErrors: 0,
    },
    notifications: [],
  },

  // 4. Workflow Rechazado (SLA Breached)
  {
    id: 'WF-2025-004',
    fileId: 'VAL-2025-004',
    fileName: 'NOMINA_GHI120505GHI_20250119_0089.txt',
    fileType: 'NOMINA',
    afore: 'AFORE PENSIONISSSTE',
    submittedBy: mockApprovalUsers[0], // Ana
    submittedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    currentLevel: 2,
    status: 'rejected' as ApprovalStatus,
    priority: 'urgent' as Priority,
    overallSLAStatus: 'breached' as SLAStatus,
    completedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    stages: [
      createStage(0, mockApprovalUsers[0], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[0]],
        approvedAt: new Date(Date.now() - 432000000).toISOString(),
        slaStatus: 'on_time',
        duration: 600000,
      }),
      createStage(1, mockApprovalUsers[0], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[0]],
        approvedAt: new Date(Date.now() - 388800000).toISOString(),
        comment: 'Primera revisión completada.',
        slaStatus: 'warning',
        duration: 43200000, // 12 hours
      }),
      createStage(2, mockApprovalUsers[1], {
        status: 'rejected',
        rejectedBy: mockApprovalUsers[1],
        rejectedAt: new Date(Date.now() - 259200000).toISOString(),
        comment: 'RECHAZADO: Se detectaron inconsistencias graves en los montos de aportaciones patronales. Registros 1245-1289 muestran valores fuera de rango permitido. Requiere corrección y reenvío.',
        slaStatus: 'breached',
        duration: 129600000, // 36 hours
      }),
      createStage(3, mockApprovalUsers[2], {
        status: 'skipped',
        slaStatus: 'on_time',
      }),
      createStage(4, mockApprovalUsers[3], {
        status: 'skipped',
        slaStatus: 'on_time',
      }),
    ],
    history: [
      createHistoryEntry(
        'HIST-004-1',
        'submit',
        mockApprovalUsers[0],
        new Date(Date.now() - 432000000).toISOString(),
        0
      ),
      createHistoryEntry(
        'HIST-004-2',
        'approve',
        mockApprovalUsers[0],
        new Date(Date.now() - 388800000).toISOString(),
        1,
        2,
        'Primera revisión completada.'
      ),
      createHistoryEntry(
        'HIST-004-3',
        'reject',
        mockApprovalUsers[1],
        new Date(Date.now() - 259200000).toISOString(),
        2,
        undefined,
        'RECHAZADO: Se detectaron inconsistencias graves en los montos de aportaciones patronales. Registros 1245-1289 muestran valores fuera de rango permitido. Requiere corrección y reenvío.'
      ),
    ],
    metadata: {
      totalRecords: 18765,
      totalErrors: 45,
      totalWarnings: 23,
      validationScore: 87.3,
      criticalErrors: 12,
    },
    notifications: [],
  },

  // 5. Workflow Escalado (SLA Critical)
  {
    id: 'WF-2025-005',
    fileId: 'VAL-2025-005',
    fileName: 'CONTABLE_JKL780909JKL_20250122_0234.txt',
    fileType: 'CONTABLE',
    afore: 'AFORE SURA',
    submittedBy: mockApprovalUsers[4], // Patricia
    submittedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    currentLevel: 3,
    status: 'escalated' as ApprovalStatus,
    priority: 'urgent' as Priority,
    overallSLAStatus: 'critical' as SLAStatus,
    stages: [
      createStage(0, mockApprovalUsers[4], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[4]],
        approvedAt: new Date(Date.now() - 172800000).toISOString(),
        slaStatus: 'on_time',
        duration: 300000,
      }),
      createStage(1, mockApprovalUsers[0], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[0]],
        approvedAt: new Date(Date.now() - 158400000).toISOString(),
        comment: 'Revisión inicial completada.',
        slaStatus: 'on_time',
        duration: 14400000,
      }),
      createStage(2, mockApprovalUsers[1], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[1]],
        approvedAt: new Date(Date.now() - 86400000).toISOString(),
        comment: 'Nivel supervisor aprobado. Escalado por complejidad.',
        slaStatus: 'critical',
        duration: 72000000,
      }),
      createStage(3, mockApprovalUsers[2], {
        status: 'in_progress',
        slaStatus: 'critical',
        duration: 86400000, // 24 hours in progress
      }),
      createStage(4, mockApprovalUsers[3], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
    ],
    history: [
      createHistoryEntry(
        'HIST-005-1',
        'submit',
        mockApprovalUsers[4],
        new Date(Date.now() - 172800000).toISOString(),
        0
      ),
      createHistoryEntry(
        'HIST-005-2',
        'approve',
        mockApprovalUsers[0],
        new Date(Date.now() - 158400000).toISOString(),
        1,
        2,
        'Revisión inicial completada.'
      ),
      createHistoryEntry(
        'HIST-005-3',
        'escalate',
        mockApprovalUsers[1],
        new Date(Date.now() - 86400000).toISOString(),
        2,
        3,
        'Nivel supervisor aprobado. Escalado por complejidad a gerencia.'
      ),
    ],
    metadata: {
      totalRecords: 12456,
      totalErrors: 8,
      totalWarnings: 34,
      validationScore: 91.5,
      criticalErrors: 2,
    },
    notifications: [],
  },

  // 6. Workflow con Maker-Checker (En Proceso)
  {
    id: 'WF-2025-006',
    fileId: 'VAL-2025-006',
    fileName: 'NOMINA_MNO340707MNO_20250123_0156.txt',
    fileType: 'NOMINA',
    afore: 'AFORE PROFUTURO GNP',
    submittedBy: mockApprovalUsers[4], // Patricia
    submittedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    currentLevel: 2,
    status: 'in_progress' as ApprovalStatus,
    priority: 'high' as Priority,
    overallSLAStatus: 'on_time' as SLAStatus,
    stages: [
      createStage(0, mockApprovalUsers[4], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[4]],
        approvedAt: new Date(Date.now() - 7200000).toISOString(),
        slaStatus: 'on_time',
        duration: 300000,
      }),
      createStage(1, mockApprovalUsers[0], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[0]],
        approvedAt: new Date(Date.now() - 5400000).toISOString(),
        comment: 'Primera aprobación analista.',
        slaStatus: 'on_time',
        duration: 1800000,
      }),
      createStage(2, mockApprovalUsers[1], {
        status: 'in_progress',
        slaStatus: 'on_time',
        requiresMultipleApprovals: true,
        approvalsCount: 1,
        approvedBy: [mockApprovalUsers[1]],
        comment: 'Maker-Checker: 1 de 2 aprobaciones requeridas. Pendiente segunda aprobación.',
        duration: 5400000, // 1.5 hours
      }),
      createStage(3, mockApprovalUsers[2], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
      createStage(4, mockApprovalUsers[3], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
    ],
    history: [
      createHistoryEntry(
        'HIST-006-1',
        'submit',
        mockApprovalUsers[4],
        new Date(Date.now() - 7200000).toISOString(),
        0
      ),
      createHistoryEntry(
        'HIST-006-2',
        'approve',
        mockApprovalUsers[0],
        new Date(Date.now() - 5400000).toISOString(),
        1,
        2,
        'Primera aprobación analista.'
      ),
      createHistoryEntry(
        'HIST-006-3',
        'approve',
        mockApprovalUsers[1],
        new Date(Date.now() - 1800000).toISOString(),
        2,
        2,
        'Maker-Checker: Primera aprobación supervisor. Requiere segunda validación.'
      ),
    ],
    metadata: {
      totalRecords: 23456,
      totalErrors: 0,
      totalWarnings: 7,
      validationScore: 97.8,
      criticalErrors: 0,
    },
    notifications: [],
  },

  // 7. Workflow Pendiente Urgente (SLA Warning)
  {
    id: 'WF-2025-007',
    fileId: 'VAL-2025-007',
    fileName: 'REGULARIZACION_PQR560812PQR_20250123_0067.txt',
    fileType: 'REGULARIZACION',
    afore: 'AFORE PRINCIPAL',
    submittedBy: mockApprovalUsers[0], // Ana
    submittedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    currentLevel: 1,
    status: 'pending' as ApprovalStatus,
    priority: 'urgent' as Priority,
    overallSLAStatus: 'warning' as SLAStatus,
    stages: [
      createStage(0, mockApprovalUsers[0], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[0]],
        approvedAt: new Date(Date.now() - 10800000).toISOString(),
        slaStatus: 'on_time',
        duration: 600000,
      }),
      createStage(1, mockApprovalUsers[0], {
        status: 'pending',
        slaStatus: 'warning',
        duration: 10200000, // 2 hours 50 min
      }),
      createStage(2, mockApprovalUsers[1], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
      createStage(3, mockApprovalUsers[2], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
      createStage(4, mockApprovalUsers[3], {
        status: 'pending',
        slaStatus: 'on_time',
      }),
    ],
    history: [
      createHistoryEntry(
        'HIST-007-1',
        'submit',
        mockApprovalUsers[0],
        new Date(Date.now() - 10800000).toISOString(),
        0,
        undefined,
        'Archivo de regularización urgente. Requiere procesamiento prioritario.'
      ),
    ],
    metadata: {
      totalRecords: 3456,
      totalErrors: 12,
      totalWarnings: 15,
      validationScore: 94.2,
      criticalErrors: 3,
    },
    notifications: [],
  },

  // 8. Workflow Cancelado
  {
    id: 'WF-2025-008',
    fileId: 'VAL-2025-008',
    fileName: 'CONTABLE_STU230445STU_20250121_0198.txt',
    fileType: 'CONTABLE',
    afore: 'AFORE AZTECA',
    submittedBy: mockApprovalUsers[4], // Patricia
    submittedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    currentLevel: 1,
    status: 'cancelled' as ApprovalStatus,
    priority: 'low' as Priority,
    overallSLAStatus: 'on_time' as SLAStatus,
    completedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    stages: [
      createStage(0, mockApprovalUsers[4], {
        status: 'approved',
        approvedBy: [mockApprovalUsers[4]],
        approvedAt: new Date(Date.now() - 345600000).toISOString(),
        slaStatus: 'on_time',
        duration: 300000,
      }),
      createStage(1, mockApprovalUsers[0], {
        status: 'skipped',
        slaStatus: 'on_time',
      }),
      createStage(2, mockApprovalUsers[1], {
        status: 'skipped',
        slaStatus: 'on_time',
      }),
      createStage(3, mockApprovalUsers[2], {
        status: 'skipped',
        slaStatus: 'on_time',
      }),
      createStage(4, mockApprovalUsers[3], {
        status: 'skipped',
        slaStatus: 'on_time',
      }),
    ],
    history: [
      createHistoryEntry(
        'HIST-008-1',
        'submit',
        mockApprovalUsers[4],
        new Date(Date.now() - 345600000).toISOString(),
        0
      ),
      createHistoryEntry(
        'HIST-008-2',
        'cancel',
        mockApprovalUsers[4],
        new Date(Date.now() - 259200000).toISOString(),
        1,
        undefined,
        'Cancelado por el usuario: Se detectó error en archivo fuente. Se resubirá versión corregida.'
      ),
    ],
    metadata: {
      totalRecords: 5678,
      totalErrors: 156,
      totalWarnings: 89,
      validationScore: 72.4,
      criticalErrors: 45,
    },
    notifications: [],
  },
]

// ============================================================================
// EXPORT
// ============================================================================

export default mockApprovalWorkflows

// Barrel export — import everything from '@/lib/api'
export * from '@/lib/api/assessments'
export * from '@/lib/api/chat'
export * from '@/lib/api/journal'
export * from '@/lib/api/patients'
export * from '@/lib/api/settings'
export * from '@/lib/api/education'
// Note: clinic re-exports are available via '@/lib/api/clinic' directly
// to avoid naming conflicts with submitAssessment vs submitCRF.

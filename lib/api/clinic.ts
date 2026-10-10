// Clinic API re-exports from assessments for CRF-specific operations.
// PLACEHOLDER: When backend is ready, replace these with clinic-specific endpoints:
//   POST /api/clinic/crf
//   POST /api/clinic/review/:id
//   GET  /api/clinic/pending-reviews

export { getPendingReviews, reviewAssessment, submitAssessment as submitCRF } from '@/lib/api/assessments'

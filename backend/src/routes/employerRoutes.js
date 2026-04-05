import { Router } from 'express';
import { updateProfile, createInternship, getMyInternships, getInternshipApplicants, updateApplicationStatus } from '../controllers/employerController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
router.use(authorizeRole('EMPLOYER'));
router.put('/profile', updateProfile);
router.post('/internships', createInternship);
router.get('/internships', getMyInternships);
router.get('/internships/:id/applicants', getInternshipApplicants);
router.put('/applications/:id/status', updateApplicationStatus);
export default router;
//# sourceMappingURL=employerRoutes.js.map
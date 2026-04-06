import { Router } from 'express';
import { getProfile, updateProfile, createInternship, getMyInternships, getInternshipApplicants, updateApplicationStatus, getApplicationHistory, updateInternship, deleteInternship } from '../controllers/employerController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRole('EMPLOYER'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/internships', createInternship);
router.get('/internships', getMyInternships);
router.put('/internships/:id', updateInternship);
router.delete('/internships/:id', deleteInternship);
router.get('/internships/:id/applicants', getInternshipApplicants);
router.get('/history', getApplicationHistory);
router.put('/applications/:id/status', updateApplicationStatus);

export default router;

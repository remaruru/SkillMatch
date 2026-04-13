import { Router } from 'express';
import { getSystemStats, suspendUser, deleteInternshipListing, getPendingEmployers, getPendingApplicants, approveUser, rejectUser, deleteUser } from '../controllers/adminController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRole('ADMIN'));

router.get('/stats', getSystemStats);
router.put('/users/:id/suspend', suspendUser);
router.delete('/internships/:id', deleteInternshipListing);

// Administration
router.get('/pending-employers', getPendingEmployers);
router.get('/pending-applicants', getPendingApplicants);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);
router.delete('/users/:id', deleteUser);

export default router;

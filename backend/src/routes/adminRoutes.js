import { Router } from 'express';
import { getSystemStats, suspendUser, deleteInternshipListing, getPendingEmployers, approveEmployer, rejectEmployer } from '../controllers/adminController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
router.use(authorizeRole('ADMIN'));
router.get('/stats', getSystemStats);
router.put('/users/:id/suspend', suspendUser);
router.delete('/internships/:id', deleteInternshipListing);
// Employer administration
router.get('/pending-employers', getPendingEmployers);
router.put('/approve/:id', approveEmployer);
router.put('/reject/:id', rejectEmployer);
export default router;
//# sourceMappingURL=adminRoutes.js.map
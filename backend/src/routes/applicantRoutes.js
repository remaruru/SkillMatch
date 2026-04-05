import { Router } from 'express';
import { updateProfile, getMyApplications, applyToInternship } from '../controllers/applicantController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
router.use(authorizeRole('APPLICANT'));
router.put('/profile', updateProfile);
router.get('/applications', getMyApplications);
router.post('/apply', applyToInternship);
// MOCK: Resume upload
router.post('/resume', (req, res) => {
    // Mock handling of securely uploaded resume
    res.status(200).json({ message: 'Resume uploaded securely', path: '/uploads/resumes/mock_resume.pdf' });
});
export default router;
//# sourceMappingURL=applicantRoutes.js.map
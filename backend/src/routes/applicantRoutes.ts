import { Router } from 'express';
import { updateProfile, getMyApplications, applyToInternship, uploadResume } from '../controllers/applicantController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
import { upload } from '../utils/uploadHelpers.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRole('APPLICANT'));

router.put('/profile', updateProfile);
router.get('/applications', getMyApplications);
router.post('/apply', upload.single('resume'), applyToInternship);

// Real Resume upload endpoint with PDF Validation
router.post('/resume', upload.single('resume'), uploadResume);

export default router;

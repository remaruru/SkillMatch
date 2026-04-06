import { Router } from 'express';
import { getProfile, updateProfile, getMyApplications, applyToInternship, uploadResume } from '../controllers/applicantController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
import { upload } from '../utils/uploadHelpers.js';
const router = Router();
router.use(authenticate);
router.use(authorizeRole('APPLICANT'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/applications', getMyApplications);
router.post('/apply', upload.single('resume'), applyToInternship);
// Resume upload — PDF only, triggers Gemini AI skill extraction
// Multer error handler wrapper ensures file-type errors return proper 400
router.post('/resume', (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err) {
            // Multer threw an error (e.g. wrong file type, size exceeded)
            return res.status(400).json({ error: err.message || 'File upload failed' });
        }
        next();
    });
}, uploadResume);
export default router;
//# sourceMappingURL=applicantRoutes.js.map
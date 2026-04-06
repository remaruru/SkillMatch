import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../utils/uploadHelpers.js';
const router = Router();
router.post('/register', upload.single('schoolId'), register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
export default router;
//# sourceMappingURL=authRoutes.js.map
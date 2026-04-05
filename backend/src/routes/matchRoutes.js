import { Router } from 'express';
import { getMyMatches } from '../controllers/matchController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
router.use(authorizeRole('APPLICANT'));
router.get('/', getMyMatches);
export default router;
//# sourceMappingURL=matchRoutes.js.map
import { Router } from 'express';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.put('/mark-all-read', markAllNotificationsRead);
router.put('/:id/read', markNotificationRead);

export default router;

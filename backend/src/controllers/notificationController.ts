import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const notifications = await (prisma as any).notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving notifications' });
    }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const notification = await prisma.notification.update({
            where: { id: Number(id) },
            data: { isRead: true }
        });

        res.status(200).json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error marking notification read' });
    }
};

export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        await (prisma as any).notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error marking notifications read' });
    }
};

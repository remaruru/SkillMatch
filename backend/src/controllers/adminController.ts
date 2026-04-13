import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';


export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const usersCount = await prisma.user.count();
        const internshipsCount = await prisma.internship.count();
        const applicationsCount = await prisma.application.count();

        res.status(200).json({
            users: usersCount,
            internships: internshipsCount,
            applications: applicationsCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching stats' });
    }
};

export const suspendUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isActive: false }
        });

        res.status(200).json({ message: 'User suspended', user: { id: user.id, isActive: user.isActive } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error suspending user' });
    }
};

export const deleteInternshipListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.internship.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({ message: 'Internship removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error removing internship' });
    }
};
export const getPendingEmployers = async (req: Request, res: Response): Promise<void> => {
    try {
        const pendingEmployers = await prisma.user.findMany({
            where: { role: 'EMPLOYER', accountStatus: 'PENDING' } as any,
            select: {
                id: true,
                email: true,
                createdAt: true,
                employerProfile: {
                    select: { companyName: true, industry: true }
                }
            }
        });
        res.status(200).json(pendingEmployers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching pending employers' });
    }
};

export const getPendingApplicants = async (req: Request, res: Response): Promise<void> => {
    try {
        const { docFilter } = req.query;
        let whereClause: any = { role: 'APPLICANT', accountStatus: 'PENDING' };

        if (docFilter === 'withResume') whereClause.applicantProfile = { is: { resumePath: { not: null } } };
        else if (docFilter === 'withoutResume') whereClause.applicantProfile = { is: { resumePath: null } };
        else if (docFilter === 'withSchoolId') whereClause.schoolIdPath = { not: null };
        else if (docFilter === 'withoutSchoolId') whereClause.schoolIdPath = null;
        else if (docFilter === 'complete') {
             whereClause.schoolIdPath = { not: null };
             whereClause.applicantProfile = { is: { resumePath: { not: null } } };
        } else if (docFilter === 'incomplete') {
             whereClause.OR = [
                 { schoolIdPath: null },
                 { applicantProfile: { is: { resumePath: null } } }
             ];
        }

        const pendingApplicants = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                schoolIdPath: true,
                applicantProfile: {
                    select: {
                        course: true,
                        yearLevel: true,
                        resumePath: true
                    }
                }
            } as any
        });
        res.status(200).json(pendingApplicants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching pending applicants' });
    }
};

export const approveUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { accountStatus: 'APPROVED' } as any
        });
        res.status(200).json({ message: 'User approved', user: { id: user.id } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error approving user' });
    }
};

export const rejectUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.user.update({
            where: { id: Number(id) },
            data: { accountStatus: 'REJECTED' } as any
        });
        res.status(200).json({ message: 'User rejected and removed from system' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error rejecting user' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: 'User permanently deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting user' });
    }
};


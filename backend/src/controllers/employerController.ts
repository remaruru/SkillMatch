import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { companyName, industry, location, description } = req.body;

        const updatedProfile = await prisma.employerProfile.upsert({
            where: { userId },
            update: { companyName, industry, location, description },
            create: { userId, companyName: companyName || 'Company', industry, location, description },
        });

        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating company profile' });
    }
};

export const createInternship = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const employer = await prisma.employerProfile.findUnique({ where: { userId } });

        if (!employer) {
            res.status(400).json({ error: 'Employer profile required' });
            return;
        }

        const { title, description, location, latitude, longitude, skills } = req.body;

        let skillConnections: any = [];
        if (skills && Array.isArray(skills)) {
            const skillIds = await Promise.all(
                skills.map(async (skillName: string) => {
                    const skill = await prisma.skill.upsert({
                        where: { name: skillName.trim().toLowerCase() },
                        update: {},
                        create: { name: skillName.trim().toLowerCase() },
                    });
                    return { id: skill.id };
                })
            );
            skillConnections = skillIds;
        }

        const internship = await prisma.internship.create({
            data: {
                employerId: employer.id,
                title,
                description,
                location,
                latitude,
                longitude,
                skills: { connect: skillConnections }
            } as any,
            include: { skills: true }
        });

        res.status(201).json(internship);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating internship' });
    }
};

export const getMyInternships = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const employer = await prisma.employerProfile.findUnique({ where: { userId } });

        if (!employer) return;

        const internships = await prisma.internship.findMany({
            where: { employerId: employer.id },
            include: { skills: true, _count: { select: { applications: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(internships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving internships' });
    }
};

export const getInternshipApplicants = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const employer = await prisma.employerProfile.findUnique({ where: { userId } });
        const internship = await prisma.internship.findUnique({ where: { id: Number(id) } });

        if (!employer || !internship || internship.employerId !== employer.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const applications = await prisma.application.findMany({
            where: { internshipId: Number(id) },
            include: {
                applicant: {
                    select: { id: true, name: true, email: true, applicantProfile: { include: { skills: true } } }
                }
            }
        });

        const matches = await (prisma as any).match.findMany({
            where: { internshipId: Number(id) }
        });

        const appsWithMatches = applications.map(app => {
             const match = matches.find((m: any) => m.applicantId === app.applicant.id);
             return {
                 ...app,
                 matchScore: match ? match.matchScore : null,
                 matchDetails: match?.matchDetails ? match.matchDetails : null
             };
        });

        res.status(200).json(appsWithMatches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving applicants' });
    }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // applicationId
        const { status } = req.body;

        const application = await prisma.application.update({
            where: { id: Number(id) },
            data: { status },
            include: { internship: true }
        });

        // Trigger Notification to Applicant if Status changes
        await (prisma as any).notification.create({
            data: {
                userId: application.applicantId,
                message: `Your application status for ${application.internship.title} was updated to ${status}.`,
                link: '/applicant'
            }
        });

        res.status(200).json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating application status' });
    }
};

export const getApplicationHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const employer = await prisma.employerProfile.findUnique({ where: { userId } });
        if (!employer) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const applications = await prisma.application.findMany({
            where: { internship: { employerId: employer.id } },
            include: {
                internship: { select: { title: true } },
                applicant: { select: { name: true, email: true } }
            },
            orderBy: { appliedAt: 'desc' }
        });

        res.status(200).json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving application history' });
    }
};

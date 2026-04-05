import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { extractTextFromPDF } from '../services/resumeParser.service.js';
import { extractSkillsFromText } from '../services/llm.service.js';
import { calculateMatches } from '../services/matchingService.js';

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { course, yearLevel, locationPreference, latitude, longitude, skills, resumePath } = req.body;

        // Handle skills update
        let skillConnectionsSet: any = { set: [] };
        let skillConnectionsConnect: any = { connect: [] };

        if (skills && Array.isArray(skills)) {
            // Create skills if they don't exist and map to IDs
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
            skillConnectionsSet = { set: skillIds };
            skillConnectionsConnect = { connect: skillIds };
        }

        const updatedProfile = await (prisma as any).applicantProfile.upsert({
            where: { userId },
            update: {
                course,
                yearLevel,
                locationPreference,
                latitude,
                longitude,
                resumePath: resumePath || undefined,
                skills: skillConnectionsSet,
            },
            create: {
                userId,
                course,
                yearLevel,
                locationPreference,
                latitude,
                longitude,
                resumePath: resumePath || undefined,
                skills: skillConnectionsConnect,
            },
            include: { skills: true },
        });

        // Recalculate AI matches efficiently in the background
        setImmediate(async () => {
             try { await calculateMatches(userId); } catch (e) { console.error('Match recalc error:', e); }
        });

        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating profile' });
    }
};

export const applyToInternship = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { internshipId, coverMessage } = req.body;
        const resumeFile = (req as any).file;

        if (!resumeFile) {
            res.status(400).json({ error: 'Resume (PDF) is required' });
            return;
        }

        const existingApplication = await prisma.application.findUnique({
            where: { applicantId_internshipId: { applicantId: userId, internshipId: Number(internshipId) } },
        });

        if (existingApplication) {
            res.status(400).json({ error: 'You have already applied to this internship' });
            return;
        }

        const application = await (prisma as any).application.create({
            data: {
                applicantId: userId,
                internshipId: Number(internshipId),
                resumePath: `/uploads/${resumeFile.filename}`,
                coverMessage: coverMessage || null
            },
        });

        res.status(201).json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error applying for internship' });
    }
};

export const getMyApplications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const applications = await prisma.application.findMany({
            where: { applicantId: userId },
            include: {
                internship: {
                    include: { employer: { include: { user: { select: { name: true } } } } }
                }
            },
            orderBy: { appliedAt: 'desc' }
        });

        res.status(200).json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving applications' });
    }
};

export const uploadResume = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const resumeFile = (req as any).file;

        if (!resumeFile) {
            res.status(400).json({ error: 'Resume (PDF) is required' });
            return;
        }

        const resumePath = `/uploads/${resumeFile.filename}`;
        const absolutePath = resumeFile.path;

        // 1. Extract raw text from PDF
        const resumeText = await extractTextFromPDF(absolutePath);

        // 2. Extract technical skills using LLM
        const extractedSkills = await extractSkillsFromText(resumeText);

        // 3. Optional: save path to DB immediately
        await (prisma as any).applicantProfile.upsert({
            where: { userId },
            update: { resumePath },
            create: { userId, resumePath }
        });

        if (extractedSkills.length > 0) {
            // Update Applicant Profile Skills automatically
            const skillIds = await Promise.all(
                extractedSkills.map(async (skillName: string) => {
                    const skill = await prisma.skill.upsert({
                        where: { name: skillName.trim().toLowerCase() },
                        update: {},
                        create: { name: skillName.trim().toLowerCase() },
                    });
                    return { id: skill.id };
                })
            );

            await (prisma as any).applicantProfile.update({
                where: { userId },
                data: { skills: { connect: skillIds } }
            });
        }

        // 4. Trigger match engine (recalculate scores)
        setImmediate(async () => {
             try { await calculateMatches(userId); } catch (e) { console.error('Match recalc error via upload:', e); }
        });

        res.status(200).json({
            message: 'Resume uploaded and processed successfully!',
            path: resumePath,
            skills: extractedSkills
        });
    } catch (error: any) {
        console.error('Upload Process Error:', error);
        res.status(400).json({ error: 'Error processing resume', message: error.message });
    }
};

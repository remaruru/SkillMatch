import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { course, yearLevel, locationPreference, skills, resumePath } = req.body;
        // Handle skills update
        let skillConnections = { set: [] };
        if (skills && Array.isArray(skills)) {
            // Create skills if they don't exist and map to IDs
            const skillIds = await Promise.all(skills.map(async (skillName) => {
                const skill = await prisma.skill.upsert({
                    where: { name: skillName.trim().toLowerCase() },
                    update: {},
                    create: { name: skillName.trim().toLowerCase() },
                });
                return { id: skill.id };
            }));
            skillConnections = { set: skillIds };
        }
        const updatedProfile = await prisma.applicantProfile.upsert({
            where: { userId },
            update: {
                course,
                yearLevel,
                locationPreference,
                resumePath: resumePath || undefined,
                skills: skillConnections,
            },
            create: {
                userId,
                course,
                yearLevel,
                locationPreference,
                resumePath: resumePath || undefined,
                skills: skillConnections,
            },
            include: { skills: true },
        });
        res.status(200).json(updatedProfile);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating profile' });
    }
};
export const applyToInternship = async (req, res) => {
    try {
        const userId = req.user.id;
        const { internshipId } = req.body;
        const existingApplication = await prisma.application.findUnique({
            where: { applicantId_internshipId: { applicantId: userId, internshipId: Number(internshipId) } },
        });
        if (existingApplication) {
            res.status(400).json({ error: 'You have already applied to this internship' });
            return;
        }
        const application = await prisma.application.create({
            data: {
                applicantId: userId,
                internshipId: Number(internshipId),
            },
        });
        res.status(201).json(application);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error applying for internship' });
    }
};
export const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving applications' });
    }
};
//# sourceMappingURL=applicantController.js.map
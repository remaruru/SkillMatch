import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { companyName, industry, location, description } = req.body;
        const updatedProfile = await prisma.employerProfile.upsert({
            where: { userId },
            update: { companyName, industry, location, description },
            create: { userId, companyName: companyName || 'Company', industry, location, description },
        });
        res.status(200).json(updatedProfile);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating company profile' });
    }
};
export const createInternship = async (req, res) => {
    try {
        const userId = req.user.id;
        const employer = await prisma.employerProfile.findUnique({ where: { userId } });
        if (!employer) {
            res.status(400).json({ error: 'Employer profile required' });
            return;
        }
        const { title, description, location, skills } = req.body;
        let skillConnections = [];
        if (skills && Array.isArray(skills)) {
            const skillIds = await Promise.all(skills.map(async (skillName) => {
                const skill = await prisma.skill.upsert({
                    where: { name: skillName.trim().toLowerCase() },
                    update: {},
                    create: { name: skillName.trim().toLowerCase() },
                });
                return { id: skill.id };
            }));
            skillConnections = skillIds;
        }
        const internship = await prisma.internship.create({
            data: {
                employerId: employer.id,
                title,
                description,
                location,
                skills: { connect: skillConnections }
            },
            include: { skills: true }
        });
        res.status(201).json(internship);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating internship' });
    }
};
export const getMyInternships = async (req, res) => {
    try {
        const userId = req.user.id;
        const employer = await prisma.employerProfile.findUnique({ where: { userId } });
        if (!employer)
            return;
        const internships = await prisma.internship.findMany({
            where: { employerId: employer.id },
            include: { skills: true, _count: { select: { applications: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(internships);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving internships' });
    }
};
export const getInternshipApplicants = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
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
                    select: { name: true, email: true, applicantProfile: { include: { skills: true } } }
                }
            }
        });
        res.status(200).json(applications);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving applicants' });
    }
};
export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params; // applicationId
        const { status } = req.body;
        const application = await prisma.application.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.status(200).json(application);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating application status' });
    }
};
//# sourceMappingURL=employerController.js.map
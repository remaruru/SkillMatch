import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { companyName, industry, location, latitude, longitude, description } = req.body;
        const updatedProfile = await prisma.employerProfile.upsert({
            where: { userId },
            update: { companyName, industry, location, latitude, longitude, description },
            create: { userId, companyName: companyName || 'Company', industry, location, latitude, longitude, description },
        });
        res.status(200).json(updatedProfile);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating company profile' });
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await prisma.employerProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            res.status(200).json({ companyName: '', industry: '', location: '', latitude: 14.5995, longitude: 120.9842, description: '' });
            return;
        }
        res.status(200).json(profile);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching profile' });
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
        const { title, description, location, latitude, longitude, skills } = req.body;
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
                latitude,
                longitude,
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
                    select: { id: true, name: true, email: true, applicantProfile: { include: { skills: true } } }
                }
            }
        });
        const matches = await prisma.match.findMany({
            where: { internshipId: Number(id) }
        });
        const appsWithMatches = applications.map(app => {
            const match = matches.find((m) => m.applicantId === app.applicant.id);
            return {
                ...app,
                matchScore: match ? match.matchScore : null,
                matchDetails: match?.matchDetails ? match.matchDetails : null
            };
        });
        res.status(200).json(appsWithMatches);
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
            data: { status },
            include: { internship: true }
        });
        // Trigger Notification to Applicant if Status changes
        await prisma.notification.create({
            data: {
                userId: application.applicantId,
                message: `Your application status for ${application.internship.title} was updated to ${status}.`,
                link: '/applicant'
            }
        });
        res.status(200).json(application);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating application status' });
    }
};
export const updateInternship = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const employer = await prisma.employerProfile.findUnique({ where: { userId } });
        if (!employer) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        const internship = await prisma.internship.findUnique({ where: { id: Number(id) } });
        if (!internship || internship.employerId !== employer.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        const { title, description, location, latitude, longitude, skills } = req.body;
        let skillConnections = [];
        if (skills && Array.isArray(skills)) {
            skillConnections = await Promise.all(skills.map(async (skillName) => {
                const skill = await prisma.skill.upsert({
                    where: { name: skillName.trim().toLowerCase() },
                    update: {},
                    create: { name: skillName.trim().toLowerCase() },
                });
                return { id: skill.id };
            }));
        }
        const updated = await prisma.internship.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                location,
                latitude,
                longitude,
                skills: { set: skillConnections },
            },
            include: { skills: true, _count: { select: { applications: true } } },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating internship' });
    }
};
export const deleteInternship = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const employer = await prisma.employerProfile.findUnique({ where: { userId } });
        if (!employer) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        const internship = await prisma.internship.findUnique({ where: { id: Number(id) } });
        if (!internship || internship.employerId !== employer.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        // Delete dependent applications and matches first
        await prisma.application.deleteMany({ where: { internshipId: Number(id) } });
        await prisma.match.deleteMany({ where: { internshipId: Number(id) } });
        await prisma.internship.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: 'Internship deleted' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting internship' });
    }
};
export const getApplicationHistory = async (req, res) => {
    try {
        const userId = req.user.id;
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving application history' });
    }
};
//# sourceMappingURL=employerController.js.map
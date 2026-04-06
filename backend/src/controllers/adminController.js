import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const getSystemStats = async (req, res) => {
    try {
        const usersCount = await prisma.user.count();
        const internshipsCount = await prisma.internship.count();
        const applicationsCount = await prisma.application.count();
        res.status(200).json({
            users: usersCount,
            internships: internshipsCount,
            applications: applicationsCount
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching stats' });
    }
};
export const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isActive: false }
        });
        res.status(200).json({ message: 'User suspended', user: { id: user.id, isActive: user.isActive } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error suspending user' });
    }
};
export const deleteInternshipListing = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.internship.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: 'Internship removed' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error removing internship' });
    }
};
export const getPendingEmployers = async (req, res) => {
    try {
        const pendingEmployers = await prisma.user.findMany({
            where: { role: 'EMPLOYER', accountStatus: 'PENDING' },
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching pending employers' });
    }
};
export const getPendingApplicants = async (req, res) => {
    try {
        const { docFilter } = req.query;
        let whereClause = { role: 'APPLICANT', accountStatus: 'PENDING' };
        if (docFilter === 'withResume')
            whereClause.applicantProfile = { is: { resumePath: { not: null } } };
        else if (docFilter === 'withoutResume')
            whereClause.applicantProfile = { is: { resumePath: null } };
        else if (docFilter === 'withSchoolId')
            whereClause.schoolIdPath = { not: null };
        else if (docFilter === 'withoutSchoolId')
            whereClause.schoolIdPath = null;
        else if (docFilter === 'complete') {
            whereClause.schoolIdPath = { not: null };
            whereClause.applicantProfile = { is: { resumePath: { not: null } } };
        }
        else if (docFilter === 'incomplete') {
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
            }
        });
        res.status(200).json(pendingApplicants);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching pending applicants' });
    }
};
export const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { accountStatus: 'APPROVED' }
        });
        res.status(200).json({ message: 'User approved', user: { id: user.id } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error approving user' });
    }
};
export const rejectUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.update({
            where: { id: Number(id) },
            data: { accountStatus: 'REJECTED' }
        });
        res.status(200).json({ message: 'User rejected and removed from system' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error rejecting user' });
    }
};
//# sourceMappingURL=adminController.js.map
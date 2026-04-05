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
            where: { role: 'EMPLOYER', isApproved: false },
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
export const approveEmployer = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isApproved: true }
        });
        res.status(200).json({ message: 'Employer approved', user: { id: user.id } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error approving employer' });
    }
};
export const rejectEmployer = async (req, res) => {
    try {
        const { id } = req.params;
        // Optionally delete the user entirely, or just keep them permanently unapproved/inactive
        await prisma.user.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: 'Employer rejected and removed from system' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error rejecting employer' });
    }
};
//# sourceMappingURL=adminController.js.map
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-skillmatch-dev';
export const register = async (req, res) => {
    try {
        const { name, email, password, role, course, yearLevel, skills, companyName, industry } = req.body;
        if (!name || !email || !password || !role) {
            res.status(400).json({ error: 'Name, email, password, and role are required' });
            return;
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email is already taken' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const validRole = role === 'EMPLOYER' ? 'EMPLOYER' : role === 'ADMIN' ? 'ADMIN' : 'APPLICANT';
        const isApproved = validRole === 'EMPLOYER' ? false : true;
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: validRole,
                isApproved
            },
        });
        if (validRole === 'APPLICANT') {
            await prisma.applicantProfile.create({
                data: {
                    userId: user.id,
                    course: course || null,
                    yearLevel: yearLevel || null,
                }
            });
            // Handle optional array of skill strings
            if (skills && Array.isArray(skills)) {
                for (const skillName of skills) {
                    // find or create skill
                    const skill = await prisma.skill.upsert({
                        where: { name: skillName },
                        update: {},
                        create: { name: skillName }
                    });
                    // Link skill to applicant profile
                    await prisma.applicantProfile.update({
                        where: { userId: user.id },
                        data: {
                            skills: { connect: { id: skill.id } }
                        }
                    });
                }
            }
        }
        else if (validRole === 'EMPLOYER') {
            await prisma.employerProfile.create({
                data: {
                    userId: user.id,
                    companyName: companyName || name,
                    industry: industry || null
                }
            });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved }, token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating user' });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }
        if (user.role === 'EMPLOYER' && !user.isApproved) {
            res.status(403).json({ error: 'Your account is pending admin approval.' });
            return;
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved }, token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error logging in' });
    }
};
export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
};
//# sourceMappingURL=authController.js.map
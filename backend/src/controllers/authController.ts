import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-skillmatch-dev';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, course, yearLevel, companyName, industry } = req.body;

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
        const validRole = role === 'EMPLOYER' ? 'EMPLOYER' : 'APPLICANT';
        const schoolIdPath = req.file ? req.file.path : null;

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: validRole,
                accountStatus: 'PENDING',
                schoolIdPath: validRole === 'APPLICANT' ? schoolIdPath : null,
            } as any,
        });

        if (validRole === 'APPLICANT') {
            await prisma.applicantProfile.create({
                data: {
                    userId: user.id,
                    course: course || null,
                    yearLevel: yearLevel || null,
                }
            });
            // Skills are NOT seeded at registration.
            // They are extracted from a PDF resume upload after account approval.
        } else if (validRole === 'EMPLOYER') {
            await prisma.employerProfile.create({
                data: {
                    userId: user.id,
                    companyName: companyName || name,
                    industry: industry || null
                }
            });
        }

        res.status(201).json({ message: 'Registration Submitted! Pending Admin Approval.', status: 'pending', user: { id: user.id, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating user' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
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

        if (user.role !== 'ADMIN') {
            if ((user as any).accountStatus === 'PENDING') {
                res.status(403).json({ error: 'Your account is awaiting admin approval.' });
                return;
            }

            if ((user as any).accountStatus === 'REJECTED') {
                res.status(403).json({ error: 'Your account registration was rejected. Please contact support.' });
                return;
            }
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, accountStatus: (user as any).accountStatus }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
};

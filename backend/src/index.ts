import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import applicantRoutes from './routes/applicantRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173']
    : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applicant', applicantRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('SkillMatch API is running');
});

// Basic Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

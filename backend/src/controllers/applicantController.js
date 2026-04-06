import { PrismaClient } from '@prisma/client';
import { extractTextFromPDF } from '../services/resumeParser.service.js';
import { extractSkillsFromText } from '../services/llm.service.js';
import { calculateMatches } from '../services/matchingService.js';
const prisma = new PrismaClient();
// GET /applicant/profile — return current applicant profile with skills
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: { skills: true }
        });
        if (!profile) {
            // Return empty profile shell if not created yet (shouldn't happen after registration)
            res.status(200).json({ course: null, yearLevel: null, locationPreference: null, latitude: null, longitude: null, resumePath: null, skills: [] });
            return;
        }
        res.status(200).json(profile);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        // Skills are intentionally excluded — they come from resume upload only
        const { course, yearLevel, locationPreference, latitude, longitude, resumePath } = req.body;
        const updatedProfile = await prisma.applicantProfile.upsert({
            where: { userId },
            update: {
                course,
                yearLevel,
                locationPreference,
                latitude,
                longitude,
                resumePath: resumePath || undefined,
            },
            create: {
                userId,
                course,
                yearLevel,
                locationPreference,
                latitude,
                longitude,
                resumePath: resumePath || undefined,
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
        const { internshipId, coverMessage } = req.body;
        const resumeFile = req.file;
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
        const application = await prisma.application.create({
            data: {
                applicantId: userId,
                internshipId: Number(internshipId),
                resumePath: `/uploads/${resumeFile.filename}`,
                coverMessage: coverMessage || null
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
            select: {
                id: true,
                status: true,
                appliedAt: true,
                resumePath: true,
                coverMessage: true,
                internship: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        employer: { include: { user: { select: { name: true } } } }
                    }
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
export const uploadResume = async (req, res) => {
    try {
        const userId = req.user.id;
        const resumeFile = req.file;
        if (!resumeFile) {
            res.status(400).json({ error: 'Resume (PDF) is required' });
            return;
        }
        const resumePath = `/uploads/${resumeFile.filename}`;
        const absolutePath = resumeFile.path;
        // 1. Extract raw text from PDF
        const resumeText = await extractTextFromPDF(absolutePath);
        // 2. Extract skills: Gemini AI first, keyword fallback if needed
        let extractedSkills = [];
        let usedFallback = false;
        const result = await extractSkillsFromText(resumeText);
        extractedSkills = result.skills;
        usedFallback = result.usedFallback;
        console.log(`[Upload] Skills extracted: ${extractedSkills.length} (fallback: ${usedFallback})`);
        // 3. Save resume path to profile
        await prisma.applicantProfile.upsert({
            where: { userId },
            update: { resumePath },
            create: { userId, resumePath }
        });
        // 4. Save skills — normalize to consistent display form before upserting
        //    This ensures "Python" matches "python" in matching (upserted by lowercase key)
        if (extractedSkills.length > 0) {
            const skillIds = await Promise.all(extractedSkills.map(async (skillName) => {
                const displayName = skillName.trim();
                const skill = await prisma.skill.upsert({
                    where: { name: displayName },
                    update: {},
                    create: { name: displayName },
                });
                return { id: skill.id };
            }));
            await prisma.applicantProfile.update({
                where: { userId },
                data: { skills: { set: skillIds } }
            });
        }
        else {
            // No skills at all — clear stale skills from previous upload
            await prisma.applicantProfile.update({
                where: { userId },
                data: { skills: { set: [] } }
            });
        }
        // 5. Trigger match recalculation whenever we have skills
        if (extractedSkills.length > 0) {
            setImmediate(async () => {
                try {
                    await calculateMatches(userId);
                }
                catch (e) {
                    console.error('Match recalc error:', e);
                }
            });
        }
        const message = usedFallback
            ? (extractedSkills.length === 0
                ? 'Resume uploaded! The AI is currently taking a break, and no standard keywords were found in your resume.'
                : `Resume uploaded! The AI is currently taking a break, but we extracted ${extractedSkills.length} skills via our fallback system.`)
            : (extractedSkills.length === 0
                ? 'Resume uploaded but no professional skills were detected. Try a text-based PDF with clearly listed skills.'
                : `Resume uploaded and ${extractedSkills.length} skills extracted by AI successfully!`);
        res.status(200).json({
            message,
            path: resumePath,
            skills: extractedSkills,
            usedFallback
        });
    }
    catch (error) {
        console.error('Upload Process Error:', error);
        res.status(400).json({ error: 'Error processing resume', message: error.message });
    }
};
//# sourceMappingURL=applicantController.js.map
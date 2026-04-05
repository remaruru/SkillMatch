import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const calculateMatches = async (userId: number) => {
    // Get applicant profile and their skills
    const applicant = await prisma.applicantProfile.findUnique({
        where: { userId },
        include: { skills: true }
    });

    if (!applicant) {
        throw new Error('Applicant profile not found');
    }

    const applicantSkillIds = applicant.skills.map(s => s.id);

    // Get all internships with their required skills
    const internships = await prisma.internship.findMany({
        include: {
            skills: true,
            employer: {
                include: { user: { select: { name: true } } }
            }
        }
    });

    const recommendations = internships.map(internship => {
        const requiredSkillsCount = internship.skills.length;

        let matchedSkillsCount = 0;
        const matchedSkills: { id: number, name: string }[] = [];
        const missingSkills: { id: number, name: string }[] = [];

        if (requiredSkillsCount > 0) {
            internship.skills.forEach(skill => {
                if (applicantSkillIds.includes(skill.id)) {
                    matchedSkillsCount++;
                    matchedSkills.push(skill);
                } else {
                    missingSkills.push(skill);
                }
            });
        }

        // Calculate score
        const matchScore = requiredSkillsCount === 0
            ? 100 // If no skills required, it's a 100% match technically
            : Math.round((matchedSkillsCount / requiredSkillsCount) * 100);

        return {
            ...internship,
            matchScore,
            matchedSkills,
            missingSkills
        };
    });

    // Sort by descending match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Take top 10 matches
    const topMatches = recommendations.slice(0, 10);

    // Store match results asynchronously in DB (background processing)
    Promise.all(topMatches.map(async match => {
        try {
            await (prisma as any).match.upsert({
                where: { applicantId_internshipId: { applicantId: userId, internshipId: match.id } } as any,
                update: { matchScore: match.matchScore, matchDetails: { matchedSkills: match.matchedSkills, missingSkills: match.missingSkills } },
                create: { applicantId: userId, internshipId: match.id, matchScore: match.matchScore, matchDetails: { matchedSkills: match.matchedSkills, missingSkills: match.missingSkills } }
            });
        } catch (err) {
            console.error("Error storing match score for internship ID:", match.id, err);
        }
    })).catch(err => console.error("Error in batch storing match scores:", err));

    return topMatches;
};

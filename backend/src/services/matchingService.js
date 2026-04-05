import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const calculateMatches = async (userId) => {
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
        if (requiredSkillsCount > 0) {
            internship.skills.forEach(skill => {
                if (applicantSkillIds.includes(skill.id)) {
                    matchedSkillsCount++;
                }
            });
        }
        // Calculate score
        const matchScore = requiredSkillsCount === 0
            ? 100 // If no skills required, it's a 100% match technically
            : Math.round((matchedSkillsCount / requiredSkillsCount) * 100);
        return {
            ...internship,
            matchScore
        };
    });
    // Sort by descending match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    // Take top 10 matches
    const topMatches = recommendations.slice(0, 10);
    // Store match results asynchronously in DB (background processing)
    Promise.all(topMatches.map(async (match) => {
        try {
            await prisma.match.upsert({
                where: { applicantId_internshipId: { applicantId: userId, internshipId: match.id } },
                update: { matchScore: match.matchScore },
                create: { applicantId: userId, internshipId: match.id, matchScore: match.matchScore }
            });
        }
        catch (err) {
            console.error("Error storing match score for internship ID:", match.id, err);
        }
    })).catch(err => console.error("Error in batch storing match scores:", err));
    return topMatches;
};
//# sourceMappingURL=matchingService.js.map
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/** Confidence level based on match score */
const getConfidence = (score) => {
    if (score >= 71)
        return 'High';
    if (score >= 41)
        return 'Medium';
    return 'Low';
};
/** Generate a human-readable match explanation */
const generateReason = (matchScore, matchedSkills, missingSkills) => {
    const matched = matchedSkills.map(s => s.name);
    const missing = missingSkills.map(s => s.name);
    if (missingSkills.length === 0 && matchedSkills.length > 0) {
        return `The applicant fully meets all required technical skills for this internship, including ${matched.join(', ')}.`;
    }
    if (matchedSkills.length === 0 && missingSkills.length > 0) {
        return `The applicant currently does not meet the required technical skills for this internship. Skills needed: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ', and more' : ''}.`;
    }
    if (matchScore >= 71) {
        const missingNote = missing.length > 0 ? ` Additional experience in ${missing.slice(0, 2).join(' and ')} could further strengthen the candidacy.` : '';
        return `The applicant is a strong match, meeting most required skills including ${matched.slice(0, 3).join(', ')}.${missingNote}`;
    }
    if (matchScore >= 41) {
        return `The applicant meets some of the required technical skills (${matched.slice(0, 3).join(', ')}) but lacks experience in ${missing.slice(0, 3).join(', ')}.`;
    }
    return `The applicant matches a few skills (${matched.slice(0, 2).join(', ') || 'none'}) but is missing several key requirements: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ', and others' : ''}.`;
};
export const calculateMatches = async (userId) => {
    const applicant = await prisma.applicantProfile.findUnique({
        where: { userId },
        include: { skills: true }
    });
    if (!applicant) {
        throw new Error('Applicant profile not found');
    }
    // Case-insensitive name comparison — fixes "Python" vs "python" ID mismatch
    const applicantSkillNames = new Set(applicant.skills.map(s => s.name.trim().toLowerCase()));
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
        const matchedSkills = [];
        const missingSkills = [];
        if (requiredSkillsCount > 0) {
            internship.skills.forEach(skill => {
                if (applicantSkillNames.has(skill.name.trim().toLowerCase())) {
                    matchedSkillsCount++;
                    matchedSkills.push(skill);
                }
                else {
                    missingSkills.push(skill);
                }
            });
        }
        const matchScore = requiredSkillsCount === 0
            ? 100
            : Math.round((matchedSkillsCount / requiredSkillsCount) * 100);
        const confidence = getConfidence(matchScore);
        const reason = generateReason(matchScore, matchedSkills, missingSkills);
        return {
            ...internship,
            matchScore,
            matchedSkills,
            missingSkills,
            matchDetails: {
                matchedSkills: matchedSkills.map(s => s.name),
                missingSkills: missingSkills.map(s => s.name),
                totalRequired: requiredSkillsCount,
                totalMatched: matchedSkillsCount,
                matchPercentage: matchScore,
                confidence,
                reason,
            }
        };
    });
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = recommendations.slice(0, 10);
    // Persist enriched match details in DB
    Promise.all(topMatches.map(async (match) => {
        try {
            await prisma.match.upsert({
                where: { applicantId_internshipId: { applicantId: userId, internshipId: match.id } },
                update: { matchScore: match.matchScore, matchDetails: match.matchDetails },
                create: { applicantId: userId, internshipId: match.id, matchScore: match.matchScore, matchDetails: match.matchDetails }
            });
        }
        catch (err) {
            console.error('Error storing match for internship ID:', match.id, err);
        }
    })).catch(err => console.error('Batch match storage error:', err));
    return topMatches;
};
//# sourceMappingURL=matchingService.js.map
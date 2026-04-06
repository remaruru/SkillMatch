export declare const calculateMatches: (userId: number) => Promise<{
    matchScore: number;
    matchedSkills: {
        id: number;
        name: string;
    }[];
    missingSkills: {
        id: number;
        name: string;
    }[];
    matchDetails: {
        matchedSkills: string[];
        missingSkills: string[];
        totalRequired: number;
        totalMatched: number;
        matchPercentage: number;
        confidence: "High" | "Medium" | "Low";
        reason: string;
    };
    employer: {
        user: {
            name: string;
        };
    } & {
        id: number;
        userId: number;
        description: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        companyName: string;
        industry: string | null;
    };
    skills: {
        name: string;
        id: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
    id: number;
    title: string;
    description: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    employerId: number;
}[]>;
//# sourceMappingURL=matchingService.d.ts.map
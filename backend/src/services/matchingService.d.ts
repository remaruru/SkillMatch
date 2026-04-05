export declare const calculateMatches: (userId: number) => Promise<{
    matchScore: number;
    skills: {
        name: string;
        id: number;
    }[];
    employer: {
        user: {
            name: string;
        };
    } & {
        id: number;
        companyName: string;
        industry: string | null;
        location: string | null;
        description: string | null;
        userId: number;
    };
    createdAt: Date;
    updatedAt: Date;
    id: number;
    location: string | null;
    description: string;
    title: string;
    employerId: number;
}[]>;
//# sourceMappingURL=matchingService.d.ts.map
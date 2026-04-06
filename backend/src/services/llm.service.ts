/**
 * LLM Service — Gemini AI Skill Extractor
 * Uses Gemini v1 REST API directly (bypasses SDK's v1beta limitation).
 * Includes a keyword-based fallback so empty extraction never happens on clear resumes.
 */

const apiKey = process.env.GEMINI_API_KEY || '';

// ── Normalization map: raw keyword → display name ────────────────────────────
const SKILL_NORMALIZATIONS: Record<string, string> = {
    'react.js': 'React', 'reactjs': 'React', 'react': 'React',
    'node.js': 'Node.js', 'nodejs': 'Node.js', 'node js': 'Node.js',
    'javascript': 'JavaScript', 'js': 'JavaScript',
    'typescript': 'TypeScript', 'ts': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'html': 'HTML', 'html5': 'HTML',
    'css': 'CSS', 'css3': 'CSS',
    'tailwindcss': 'TailwindCSS', 'tailwind css': 'TailwindCSS', 'tailwind': 'TailwindCSS',
    'bootstrap': 'Bootstrap',
    'sass': 'Sass', 'scss': 'Sass',
    'jquery': 'jQuery',
    'vue': 'Vue.js', 'vue.js': 'Vue.js', 'vuejs': 'Vue.js',
    'angular': 'Angular',
    'next.js': 'Next.js', 'nextjs': 'Next.js',
    'nuxt': 'Nuxt.js', 'nuxt.js': 'Nuxt.js',
    'svelte': 'Svelte',
    'express': 'Express', 'express.js': 'Express',
    'nestjs': 'NestJS', 'nest.js': 'NestJS',
    'fastapi': 'FastAPI',
    'flask': 'Flask',
    'django': 'Django',
    'spring': 'Spring Boot', 'spring boot': 'Spring Boot',
    'laravel': 'Laravel',
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL', 'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB', 'mongo': 'MongoDB',
    'sqlite': 'SQLite',
    'redis': 'Redis',
    'firebase': 'Firebase',
    'supabase': 'Supabase',
    'prisma': 'Prisma',
    'php': 'PHP',
    'c#': 'C#', 'csharp': 'C#',
    'c++': 'C++', 'cpp': 'C++',
    'c': 'C',
    'go': 'Go', 'golang': 'Go',
    'rust': 'Rust',
    'kotlin': 'Kotlin',
    'swift': 'Swift',
    'scala': 'Scala',
    'ruby': 'Ruby',
    'r': 'R',
    'matlab': 'MATLAB',
    'git': 'Git',
    'github': 'GitHub',
    'gitlab': 'GitLab',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes', 'k8s': 'Kubernetes',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'GCP',
    'linux': 'Linux',
    'bash': 'Bash',
    'machine learning': 'Machine Learning', 'ml': 'Machine Learning',
    'deep learning': 'Deep Learning', 'dl': 'Deep Learning',
    'tensorflow': 'TensorFlow',
    'pytorch': 'PyTorch',
    'scikit-learn': 'Scikit-learn', 'sklearn': 'Scikit-learn',
    'pandas': 'Pandas',
    'numpy': 'NumPy',
    'data science': 'Data Science',
    'data analysis': 'Data Analysis',
    'nlp': 'NLP', 'natural language processing': 'NLP',
    'computer vision': 'Computer Vision',
    'opencv': 'OpenCV',
    'figma': 'Figma',
    'photoshop': 'Photoshop',
    'illustrator': 'Illustrator',
    'ui/ux': 'UI/UX', 'ui ux': 'UI/UX',
    'android': 'Android',
    'ios': 'iOS',
    'react native': 'React Native',
    'flutter': 'Flutter',
    'rest api': 'REST API', 'restful': 'REST API', 'rest': 'REST API',
    'graphql': 'GraphQL',
    'websocket': 'WebSocket',
    'microservices': 'Microservices',
    'devops': 'DevOps',
    'ci/cd': 'CI/CD',
    'agile': 'Agile',
    'scrum': 'Scrum',
    'jest': 'Jest',
    'selenium': 'Selenium',
    'tableau': 'Tableau',
    'power bi': 'Power BI',
    'excel': 'Excel',
    'wordpress': 'WordPress',
    'iot': 'IoT',
    'arduino': 'Arduino',
    'raspberry pi': 'Raspberry Pi',
    'jupyter': 'Jupyter',
    // --- Professional & Non-IT Skills ---
    'project management': 'Project Management',
    'marketing': 'Marketing',
    'digital marketing': 'Digital Marketing',
    'sales': 'Sales',
    'accounting': 'Accounting',
    'finance': 'Finance',
    'financial modeling': 'Financial Modeling',
    'business analysis': 'Business Analysis',
    'human resources': 'Human Resources',
    'hr': 'Human Resources',
    'customer service': 'Customer Service',
    'data entry': 'Data Entry',
    'copywriting': 'Copywriting',
    'graphic design': 'Graphic Design',
    'autocad': 'AutoCAD',
    'solidworks': 'SolidWorks',
    'event planning': 'Event Planning',
    'logistics': 'Logistics',
    'supply chain': 'Supply Chain Management',
    'quality assurance': 'Quality Assurance',
    'qa': 'Quality Assurance',
    'social media marketing': 'Social Media Marketing',
    'seo': 'SEO',
    'content creation': 'Content Creation',
    'public relations': 'Public Relations',
    'pr': 'Public Relations',
    'nursing': 'Nursing',
    'cpr': 'CPR',
    'first aid': 'First Aid',
};

// Sorted longest-first so multi-word phrases ("machine learning") match before single words ("machine")
const KEYWORD_LIST = Object.keys(SKILL_NORMALIZATIONS)
    .sort((a, b) => b.length - a.length);

/**
 * Keyword-based fallback: scans raw resume text for known technical skills.
 * Used when Gemini is unavailable or returns empty results.
 */
export const extractSkillsFromKeywords = (text: string): string[] => {
    const lower = text.toLowerCase();
    const found = new Set<string>();

    for (const keyword of KEYWORD_LIST) {
        // Use word-boundary regex; escape special chars for C++, C#, etc.
        const escaped = keyword.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, 'i');
        if (regex.test(lower)) {
            const normalized = SKILL_NORMALIZATIONS[keyword];
            if (normalized) found.add(normalized);
        }
    }

    return Array.from(found);
};

/**
 * Gemini-based extraction using direct v1 REST API call (no SDK, no v1beta).
 */
export const extractSkillsFromText = async (resumeText: string): Promise<{ skills: string[], usedFallback: boolean }> => {
    // Always run keyword fallback (fast, local, no API)
    const fallbackSkills = extractSkillsFromKeywords(resumeText);

    if (!apiKey) {
        console.warn('[Gemini] No API key — using keyword fallback only.');
        return { skills: fallbackSkills, usedFallback: true };
    }

    const prompt = `You are a skill extraction engine. Read the resume text below and extract ALL professional, industry-specific, and technical skills.

STRICT OUTPUT FORMAT: Return ONLY a valid JSON array of strings. No markdown. No explanation. No code fences.
Example: ["Python", "Financial Modeling", "Digital Marketing", "Machine Learning", "Event Planning"]

Normalization rules:
- Format cleanly and consistently.
- Use full canonical names (e.g., "TensorFlow", "React", "Project Management").

Include: hard skills, technical skills, specific tools, software, methodologies, and domain-specific knowledge from ANY industry (e.g., IT, Business, Healthcare, Arts, Engineering).
Exclude: generic soft skills like communication, teamwork, leadership, time management, problem solving.

If no skills found, return: []

RESUME:
${resumeText.slice(0, 6000)}

JSON array only:`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.0, maxOutputTokens: 512 }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[Gemini] API error ${response.status} — using fallback. Detail: ${errText.slice(0, 200)}`);
            return { skills: fallbackSkills, usedFallback: true };
        }

        const data: any = await response.json();
        const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

        if (!rawText) {
            console.warn('[Gemini] Empty response — using fallback.');
            return { skills: fallbackSkills, usedFallback: true };
        }

        // Strip any accidental markdown fences
        const cleaned = rawText
            .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();

        let aiSkills: string[] = [];
        try {
            const parsed = JSON.parse(cleaned);
            aiSkills = Array.isArray(parsed) ? parsed.map((s: any) => String(s)) : [];
        } catch {
            console.warn('[Gemini] JSON parse failed — using fallback. Raw:', cleaned.slice(0, 100));
            return { skills: fallbackSkills, usedFallback: true };
        }

        // Merge Gemini result with fallback (union, deduplicated by lowercase name)
        const allSkills = [...aiSkills];
        const aiLower = new Set(aiSkills.map(s => s.toLowerCase()));
        for (const fb of fallbackSkills) {
            if (!aiLower.has(fb.toLowerCase())) allSkills.push(fb);
        }

        console.log(`[Gemini] Extracted ${aiSkills.length} skills via AI + ${allSkills.length - aiSkills.length} via fallback = ${allSkills.length} total`);
        return { skills: allSkills, usedFallback: false };

    } catch (error: any) {
        console.warn('[Gemini] Network/fetch error — using fallback:', error?.message);
        return { skills: fallbackSkills, usedFallback: true };
    }
};

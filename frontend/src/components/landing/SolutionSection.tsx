
import { motion } from 'framer-motion';
import { BrainCircuit, LineChart, LayoutTemplate, BriefcaseBusiness } from 'lucide-react';

const solutions = [
    {
        icon: BrainCircuit,
        title: "AI-Powered Matching",
        description: "Our proprietary algorithm analyzes skills, experience, and preferences to pair you with high-affinity opportunities."
    },
    {
        icon: LineChart,
        title: "Match Percentage Scoring",
        description: "Instantly see how well you fit a role with a clear percentage score based on real-time data analysis."
    },
    {
        icon: LayoutTemplate,
        title: "Smart Recommendations",
        description: "Get a personalized dashboard filled with internships ranked by relevance, not just recency."
    },
    {
        icon: BriefcaseBusiness,
        title: "Resume Skill Analysis (NLP)",
        description: "We automatically extract core competencies from your profile to build a comprehensive talent graph."
    }
];

export default function SolutionSection() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        className="text-3xl font-bold text-gray-900 sm:text-4xl"
                    >
                        How SkillMatch Solves This
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-lg text-gray-500"
                    >
                        Leveraging machine learning to bridge the gap between education and employment.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {solutions.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: false, amount: 0.1 }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex flex-col sm:flex-row gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                    <item.icon className="w-8 h-8" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

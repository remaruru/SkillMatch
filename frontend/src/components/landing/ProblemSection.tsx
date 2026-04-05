
import { motion } from 'framer-motion';
import { FileSearch, ActivitySquare, Frown } from 'lucide-react';

const problems = [
    {
        icon: FileSearch,
        title: "Manual Screening is Inefficient",
        description: "HR teams spend countless hours reviewing thousands of identical resumes manually, missing out on top hidden talent."
    },
    {
        icon: Frown,
        title: "Skill Mismatches Waste Opportunities",
        description: "Students apply to hundreds of roles they aren't qualified for, while companies struggle to find candidates with the exact stack."
    },
    {
        icon: ActivitySquare,
        title: "Students Struggle to Find Relevance",
        description: "Generic job boards lack context. Students don't know which roles actually align with their specific coursework and side projects."
    }
];

export default function ProblemSection() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        className="text-3xl font-bold text-gray-900 sm:text-4xl"
                    >
                        Why Traditional Internship Matching Fails
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-lg text-gray-500"
                    >
                        The disconnect between university talent and corporate expectations has never been wider.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {problems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.1 }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-transparent hover:border-gray-100 group"
                        >
                            <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-7 h-7 text-gray-600 group-hover:text-red-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

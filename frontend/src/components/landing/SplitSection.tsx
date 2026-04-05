
import { motion } from 'framer-motion';
import { GraduationCap, Building, CheckCircle2 } from 'lucide-react';

export default function SplitSection() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">

                    {/* Student Panel */}
                    <motion.div
                        id="students"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        className="bg-indigo-50 rounded-3xl p-10 lg:p-14 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <GraduationCap className="w-64 h-64 text-indigo-700" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                                <GraduationCap className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Students</h2>
                            <ul className="space-y-5">
                                {[
                                    "Discover internships aligned with your skills",
                                    "View match scores before applying",
                                    "Track application status in real-time",
                                    "Stop guessing what employers want"
                                ].map((text, i) => (
                                    <li key={i} className="flex items-start">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0" />
                                        <span className="text-lg text-gray-700">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Employer Panel */}
                    <motion.div
                        id="employers"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        className="bg-cyan-50 rounded-3xl p-10 lg:p-14 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Building className="w-64 h-64 text-cyan-700" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                                <Building className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Employers</h2>
                            <ul className="space-y-5">
                                {[
                                    "Post internship listings in minutes",
                                    "View pre-ranked applicant pools",
                                    "Find the best-fit candidates instantly",
                                    "Reduce screening time by up to 60%"
                                ].map((text, i) => (
                                    <li key={i} className="flex items-start">
                                        <CheckCircle2 className="w-6 h-6 text-cyan-600 mr-3 flex-shrink-0" />
                                        <span className="text-lg text-gray-700">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

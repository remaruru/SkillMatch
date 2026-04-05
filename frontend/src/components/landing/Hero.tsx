
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Network, Sparkles, Building2, UserCircle2, ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50 pt-20">
            {/* Abstract Background Gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-100/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-cyan-100/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">

                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
                >
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-medium text-gray-600">The Future of Internship Matching</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-8 max-w-4xl"
                >
                    Find the Right Internship. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                        Powered by AI.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="text-lg md:text-xl text-gray-600 mt-4 mb-12 max-w-2xl mx-auto"
                >
                    SkillMatch intelligently connects students with companies using smart skill-based matching and contextual analysis. Say goodbye to black-hole applications.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto"
                >
                    <Link
                        to="/register?role=applicant"
                        className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-105 rounded-xl overflow-hidden"
                    >
                        <span className="mr-2">Get Started</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        to="/register?role=employer"
                        className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-700 transition-all duration-300 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm hover:scale-105 rounded-xl"
                    >
                        <Building2 className="w-5 h-5 mr-2 text-gray-400" />
                        For Employers
                    </Link>
                </motion.div>

                {/* Abstract Network Visual (Fake Mockup) */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="mt-20 relative w-full max-w-4xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent z-10 bottom-0 h-40"></div>
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">

                        {/* User Node */}
                        <div className="flex flex-col items-center gap-3 z-0">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                <UserCircle2 className="w-10 h-10 text-indigo-500" />
                            </div>
                            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200 mt-2">
                                React, Node.js, UI/UX
                            </div>
                        </div>

                        {/* Connecting Animation */}
                        <div className="hidden md:flex flex-1 items-center justify-center relative">
                            <div className="h-0.5 w-full bg-gray-100"></div>
                            <motion.div
                                initial={{ left: "0%" }}
                                animate={{ left: "100%" }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute w-20 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                            />
                            <div className="absolute bg-white rounded-full p-2 border border-gray-100 shadow-sm">
                                <Network className="w-6 h-6 text-indigo-500" />
                            </div>
                        </div>

                        {/* Company Node */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-2xl bg-cyan-50 flex items-center justify-center border border-cyan-100">
                                <Building2 className="w-10 h-10 text-cyan-500" />
                            </div>
                            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200 mt-2">
                                Frontend Intern req.
                            </div>
                        </div>

                    </div>
                </motion.div>

            </div>
        </section>
    );
}

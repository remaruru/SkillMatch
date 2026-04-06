import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness } from 'lucide-react';

export function CallToAction() {
    return (
        <section className="py-20 px-6 md:px-16 w-full flex flex-col items-center bg-white border-t border-gray-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-7xl mx-auto text-center"
            >
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 py-20 px-8 rounded-2xl shadow-xl border border-indigo-500 overflow-hidden relative">
                    {/* Subtle aesthetic glow/effect */}
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none animation-delay-2000" />

                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white relative z-10">
                        Ready to Find Your Perfect Match?
                    </h2>
                    <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto relative z-10">
                        Join the platform that is fundamentally changing how early-career talent meets top-tier companies. Registration is free.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <Link
                            to="/register?role=applicant"
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-indigo-700 transition-all duration-300 bg-white hover:bg-gray-100 hover:scale-105 rounded-xl shadow-md"
                        >
                            Sign Up as Student
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link
                            to="/register?role=employer"
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-transparent border border-white hover:bg-white hover:text-indigo-700 hover:scale-105 rounded-xl"
                        >
                            Sign Up as Employer
                        </Link>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 text-gray-500 py-12">
            <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="w-6 h-6 text-indigo-600" />
                    <span className="text-xl font-bold text-gray-900">SkillMatch</span>
                </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-400 border-t border-gray-100 pt-8 max-w-7xl mx-auto px-6 md:px-16">
                &copy; {new Date().getFullYear()} SkillMatch AI. All rights reserved.
            </div>
        </footer>
    );
}

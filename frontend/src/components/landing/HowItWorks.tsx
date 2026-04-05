
import { motion } from 'framer-motion';

const steps = [
    {
        num: "01",
        title: "Create Your Profile",
        description: "Sign up securely as an applicant or employer."
    },
    {
        num: "02",
        title: "Add Skills & Prefs",
        description: "List your tags, tech stack, and location."
    },
    {
        num: "03",
        title: "AI Analyzes Req",
        description: "The engine maps profiles to job descriptions."
    },
    {
        num: "04",
        title: "Get Ranked Matches",
        description: "Apply instantly to high-probability roles."
    }
];

export default function HowItWorks() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        className="text-3xl font-bold text-gray-900 sm:text-4xl"
                    >
                        How It Works
                    </motion.h2>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-100" />
                    <motion.div
                        initial={{ width: "0%" }}
                        whileInView={{ width: "80%" }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="hidden md:block absolute top-12 left-[10%] h-0.5 bg-gradient-to-r from-primary-500 to-cyan-400"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.1 }}
                                transition={{ delay: index * 0.2 }}
                                className="relative flex flex-col items-center text-center"
                            >
                                <div className="w-24 h-24 bg-white rounded-full border-4 border-gray-50 shadow-lg flex items-center justify-center mb-6 relative z-10">
                                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-cyan-500">
                                        {step.num}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-500">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

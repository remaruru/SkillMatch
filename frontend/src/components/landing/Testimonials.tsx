
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        quote: "SkillMatch completely changed how I think about applying. Instead of spamming resumes, I let the AI find the exact three roles where I was an 85%+ match. I landed an offer in a week.",
        author: "Cielo Salazar",
        role: "Trust me Bro",
        type: "student",
        color: "bg-indigo-50 border-indigo-100"
    },
    {
        quote: "We used to spend hours manually screening unqualified resumes. Now, we just look at the dashboard, filter by match score above 80%, and interview the top 5 candidates. Reduced our screening time by 60%.",
        author: "Basti rosales",
        role: "Trust me bro",
        type: "employer",
        color: "bg-cyan-50 border-cyan-100"
    },
    {
        quote: "The skills mapping is incredibly accurate. It highlighted side-projects I completely forgot about that happened to perfectly align with a startup's needs.",
        author: "Michael Torres",
        role: "random lang",
        type: "student",
        color: "bg-emerald-50 border-emerald-100"
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        className="text-3xl font-bold text-gray-900 sm:text-4xl"
                    >
                        Real Matches. Real Results.
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((test, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.1 }}
                            transition={{ delay: index * 0.2 }}
                            className={`p-8 rounded-3xl border ${test.color} relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`}
                        >
                            <Quote className="w-10 h-10 text-gray-300 absolute top-8 right-8" />
                            <div className="flex-1 mb-8 pt-4">
                                <p className="text-lg text-gray-700 font-medium leading-relaxed italic">
                                    "{test.quote}"
                                </p>
                            </div>
                            <div className="flex items-center gap-4 border-t border-gray-200/60 pt-6">
                                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-gray-400">
                                    {test.author[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{test.author}</h4>
                                    <p className="text-sm text-gray-500">{test.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

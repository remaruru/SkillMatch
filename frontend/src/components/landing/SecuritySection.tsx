
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, UserX } from 'lucide-react';

export default function SecuritySection() {
    return (
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold sm:text-4xl mb-6">
                            Built with Privacy and Security in Mind
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                            We understand that your data is sensitive. SkillMatch employs enterprise-grade architecture to ensure students and employers are fully protected.
                        </p>

                        <ul className="space-y-6">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: "Strict Role-Based Access Control",
                                    desc: "Only authorized users can view specific data limits based on roles."
                                },
                                {
                                    icon: Lock,
                                    title: "Confidentiality Protection",
                                    desc: "Applicant resumes and private employer notes are rigorously secured."
                                },
                                {
                                    icon: UserX,
                                    title: "Minimal Admin Footprint",
                                    desc: "Even system administrators cannot view private match logic or access document uploads."
                                }
                            ].map((feature, i) => (
                                <li key={i} className="flex flex-col sm:flex-row gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-white">{feature.title}</h4>
                                        <p className="text-gray-400 mt-1">{feature.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative pt-12"
                    >
                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                <Lock className="w-48 h-48 text-primary-500" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                {/* Fake dashboard fragment */}
                                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-gray-400 font-mono">auth_middleware.ts</span>
                                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    </div>
                                    <code className="text-sm text-cyan-400 font-mono whitespace-pre w-full overflow-hidden block">
                                        <span className="text-purple-400">export const</span> <span className="text-blue-400">authorizeRole</span> = (role) =&gt; {'{\n'}
                                        <span className="text-gray-500">  // Strict verification</span>{'\n'}
                                        {'  '}if (req.user.role !== role) {'{\n'}
                                        {'    '}return res.<span className="text-yellow-400">status</span>(403).<span className="text-yellow-400">json</span>({'{error: "Access Denied"}'});{'\n'}
                                        {'  }'}{'\n'}
                                        {'  '}next();{'\n'}
                                        {'}'}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

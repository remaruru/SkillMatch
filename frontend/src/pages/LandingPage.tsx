
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import ProblemSection from '../components/landing/ProblemSection';
import SolutionSection from '../components/landing/SolutionSection';
import HowItWorks from '../components/landing/HowItWorks';
import SplitSection from '../components/landing/SplitSection';
import Testimonials from '../components/landing/Testimonials';
import { CallToAction, Footer } from '../components/landing/FooterCTA';

export default function LandingPage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-indigo-200">
            <Navbar />
            <div id="home">
                <Hero />
            </div>
            <div id="problem">
                <ProblemSection />
            </div>
            <div id="solution">
                <SolutionSection />
            </div>
            <div id="how-it-works">
                <HowItWorks />
            </div>
            <div id="features">
                <SplitSection />
            </div>
            <div id="testimonials">
                <Testimonials />
            </div>
            <CallToAction />
            <Footer />
        </div>
    );
}

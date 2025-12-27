import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import ResumeUpload from './ResumeUpload';
import { FileText, LayoutDashboard, Sparkles, Briefcase, TrendingUp, CheckCircle, CheckCircle2, Target, ArrowRight, UploadCloud, X, ExternalLink, Code2, Brain, Zap, BarChart3, ChevronDown, Lock } from 'lucide-react';

interface LandingPageProps {
    isLoggedIn: boolean;
    onLoginStudent: () => void;
    onLoginRecruiter: () => void;
    onGoToDashboard: () => void;
    onResumeAnalyzed: (profile: UserProfile) => void;
    onBuildResume: () => void;
    onUploadResume: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isLoggedIn, onLoginStudent, onLoginRecruiter, onGoToDashboard, onResumeAnalyzed, onBuildResume, onUploadResume }) => {
    const [scrollY, setScrollY] = useState(0);

    // Ref for the text reveal section
    const textRevealRef = useRef<HTMLDivElement>(null);
    const [revealProgress, setRevealProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);

            // Calculate text reveal progress based on scroll position relative to the element
            if (textRevealRef.current) {
                const rect = textRevealRef.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                // Start revealing when element enters bottom half of screen
                const start = windowHeight * 0.8;
                const end = windowHeight * 0.2;

                let progress = 0;
                if (rect.top < start) {
                    progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
                }
                setRevealProgress(progress);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Observer for fade-in elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0', 'scale-100');
                    entry.target.classList.remove('opacity-0', 'translate-y-10', 'scale-95');
                }
            });
        }, { threshold: 0.1 });

        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach((el) => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const colleges = ['IIT Hyderabad', 'IIIT Hyderabad', 'BITS Pilani', 'JNTU', 'Osmania University', 'CBIT', 'VNR VJIET', 'Vasavi College', 'GRIET', 'MGIT', 'KL University', 'Mahindra University'];

    return (
        <div className="flex flex-col w-full overflow-hidden bg-gradient-to-br from-slate-950 via-[#0b0c15] to-slate-900 text-slate-100 font-sans selection:bg-radion-primary selection:text-white relative">

            {/* New Mesh Gradient / Aurora Effect */}
            <div className="absolute top-0 left-0 w-full h-[100vh] overflow-hidden pointer-events-none z-0 opactiy-60">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* --- SECTION 1: HERO --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center overflow-hidden pb-20">

                {/* Subtle Spotlight */}
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-radion-primary/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-radion-accent/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

                <div className="max-w-5xl mx-auto z-10 relative flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-slate-700/50 bg-slate-900/50 backdrop-blur-md animate-slide-up opacity-0 shadow-lg shadow-radion-primary/10">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-radion-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-radion-primary"></span>
                        </span>
                        <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Hyderabad Career Intelligence</span>
                    </div>

                    <h1 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tighter leading-[1.05] mb-6 animate-slide-up opacity-0 text-gradient-apple drop-shadow-2xl">
                        Your career. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-radion-primary to-radion-accent">Mastered.</span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium mb-10 animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
                        The AI-powered career brain for Hyderabad's B.Tech students. <br className="hidden md:block" /> Decode resumes. Find gaps. Get hired.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center animate-slide-up opacity-0 mb-16" style={{ animationDelay: '0.3s' }}>
                        {!isLoggedIn && (
                            <>
                                <button
                                    onClick={onLoginRecruiter}
                                    className="btn-bubble bubble-secondary px-8 py-4 text-lg"
                                >
                                    For Recruiters &rarr;
                                </button>
                                <button
                                    onClick={onBuildResume}
                                    className="btn-bubble bubble-light px-8 py-4 text-lg text-black font-bold flex items-center gap-2 hover:bg-white"
                                >
                                    <FileText className="w-5 h-5" />
                                    Build ATS Resume
                                </button>
                            </>
                        )}
                        {isLoggedIn && (
                            <>
                                <button
                                    onClick={onGoToDashboard}
                                    className="btn-bubble bubble-primary px-8 py-4 text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={onBuildResume}
                                    className="btn-bubble bubble-secondary px-8 py-4 text-lg flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    Resume Builder
                                </button>
                                {/* NEW BUTTON REQUESTED BY USER */}
                                <button
                                // OR better: The user checks "Update Resume" in Dashboard.
                                // But the user specially asked "keep another button here upload resume i want that feature after login as well".
                                // I'll call a new prop or just `onLoginStudent` which currently might redirect to Dashboard.
                                // Let's check `App.tsx`: `handleLogin` redirects to Landing.
                                // We need a specific action.
                                // Let's assume `onBuildResume` is strictly builder.
                                // I will temporarily make it call `onLoginStudent` and assume we can add logic there?
                                // No, I'll add a new button that resets the specific view state in App.
                                // BUT I can't change App.tsx props easily without changing interface.
                                // Let's look at `App.tsx` passing props.
                                // It passes `onLoginStudent={() => setCurrentView('login')}`...
                                // If I want to "Upload New Resume", I should set view to `resume-upload`.
                                // I don't have that prop here.
                                // I will Use `onLoginStudent` but I need to signal "Upload".
                                // Actually, `onLoginStudent` sets view to `login`.
                                // Login check redirects to Landing.
                                // This circle won't work for "Upload".
                                // I will Replace `onBuildResume` logic? No.
                                // I will modify `LandingPageProps` to take `onUploadResume`.
                                />
                            </>
                        )}
                    </div>

                    {/* Replaced Hero Visual with Upload Section */}
                    <div id="upload-section" className="w-full max-w-4xl animate-slide-up opacity-0" style={{ animationDelay: '0.5s' }}>
                        <div className="relative rounded-[2.5rem] overflow-hidden border border-neutral-800 bg-neutral-900/50 shadow-2xl p-8 sm:p-12 backdrop-blur-sm hover:border-radion-primary/30 transition-colors duration-500 group">
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none group-hover:from-blue-900/10 transition-colors duration-500"></div>

                            <div className="relative z-10">
                                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-radion-primary/20 text-radion-secondary text-xs font-bold uppercase tracking-wide border border-radion-primary/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                    <Sparkles className="w-3 h-3" />
                                    Get Started Free
                                </div>
                                <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-4 text-white">
                                    It starts with a PDF.
                                </h2>
                                <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                                    No sign-up required to analyze. Just drop your resume, and let our AI build your career path in seconds.
                                </p>

                                {isLoggedIn ? (
                                    <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in py-8">
                                        <div className="flex items-center gap-2 text-green-400 bg-green-900/20 px-5 py-2.5 rounded-full border border-green-900/30">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-semibold">Welcome back</span>
                                        </div>
                                        <button onClick={onGoToDashboard} className="btn-bubble bubble-light px-8 py-4 text-lg flex items-center gap-2">
                                            <LayoutDashboard className="w-5 h-5" />
                                            Go to Dashboard
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in py-8">
                                        <div className="p-1 rounded-full bg-gradient-to-r from-radion-primary to-radion-accent">
                                            <button
                                                onClick={onLoginStudent}
                                                className="px-12 py-5 rounded-full bg-black relative group transition-all duration-200 hover:bg-zinc-900"
                                            >
                                                <div className="absolute inset-0 rounded-full blur-lg bg-radion-primary/50 group-hover:bg-radion-primary/70 transition-colors opacity-50"></div>
                                                <span className="relative text-white font-bold text-xl flex items-center gap-3">
                                                    Login to Analyze Resume <ArrowRight className="w-6 h-6" />
                                                </span>
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-500">Secure login powered by Google</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 2: TRUSTED BY (SCROLL) --- */}
            <section className="py-16 border-y border-white/5 bg-transparent overflow-hidden relative z-10 select-none">
                <div className="flex w-full">
                    {/* First Marquee Track */}
                    <div className="flex flex-shrink-0 animate-scroll items-center gap-24 pr-24">
                        {[...colleges, ...colleges].map((college, i) => (
                            <span key={i} className="text-2xl md:text-3xl font-bold text-neutral-800 whitespace-nowrap hover:text-neutral-600 transition-colors cursor-default">
                                {college}
                            </span>
                        ))}
                    </div>
                    {/* Second Marquee Track */}
                    <div className="flex flex-shrink-0 animate-scroll items-center gap-24 pr-24">
                        {[...colleges, ...colleges].map((college, i) => (
                            <span key={i} className="text-2xl md:text-3xl font-bold text-neutral-800 whitespace-nowrap hover:text-neutral-600 transition-colors cursor-default">
                                {college}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SECTION 3: THE PROBLEM --- */}
            <section id="problem" className="py-32 px-6 bg-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-radion-primary/5 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Why 90% of B.Tech students <span className="text-red-500">get rejected.</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                            ATS (Applicant Tracking Systems) filter out resume keywords. If your resume doesn't match the job description perfectly, human eyes never see it.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-6 h-6 rounded-full bg-red-900/20 flex items-center justify-center flex-shrink-0"><X className="w-3 h-3 text-red-500" /></div>
                                <span className="text-lg text-gray-300">Generic templates that blend in.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-6 h-6 rounded-full bg-red-900/20 flex items-center justify-center flex-shrink-0"><X className="w-3 h-3 text-red-500" /></div>
                                <span className="text-lg text-gray-300">Missing critical keywords for modern tech stacks.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-6 h-6 rounded-full bg-red-900/20 flex items-center justify-center flex-shrink-0"><X className="w-3 h-3 text-red-500" /></div>
                                <span className="text-lg text-gray-300">No project evidence to back up skill claims.</span>
                            </li>
                        </ul>
                    </div>
                    <div ref={textRevealRef} className="radion-card p-8 rounded-3xl border border-[#2c2c2e] animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700 delay-200">
                        <p className="text-3xl font-bold leading-tight">
                            <span className="text-reveal-span" style={{ color: revealProgress > 0.1 ? '#fff' : '#333' }}>AstraX changes the game. </span>
                            <span className="text-reveal-span" style={{ color: revealProgress > 0.3 ? '#fff' : '#333' }}>We use Gemini AI to </span>
                            <span className="text-reveal-span" style={{ color: revealProgress > 0.5 ? '#fff' : '#334155' }}>reverse-engineer the hiring process, </span>
                            <span className="text-reveal-span" style={{ color: revealProgress > 0.7 ? '#fff' : '#334155' }}>giving you the </span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-radion-secondary to-radion-accent transition-opacity duration-500" style={{ opacity: revealProgress > 0.9 ? 1 : 0.3 }}>exact cheat sheet </span>
                            <span className="text-reveal-span" style={{ color: revealProgress > 0.9 ? '#fff' : '#334155' }}>to get shortlisted.</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: RANKFLOW INTEGRATION --- */}
            <section id="rankflow" className="py-24 px-6 bg-transparent border-y border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-radion-accent/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <div className="animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-radion-accent/30 bg-radion-accent/10">
                            <Sparkles className="w-3 h-3 text-radion-accent" />
                            <span className="text-xs font-bold text-radion-accent uppercase tracking-wide">Exclusive Partner</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Don't just claim skills.<br />
                            <span className="text-radion-accent">Prove them with Rankflow.</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            Recruiters trust verified data. We've integrated with Rankflow to provide real-time skill validation tests.
                            Get a verified badge on your AstraX profile.
                        </p>

                        {/* Context Placeholder */}
                        <div className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/10 max-w-2xl mx-auto">
                            <p className="text-gray-300 text-sm italic">
                                "Rankflow provides industry-standard assessments that validate your proficiency in coding, system design, and data structures. Trusted by top tech companies to filter the top 1% of talent."
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <a
                                href="https://rankflow-nu.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-bubble bubble-light px-8 py-4 text-black font-bold flex items-center justify-center gap-2"
                            >
                                Click here to view
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 5: HOW IT WORKS --- */}
            <section className="py-32 px-6 bg-transparent relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150"></div>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Your roadmap to hired.</h2>
                        <p className="text-xl text-gray-400">Three simple steps to transform your career trajectory.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <div className="radion-card p-8 rounded-[2.5rem] border border-[#2c2c2e] relative group hover:border-radion-primary/50 transition-colors animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700">
                            <div className="absolute -top-6 left-8 w-12 h-12 bg-radion-primary rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-radion-primary/50">1</div>
                            <div className="mt-4 mb-6 h-40 flex items-center justify-center bg-black/50 rounded-2xl border border-white/5">
                                <LayoutDashboard className="w-16 h-16 text-radion-primary/50 group-hover:text-radion-primary transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Upload & Analyze</h3>
                            <p className="text-gray-400 leading-relaxed">Drop your PDF resume. Our Gemini AI engine scans it against 50,000+ job descriptions to find strengths and weaknesses.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="radion-card p-8 rounded-[2.5rem] border border-[#2c2c2e] relative group hover:border-radion-accent/50 transition-colors animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700 delay-100">
                            <div className="absolute -top-6 left-8 w-12 h-12 bg-radion-accent rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-radion-accent/50">2</div>
                            <div className="mt-4 mb-6 h-40 flex items-center justify-center bg-black/50 rounded-2xl border border-white/5">
                                <Code2 className="w-16 h-16 text-radion-accent/50 group-hover:text-radion-accent transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Bridge Skill Gaps</h3>
                            <p className="text-gray-400 leading-relaxed">We identify exactly what you're missing. "Learn React Hooks" instead of just "Learn React". Precise, actionable roadmaps.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="radion-card p-8 rounded-[2.5rem] border border-[#2c2c2e] relative group hover:border-green-500/50 transition-colors animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700 delay-200">
                            <div className="absolute -top-6 left-8 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-green-900/50">3</div>
                            <div className="mt-4 mb-6 h-40 flex items-center justify-center bg-black/50 rounded-2xl border border-white/5">
                                <Briefcase className="w-16 h-16 text-green-500/50 group-hover:text-green-500 transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Get Matched</h3>
                            <p className="text-gray-400 leading-relaxed">Skip the cold emails. We match you directly with Hyderabad startups looking for your specific skill profile.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 6: BENTO FEATURES --- */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-semibold text-center mb-16 tracking-tight text-white animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700">
                        CareerOS Features.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[350px]">

                        {/* Feature 1: Large - Deep Analysis */}
                        <div className="md:col-span-4 relative overflow-hidden rounded-[2rem] radion-card group animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700 hover:border-radion-primary/50 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(79,70,229,0.15)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-radion-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="p-10 h-full flex flex-col justify-between relative z-10">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-radion-primary flex items-center justify-center mb-4 shadow-lg shadow-radion-primary/50 group-hover:scale-110 transition-transform duration-300">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2 text-white">Semantic Analysis</h3>
                                    <p className="text-gray-400 text-lg max-w-md">We don't just scan keywords. We understand the context of your projects and experience.</p>
                                </div>
                                {/* Abstract Visual */}
                                <div className="w-full h-24 flex items-end gap-2 opacity-50">
                                    {[40, 70, 50, 90, 60, 80, 40, 60].map((h, i) => (
                                        <div key={i} className="flex-1 bg-radion-primary rounded-t-md transition-all duration-500 group-hover:bg-radion-secondary group-hover:scale-y-110 origin-bottom" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Small - Instant Match */}
                        <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] glass-card group animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700 delay-100 hover:border-radion-secondary/50 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                            <div className="p-8 h-full flex flex-col">
                                <Zap className="w-10 h-10 text-yellow-400 mb-4 fill-yellow-400/20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                                <h3 className="text-2xl font-bold mb-2">Instant Match</h3>
                                <p className="text-gray-500 text-sm mb-auto">Connect with startups looking for your specific profile.</p>
                                <div className="mt-4 flex -space-x-3 group-hover:space-x-1 transition-all duration-300">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-radion-card bg-gray-700 relative z-0 group-hover:z-10 transition-all"></div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-radion-card bg-radion-primary flex items-center justify-center text-xs font-bold relative z-10">+50</div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Small - Skill Gaps */}
                        <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] glass-card group animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700 delay-200 hover:border-radion-accent/50 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]">
                            <div className="p-8 h-full flex flex-col">
                                <BarChart3 className="w-10 h-10 text-radion-accent mb-4 group-hover:-translate-y-1 transition-transform duration-300" />
                                <h3 className="text-2xl font-bold mb-2">Skill Gaps</h3>
                                <p className="text-gray-500 text-sm">Know exactly what to learn next to get hired.</p>
                                <div className="mt-6 space-y-2">
                                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                        <div className="bg-radion-accent h-2 rounded-full w-[75%] group-hover:brightness-125 group-hover:scale-x-105 origin-left transition-all duration-500"></div>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                        <div className="bg-radion-primary h-2 rounded-full w-[45%] group-hover:brightness-125 group-hover:scale-x-105 origin-left transition-all duration-500 delay-100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 4: Large - Privacy */}
                        <div className="md:col-span-4 relative overflow-hidden rounded-[2rem] glass-card group animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700 delay-300 hover:border-green-500/50 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                            <div className="p-10 h-full flex items-center">
                                <div className="flex-1">
                                    <Lock className="w-12 h-12 text-green-500 mb-6 group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-300" />
                                    <h3 className="text-3xl font-bold mb-4 text-white">Privacy First</h3>
                                    <p className="text-gray-400 text-lg max-w-lg">
                                        Your data stays on your device until you decide to share it. We don't sell your resume data to third parties.
                                    </p>
                                    <div className="flex gap-4 mt-6">
                                        <div className="px-4 py-2 rounded-lg bg-green-900/20 text-green-400 text-sm font-medium">Verified Recruiters</div>
                                        <div className="px-4 py-2 rounded-lg bg-green-900/20 text-green-400 text-sm font-medium">Zero Spam</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 7: LIVE DASHBOARD PREVIEW --- */}
            <section className="py-24 px-6 bg-transparent">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Your Command Center</h2>
                    <p className="text-gray-400 mb-12">Everything you need to manage your job search in one place.</p>

                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 group animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60"></div>
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2600" alt="Dashboard Interface" className="w-full opacity-80 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute bottom-10 left-0 w-full text-center z-20">
                            <button onClick={onGoToDashboard} className="btn-bubble bubble-primary px-8 py-3 text-lg font-bold">
                                Launch Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 8: TESTIMONIALS --- */}
            <section id="testimonials" className="py-24 px-6 bg-transparent border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">Students <span className="text-radion-primary">Love Us</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Rahul V.", college: "IIIT Hyderabad", role: "SDE at Swiggy", text: "My resume was getting rejected everywhere. AstraX pointed out I was missing 'System Design' keywords. Added a project, applied, and got shortlisted." },
                            { name: "Sneha P.", college: "CBIT", role: "Data Analyst at Deloitte", text: "The Rankflow integration is a game changer. Being able to prove my SQL skills with a verified badge made recruiters actually reply to me." },
                            { name: "Arjun K.", college: "JNTU", role: "Frontend at Darwinbox", text: "I didn't know what to learn next. The roadmap feature told me to focus on Redux. I did, and it was the main topic in my interview." }
                        ].map((t, i) => (
                            <div key={i} className="radion-card p-8 rounded-2xl border border-[#2c2c2e] hover:border-radion-primary/30 transition-colors animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Sparkles key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                                </div>
                                <p className="text-gray-300 mb-6 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-radion-primary to-radion-accent flex items-center justify-center font-bold text-white">{t.name.charAt(0)}</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{t.name}</h4>
                                        <p className="text-xs text-gray-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* --- SECTION 10: FAQ --- */}
            < section className="py-24 text-center bg-transparent border-t border-white/5" >
                <div className="max-w-3xl mx-auto px-6 animate-on-scroll opacity-0 translate-y-10 scale-95 transition-all duration-700">
                    <h3 className="text-3xl font-bold mb-12 text-white">Questions?</h3>

                    <div className="space-y-4 text-left">
                        <details className="group radion-card p-6 rounded-2xl border border-[#2c2c2e] cursor-pointer hover:bg-radion-card-hover transition-colors">
                            <summary className="font-semibold text-lg text-white flex justify-between items-center list-none">
                                Is it really free for students?
                                <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-gray-500" />
                            </summary>
                            <p className="text-gray-400 mt-4 text-base leading-relaxed">Yes! AstraX is 100% free for B.Tech students. We charge recruiters to post premium roles.</p>
                        </details>

                        <details className="group radion-card p-6 rounded-2xl border border-[#2c2c2e] cursor-pointer hover:bg-radion-card-hover transition-colors">
                            <summary className="font-semibold text-lg text-white flex justify-between items-center list-none">
                                How accurate is the AI?
                                <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-gray-500" />
                            </summary>
                            <p className="text-gray-400 mt-4 text-base leading-relaxed">We use Google's Gemini Pro vision model. It parses complex resume layouts better than traditional ATS, understanding the context of your projects.</p>
                        </details>

                        <details className="group radion-card p-6 rounded-2xl border border-[#2c2c2e] cursor-pointer hover:bg-radion-card-hover transition-colors">
                            <summary className="font-semibold text-lg text-white flex justify-between items-center list-none">
                                What is Rankflow?
                                <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-gray-500" />
                            </summary>
                            <p className="text-gray-400 mt-4 text-base leading-relaxed">Rankflow is our partner for skill verification. Taking their assessments adds a 'Verified' badge to your profile, increasing recruiter trust by 40%.</p>
                        </details>
                    </div>
                </div>
            </section >

            {/* --- FOOTER --- */}
            < footer className="py-12 bg-transparent text-center text-slate-500 text-sm border-t border-white/5 relative z-10" >
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <img src="/logo.png" alt="AstraX Logo" className="w-8 h-8 rounded-full opacity-80" />
                        <p>&copy; 2024 AstraX.ai. Designed in Hyderabad.</p>
                    </div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer >

        </div >
    );
};

export default LandingPage;
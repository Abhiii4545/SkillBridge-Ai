import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Upload, Briefcase, Zap, Brain, CheckCircle2, Building2, Users, Star, ChevronDown, Sparkles, LayoutDashboard, ExternalLink, ShieldCheck, TrendingUp, Award, HelpCircle } from 'lucide-react';
import ResumeUpload from './ResumeUpload';
import { UserProfile } from '../types';
import Hero from './Hero'; // Importing the updated Hero component directly if needed, or we reproduce parts here. 
// Assuming App.tsx handles Hero rendering separately, but LandingPage usually includes Hero. 
// Since App.tsx conditionally renders LandingPage, I will update LandingPage to use the new Hero style internally or keep its structure.
// NOTE: The previous LandingPage file contained the Hero section code inside it. I will preserve that structure but update the styles.

interface LandingPageProps {
  isLoggedIn: boolean;
  onLoginStudent: () => void;
  onLoginRecruiter: () => void;
  onGoToDashboard: () => void;
  onResumeAnalyzed: (profile: UserProfile) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isLoggedIn, onLoginStudent, onLoginRecruiter, onGoToDashboard, onResumeAnalyzed }) => {
  const [scrollY, setScrollY] = useState(0);
  
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
        window.removeEventListener('scroll', handleScroll);
        observerRef.current?.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRankFlowRedirect = () => {
      window.open('https://rankflow-nu.vercel.app/', '_blank');
  };

  const colleges = ['IIT Hyderabad', 'IIIT Hyderabad', 'BITS Pilani', 'JNTU', 'Osmania University', 'CBIT', 'VNR VJIET', 'Vasavi', 'GRIET', 'Mahindra University', 'KLH University'];

  return (
    <div className="flex flex-col w-full overflow-hidden bg-slate-50 dark:bg-[#050511] text-slate-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* --- SECTION 1: HERO (Updated with Radion Vibe) --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center overflow-hidden radion-bg">
        {/* Radion Background Elements */}
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[120px] -z-10 transition-transform duration-75 ease-out"
            style={{ transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.0005})` }}
        ></div>
        <div 
            className="absolute top-[20%] right-[10%] w-[20vw] h-[20vw] bg-purple-600/20 rounded-full blur-[100px] -z-10"
            style={{ transform: `translateY(${scrollY * -0.2}px)` }}
        ></div>

        <div className="max-w-5xl mx-auto space-y-8 z-10 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wide animate-fade-in shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                AI-Powered Career Intelligence
            </div>

            <h1 className="text-6xl sm:text-7xl md:text-9xl font-extrabold tracking-tighter leading-[0.95] animate-slide-up text-white drop-shadow-xl">
                Your career, <br />
                <span className="text-radion-gradient">
                    Accelerated.
                </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slide-up font-light" style={{animationDelay: '0.1s'}}>
                Stop applying blindly. We parse your resume, identify skill gaps, and match you with internships that actually fit.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
                {isLoggedIn ? (
                    <button 
                        onClick={onGoToDashboard}
                        className="btn-bubble bubble-primary px-8 py-4 text-lg flex items-center justify-center gap-2"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Go to Dashboard
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={() => scrollToSection('upload-section')}
                            className="btn-bubble bubble-primary px-8 py-4 text-lg flex items-center justify-center gap-2"
                        >
                            Upload Resume
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={onLoginRecruiter}
                            className="btn-bubble bubble-dark px-8 py-4 text-lg text-slate-200 flex items-center justify-center gap-2"
                        >
                            Recruiter Login
                        </button>
                    </>
                )}
            </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 text-white">
            <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* --- SECTION 2: TRUST TICKER --- */}
      <section className="py-12 border-y border-white/5 bg-[#0a0a1a] backdrop-blur-sm overflow-hidden animate-on-scroll opacity-0 transition-opacity duration-1000">
          <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Trusted by students from</p>
          </div>
          <div className="flex overflow-hidden group hover:[animation-play-state:paused]">
               <div className="flex animate-scroll space-x-20 min-w-full shrink-0 items-center justify-around px-8">
                  {colleges.map((college, i) => (
                      <span key={i} className="text-2xl font-bold text-slate-600 dark:text-slate-400/50 whitespace-nowrap hover:text-white transition-colors cursor-default">
                          {college}
                      </span>
                  ))}
               </div>
               <div className="flex animate-scroll space-x-20 min-w-full shrink-0 items-center justify-around px-8" aria-hidden="true">
                  {colleges.map((college, i) => (
                      <span key={`dup-${i}`} className="text-2xl font-bold text-slate-600 dark:text-slate-400/50 whitespace-nowrap hover:text-white transition-colors cursor-default">
                          {college}
                      </span>
                  ))}
               </div>
          </div>
      </section>

      {/* --- SECTION 3: THE PROBLEM --- */}
      <section className="py-32 px-4 relative bg-[#050511]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wide border border-red-500/20">
                      The Old Way
                  </div>
                  <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
                      Lost in the <br/>
                      <span className="text-slate-600 line-through decoration-red-500 decoration-4">WhatsApp Chaos?</span>
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed">
                      Scrolling through hundreds of messages. Missing deadlines. Applying to irrelevant roles. The traditional way of finding internships in Hyderabad is broken.
                  </p>
                  <ul className="space-y-4 pt-4">
                      {['Endless scrolling in groups', 'Resume ignored by ATS', 'No feedback on rejections'].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-300">
                              <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                  <XIcon className="w-4 h-4 text-red-500" />
                              </div>
                              {item}
                          </li>
                      ))}
                  </ul>
              </div>
              
              <div className="relative animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[2.5rem] blur-3xl opacity-20 transform rotate-3"></div>
                  <div className="relative radion-glass rounded-[2.5rem] p-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500 border border-white/10">
                      <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                          <div className="ml-auto text-xs text-slate-500 font-mono">SkillBridge.ai</div>
                      </div>
                      <div className="space-y-6">
                          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                              </div>
                              <div className="flex-1 space-y-2">
                                  <div className="h-2.5 w-24 bg-slate-700 rounded-full"></div>
                                  <div className="h-2.5 w-16 bg-slate-800 rounded-full"></div>
                              </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                                  <Brain className="w-5 h-5 text-indigo-400" />
                              </div>
                              <div className="flex-1 space-y-2">
                                  <div className="h-2.5 w-32 bg-slate-700 rounded-full"></div>
                                  <div className="h-2.5 w-20 bg-slate-800 rounded-full"></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- SECTION 4: HOW IT WORKS --- */}
      <section className="py-32 bg-[#080816]">
          <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-24 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">Intelligent Career Pathing</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto text-lg">We don't just list jobs. We engineer your career path.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                  {/* Connecting Line */}
                  <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 -z-10"></div>

                  {[
                      { icon: Upload, title: 'Upload Resume', desc: 'Drop your PDF. Our Gemini AI parses every detail, project, and certification.', color: 'from-blue-500 to-cyan-500' },
                      { icon: Zap, title: 'Get Analyzed', desc: 'We identify your top skills and crucial missing technologies for your target role.', color: 'from-purple-500 to-pink-500' },
                      { icon: Target, title: 'Get Matched', desc: 'Instant connection to recruiters looking for exactly your skill profile.', color: 'from-green-500 to-emerald-500' }
                  ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700" style={{transitionDelay: `${i * 150}ms`}}>
                          <div className={`w-24 h-24 rounded-full shadow-2xl flex items-center justify-center mb-8 z-10 relative group hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-br ${step.color} p-[2px]`}>
                              <div className="w-full h-full bg-[#0a0a1a] rounded-full flex items-center justify-center">
                                  <step.icon className="w-10 h-10 text-white" />
                              </div>
                              <div className="absolute -top-3 -right-3 w-8 h-8 btn-bubble bubble-light flex items-center justify-center font-bold text-sm">
                                  {i + 1}
                              </div>
                          </div>
                          <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                          <p className="text-slate-400 leading-relaxed max-w-xs">{step.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- SECTION 5: EXTERNAL TOOL (RankFlow) --- */}
      <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#050511] z-0"></div>
          {/* Parallax Background Image */}
          <div 
            className="absolute inset-0 opacity-10 grayscale mix-blend-overlay"
            style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `translateY(${(scrollY - 1800) * 0.1}px)`
            }}
          ></div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000">
              <div className="inline-block p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 mb-8 animate-float">
                  <Star className="w-10 h-10 text-yellow-400 mx-auto fill-yellow-400" />
              </div>
              <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                  Want to analyze <br/>your resume deeply?
              </h2>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                  Use our advanced partner tool, RankFlow, for a comprehensive ATS breakdown and keyword optimization score.
              </p>
              <button 
                  onClick={handleRankFlowRedirect}
                  className="btn-bubble bubble-light px-10 py-5 text-xl flex items-center gap-3 mx-auto"
              >
                  Click Here
                  <ExternalLink className="w-5 h-5" />
              </button>
          </div>
      </section>

      {/* --- SECTION 6: BENTO GRID FEATURES --- */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a1a]">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 tracking-tight text-white animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
                The <span className="text-indigo-500">SkillBridge</span> Ecosystem
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
                
                {/* Feature 1: Resume Analysis (Large) */}
                <div className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-[#12122a] border border-white/5 shadow-2xl hover:border-indigo-500/30 transition-all duration-500 group animate-on-scroll opacity-0 translate-y-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="p-12 relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30">
                                <Brain className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4 text-white">Gemini Analysis</h3>
                            <p className="text-slate-400 text-lg max-w-md">Our AI reads your PDF like a human recruiter, extracting projects, skills, and potential, not just keywords.</p>
                        </div>
                        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/5 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="h-2.5 w-24 bg-white/10 rounded-full"></div>
                                <div className="h-2.5 w-12 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                            </div>
                            <div className="h-2.5 w-full bg-white/5 rounded-full mb-3"></div>
                            <div className="h-2.5 w-3/4 bg-white/5 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Feature 2: Skill Gaps */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#12122a] border border-white/5 text-white shadow-2xl hover:border-indigo-500/30 transition-all duration-500 group animate-on-scroll opacity-0 translate-y-10" style={{transitionDelay: '0.1s'}}>
                    <div className="p-10 flex flex-col h-full">
                        <Zap className="w-12 h-12 text-yellow-400 mb-6 fill-yellow-400/20" />
                        <h3 className="text-2xl font-bold mb-4">Skill Gap Detection</h3>
                        <p className="text-slate-400 mb-auto">Don't guess what to learn. We tell you exactly what skills you're missing.</p>
                        <div className="mt-8 flex flex-wrap gap-2">
                            <span className="px-4 py-1.5 rounded-full border border-red-500/30 text-red-400 text-xs bg-red-500/10">Missing: TypeScript</span>
                            <span className="px-4 py-1.5 rounded-full border border-green-500/30 text-green-400 text-xs bg-green-500/10">Have: React</span>
                        </div>
                    </div>
                </div>

                {/* Feature 3: Smart Matching */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#12122a] border border-white/5 text-white shadow-2xl hover:border-indigo-500/30 transition-all duration-500 group animate-on-scroll opacity-0 translate-y-10" style={{transitionDelay: '0.2s'}}>
                    <div className="p-10 flex flex-col h-full">
                         <Briefcase className="w-12 h-12 text-purple-500 mb-6" />
                         <h3 className="text-2xl font-bold mb-4">Instant Matching</h3>
                         <p className="text-slate-400">Skip the search. We match you with Hyderabad startups looking for <i>you</i>.</p>
                         <div className="mt-8 relative h-24">
                             <div className="absolute top-0 left-0 right-0 p-4 bg-black/40 rounded-xl border border-white/5 shadow-lg transform rotate-2 group-hover:rotate-0 transition-transform duration-300">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                                     <div className="h-2 w-24 bg-white/10 rounded"></div>
                                 </div>
                             </div>
                             <div className="absolute top-4 left-4 right-4 p-4 bg-black/60 rounded-xl border border-white/5 shadow-lg transform -rotate-2 group-hover:rotate-0 transition-transform duration-300 z-10 backdrop-blur-sm">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-indigo-500/20"></div>
                                     <div className="h-2 w-24 bg-white/10 rounded"></div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                 {/* Feature 4: Community (Large) */}
                 <div className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-[#12122a] text-white border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group animate-on-scroll opacity-0 translate-y-10" style={{transitionDelay: '0.3s'}}>
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                    <div className="p-12 relative z-10 flex flex-col h-full justify-center text-center items-center">
                        <Users className="w-14 h-14 text-blue-400 mb-6" />
                        <h3 className="text-3xl font-bold mb-4">Verified Recruiters</h3>
                        <div className="flex flex-wrap justify-center gap-8 mt-4 opacity-70">
                           <p className="text-xl max-w-2xl text-slate-300">
                               Direct access to HRs from T-Hub, Hitech City, and Gachibowli startups. No more ghosting.
                           </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* --- SECTION 7: LIVE STATS --- */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
                  <div className="animate-on-scroll opacity-0 translate-y-5 transition-all duration-500">
                      <div className="text-4xl md:text-6xl font-extrabold mb-2 text-white">500+</div>
                      <div className="text-indigo-200 text-sm font-bold uppercase tracking-wide">Internships</div>
                  </div>
                  <div className="animate-on-scroll opacity-0 translate-y-5 transition-all duration-500 delay-100">
                      <div className="text-4xl md:text-6xl font-extrabold mb-2 text-white">2k+</div>
                      <div className="text-indigo-200 text-sm font-bold uppercase tracking-wide">Students</div>
                  </div>
                  <div className="animate-on-scroll opacity-0 translate-y-5 transition-all duration-500 delay-200">
                      <div className="text-4xl md:text-6xl font-extrabold mb-2 text-white">50+</div>
                      <div className="text-indigo-200 text-sm font-bold uppercase tracking-wide">Colleges</div>
                  </div>
                  <div className="animate-on-scroll opacity-0 translate-y-5 transition-all duration-500 delay-300">
                      <div className="text-4xl md:text-6xl font-extrabold mb-2 text-white">93%</div>
                      <div className="text-indigo-200 text-sm font-bold uppercase tracking-wide">Match Rate</div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- SECTION 8: TESTIMONIALS --- */}
      <section className="py-32 px-4 bg-[#050511]">
          <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-20 text-white">Heard on Campus</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { quote: "SkillBridge told me I needed Docker. I learned it in a week and got hired at Darwinbox.", name: "Ravi Kumar", college: "JNTU", role: "DevOps Intern" },
                      { quote: "The match score is scarily accurate. It matched me with a startup I didn't even know existed.", name: "Priya S.", college: "CBIT", role: "Frontend Intern" },
                      { quote: "Finally, a platform that understands what 'entry-level' actually means.", name: "Arjun Reddy", college: "Osmania", role: "Data Analyst" }
                  ].map((t, i) => (
                      <div key={i} className="p-8 bg-[#0a0a1a] rounded-[2rem] border border-white/5 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 hover:border-indigo-500/30">
                          <div className="flex gap-1 mb-6">
                              {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}
                          </div>
                          <p className="text-slate-300 mb-8 italic text-lg leading-relaxed">"{t.quote}"</p>
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full btn-bubble bubble-primary flex items-center justify-center text-white font-bold text-lg border-0">
                                  {t.name.charAt(0)}
                              </div>
                              <div>
                                  <div className="font-bold text-white text-lg">{t.name}</div>
                                  <div className="text-sm text-slate-500">{t.college} • {t.role}</div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- SECTION 9: UPLOAD SECTION (Sticky CTA) --- */}
      <section id="upload-section" className="py-32 px-4 relative bg-[#080816]">
         <div className="max-w-4xl mx-auto text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
             <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wide border border-indigo-500/20">
                <Sparkles className="w-4 h-4" />
                Start Your Journey
            </div>
             <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white">
                 It starts with a PDF.
             </h2>
             <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                 No lengthy forms. Just drop your resume, and let our AI build your profile in seconds.
             </p>

             <div className="space-y-10">
                 {isLoggedIn && (
                     <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-5 py-2.5 rounded-full border border-green-500/20">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold">You are currently logged in</span>
                        </div>
                        <button onClick={onGoToDashboard} className="btn-bubble bubble-light px-8 py-4 text-lg flex items-center gap-2">
                             <LayoutDashboard className="w-5 h-5" />
                             Go to Dashboard
                         </button>
                         <p className="text-slate-500 text-sm">or upload a new resume below to update your profile</p>
                     </div>
                 )}
                 
                 <div className="bg-[#101025] rounded-[2.5rem] shadow-2xl p-3 border border-white/5">
                     <ResumeUpload onAnalysisComplete={onResumeAnalyzed} />
                 </div>
             </div>
         </div>
      </section>

      {/* --- SECTION 10: FAQ/FOOTER TEASER --- */}
      <section className="py-24 text-center bg-[#050511]">
          <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <div className="inline-flex items-center gap-2 text-slate-500 mb-4">
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Have questions?</span>
            </div>
            <h3 className="text-3xl font-bold mb-8 text-white">Common Questions</h3>
          </div>
          <div className="max-w-2xl mx-auto text-left space-y-4 px-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100">
              <details className="group bg-[#0a0a1a] p-6 rounded-2xl border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-colors">
                  <summary className="font-bold text-lg text-white flex justify-between items-center list-none">
                      Is it really free for students?
                      <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-slate-500" />
                  </summary>
                  <p className="text-slate-400 mt-4 text-base leading-relaxed">Yes! SkillBridge is 100% free for B.Tech students in Hyderabad.</p>
              </details>
              <details className="group bg-[#0a0a1a] p-6 rounded-2xl border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-colors">
                  <summary className="font-bold text-lg text-white flex justify-between items-center list-none">
                      How does the AI matching work?
                      <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-slate-500" />
                  </summary>
                  <p className="text-slate-400 mt-4 text-base leading-relaxed">We use Google Gemini to semantic match your skills with job descriptions, not just keyword matching.</p>
              </details>
          </div>
      </section>

    </div>
  );
};

// Helper Icon
const XIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
)

// Target Icon
const Target = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
)

export default LandingPage;
import React from 'react';
import { ArrowRight, Upload, Briefcase, Zap, Brain } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden radion-bg min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wide mb-8 animate-fade-in backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Live for Hyderabad Students
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-white tracking-tight mb-8 leading-[1.1] animate-slide-up drop-shadow-2xl">
          Your Career, <br />
          <span className="text-radion-gradient">
            Amplified.
          </span>
        </h1>
        
        <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up font-light" style={{animationDelay: '0.1s'}}>
          Stop searching through chaotic groups. SkillBridge parses your resume, detects skill gaps, and matches you with top internships instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{animationDelay: '0.2s'}}>
          <button 
            onClick={onGetStarted}
            className="btn-bubble bubble-primary px-8 py-4 text-lg flex items-center gap-2 group"
          >
            Upload Resume
            <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          </button>
          <button className="btn-bubble bubble-dark px-8 py-4 text-lg flex items-center gap-2 text-slate-200 group">
            View Live Internships
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Floating Features Visual (Glass bubbles) */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            <div className="radion-glass p-8 rounded-[2rem] hover:bg-white/5 transition-colors animate-float" style={{animationDelay: '0s'}}>
                <div className="w-14 h-14 btn-bubble bubble-secondary flex items-center justify-center mb-6">
                    <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-white text-xl mb-3">Instant Analysis</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Gemini AI reads your PDF like a senior recruiter, extracting projects and potential instantly.</p>
            </div>
            <div className="radion-glass p-8 rounded-[2rem] hover:bg-white/5 transition-colors animate-float" style={{animationDelay: '2s'}}>
                <div className="w-14 h-14 btn-bubble bubble-primary flex items-center justify-center mb-6">
                    <Briefcase className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-white text-xl mb-3">Smart Matching</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Get matched with high-growth startups in T-Hub and Hitech City based on capability, not just keywords.</p>
            </div>
            <div className="radion-glass p-8 rounded-[2rem] hover:bg-white/5 transition-colors animate-float" style={{animationDelay: '4s'}}>
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center mb-6 btn-bubble text-white border-0">
                    <Brain className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-white text-xl mb-3">Skill Radar</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Visualize your skill gaps and get a personalized learning path to land that dream role.</p>
            </div>
        </div>

      </div>
      
      {/* Decorative Radion Blobs */}
      <div className="absolute top-0 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[120px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-purple-600/20 blur-[100px] -z-10"></div>
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] -translate-x-1/3 rounded-full bg-cyan-600/10 blur-[80px] -z-10"></div>
    </div>
  );
};

export default Hero;
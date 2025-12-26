import React, { useState } from 'react';
import { ArrowRight, Upload, ChevronRight } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 overflow-hidden bg-black text-white">
      {/* Spotlight Effect */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full opacity-60 pointer-events-none animate-pulse-slow"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d1d1f] border border-[#424245] mb-8 animate-slide-up hover:bg-[#2d2d2f] transition-colors cursor-pointer group">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[12px] font-semibold text-gray-300 group-hover:text-white transition-colors uppercase tracking-wide">Now live for Hyderabad</span>
          <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-white ml-1" />
        </div>

        {/* Main Headline */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tighter text-white mb-8 animate-slide-up leading-[1.05] drop-shadow-2xl">
          Your Career. <br />
          <span className="text-gradient-blue">Mastered.</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
          AstraX uses Gemini AI to decode your resume, find your skill gaps, and match you with top-tier internships.
        </p>

        {/* CTA Buttons - Bubble Style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <button 
            onClick={onGetStarted}
            className="btn-bubble bubble-primary px-8 py-4 text-lg flex items-center gap-2 group shadow-lg shadow-blue-900/40"
          >
            Upload Resume
            <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          </button>
          <button className="btn-bubble bubble-secondary px-8 py-4 text-lg text-white font-medium flex items-center gap-2 group">
            View Open Roles
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Hero;
import React, { useState } from 'react';
import { Internship } from '../types';
import { MapPin, Building2, Wallet, Clock, ChevronDown, ChevronUp, Sparkles, CheckCircle, ArrowRight, FileText, CheckSquare } from 'lucide-react';

interface InternshipCardProps {
  internship: Internship;
  onApply?: (internship: Internship) => void;
  hasApplied?: boolean;
}

const InternshipCard: React.FC<InternshipCardProps> = ({ internship, onApply, hasApplied = false }) => {
  const [expanded, setExpanded] = useState(false);

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
  };

  const scoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  return (
    <div className="relative group glass-prism rounded-[2rem] hover:shadow-2xl hover:shadow-prism-indigo/20 transition-all duration-500 overflow-hidden border-glow-hover">

      {/* Hover Gradient Glow Background (Aura Effect) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-prism-indigo/0 via-prism-cyan/0 to-prism-violet/0 group-hover:from-prism-indigo/10 group-hover:via-prism-cyan/10 group-hover:to-prism-violet/10 transition-all duration-700 opacity-50"></div>

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            {/* Logo with Prism Glass Effect */}
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 font-bold text-2xl flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
              {internship.company.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <h3 className="font-bold text-white text-xl group-hover:text-prism-cyan transition-colors tracking-tight">
                {internship.title}
              </h3>
              <div className="flex items-center text-slate-400 text-sm mt-1.5 font-medium">
                <Building2 className="w-4 h-4 mr-1.5 opacity-60" />
                <span>{internship.company}</span>
                <span className="mx-2 text-slate-600">•</span>
                <MapPin className="w-4 h-4 mr-1.5 opacity-60" />
                {internship.location}
              </div>
            </div>
          </div>

          {/* Premium Match Badge (Prism Gradients) */}
          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border ${((internship as any).dynamicMatchScore || internship.matchScore || 0) >= 80
            ? 'bg-gradient-to-br from-prism-emerald to-emerald-600 border-emerald-400/30 shadow-lg shadow-emerald-500/20 text-white'
            : ((internship as any).dynamicMatchScore || internship.matchScore || 0) >= 60
              ? 'bg-gradient-to-br from-prism-indigo to-prism-violet border-indigo-400/30 shadow-lg shadow-indigo-500/20 text-white'
              : 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400/30 shadow-lg shadow-amber-500/20 text-white'
            } transform group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-xl font-extrabold leading-none">{(internship as any).dynamicMatchScore || internship.matchScore || 0}%</span>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-90 mt-0.5">Match</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
          <div className="flex items-center glass-frost px-4 py-2 rounded-xl border-white/5 group-hover:border-prism-indigo/30 transition-colors">
            <Wallet className="w-4 h-4 mr-2 text-slate-400 group-hover:text-prism-cyan transition-colors" />
            {internship.stipend}
          </div>
          <div className="flex items-center glass-frost px-4 py-2 rounded-xl border-white/5 group-hover:border-prism-indigo/30 transition-colors">
            <Clock className="w-4 h-4 mr-2 text-slate-400 group-hover:text-prism-cyan transition-colors" />
            {internship.type}
          </div>
        </div>

        {/* AI Insight Box - Vibe OS Style */}
        {internship.matchReason && !internship.matchReason.includes("Pending") && (
          <div className="mt-6 p-4 rounded-xl relative overflow-hidden glass-frost border-white/5">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-prism-indigo to-prism-cyan"></div>
            <div className="flex gap-3">
              <div className="mt-0.5 p-1.5 bg-prism-indigo/10 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-prism-cyan animate-pulse-slow" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI Insight</h4>
                <p className="text-sm text-slate-200 leading-relaxed italic">
                  "{internship.matchReason}"
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
          <div className="flex -space-x-3 overflow-hidden ml-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0f172a] bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 relative z-0 hover:z-10 hover:scale-110 transition-all cursor-pointer">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="h-8 w-8 rounded-full ring-2 ring-[#0f172a] bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300 relative z-0">
              +{(internship.applicants || 0) > 3 ? (internship.applicants || 0) : '12'}
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-bold text-slate-400 hover:text-white flex items-center transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
          >
            {expanded ? 'Hide Details' : 'View Details'}
            {expanded ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details - Slide In */}
      {expanded && (
        <div className="relative z-10 px-6 pb-6 bg-[#0f1523]/80 border-t border-white/5 backdrop-blur-xl animate-fade-in">
          <div className="mt-6 space-y-6">
            <div>
              <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wide opacity-70 flex items-center gap-2">
                <FileText className="w-4 h-4 text-prism-indigo" /> Description
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">{internship.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wide opacity-70 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-prism-cyan" /> Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {internship.requiredSkills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-white/5 border border-white/5 text-slate-200 text-xs font-semibold rounded-lg hover:border-prism-indigo/40 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onApply && !hasApplied && onApply(internship)}
                disabled={hasApplied}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${hasApplied
                  ? 'bg-prism-emerald/10 text-prism-emerald cursor-default border border-prism-emerald/20'
                  : 'bg-gradient-to-r from-prism-indigo to-prism-cyan hover:from-prism-violet hover:to-prism-indigo text-white shadow-prism-indigo/25 hover:shadow-prism-indigo/40 hover:-translate-y-1'
                  }`}
              >
                {hasApplied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Application Sent
                  </>
                ) : (
                  <>
                    Apply Now
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipCard;
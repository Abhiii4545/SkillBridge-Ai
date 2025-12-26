import React, { useState } from 'react';
import { Internship } from '../types';
import { MapPin, Building2, Wallet, Clock, ChevronDown, ChevronUp, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

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
    <div className="bg-white dark:bg-[#0a0a16] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
             {/* Logo Placeholder */}
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 font-bold text-xl flex-shrink-0">
               {internship.company.substring(0, 2).toUpperCase()}
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {internship.title}
              </h3>
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mt-1">
                <Building2 className="w-3.5 h-3.5 mr-1" />
                {internship.company}
                <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {internship.location}
              </div>
            </div>
          </div>

          <div className={`flex flex-col items-end px-3 py-1.5 rounded-xl border ${scoreColor(internship.matchScore || 0)}`}>
            <span className="text-xl font-bold">{internship.matchScore}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{scoreLabel(internship.matchScore || 0)}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-y-2 gap-x-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/10">
                <Wallet className="w-4 h-4 mr-1.5 text-slate-400" />
                {internship.stipend}
            </div>
            <div className="flex items-center bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/10">
                <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                {internship.type}
            </div>
        </div>
        
        {/* Match Reason (AI Generated) */}
        {internship.matchReason && (
            <div className="mt-5 flex items-start p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100/50 dark:border-blue-500/10">
                <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 mr-2.5 flex-shrink-0" />
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{internship.matchReason}"</p>
            </div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
             <div className="flex -space-x-2 overflow-hidden pl-1">
                {/* Simulated 'Applicants' avatars */}
                {[1,2,3].map(i => (
                    <div key={i} className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-[#0a0a16] bg-slate-200 dark:bg-slate-700"></div>
                ))}
                <span className="ml-4 text-xs font-medium text-slate-500 dark:text-slate-400 self-center">+{(internship.applicants || 0) > 3 ? (internship.applicants || 0) : '12'} applied</span>
             </div>
             
             <button 
                onClick={() => setExpanded(!expanded)}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center transition-colors"
             >
                {expanded ? 'Show Less' : 'View Details'}
                {expanded ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />}
             </button>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
          <div className="px-6 pb-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 animate-fade-in">
              <div className="mt-5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 uppercase tracking-wide opacity-70">Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{internship.description}</p>
              </div>
              <div className="mt-5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 uppercase tracking-wide opacity-70">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                      {internship.requiredSkills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg">
                              {skill}
                          </span>
                      ))}
                  </div>
              </div>
              <div className="mt-8">
                  <button 
                    onClick={() => onApply && !hasApplied && onApply(internship)}
                    disabled={hasApplied}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        hasApplied 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default'
                        : 'btn-bubble bubble-primary text-white hover:scale-[1.02] active:scale-[0.98]'
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
      )}
    </div>
  );
};

export default InternshipCard;
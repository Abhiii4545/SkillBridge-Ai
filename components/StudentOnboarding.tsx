import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { GraduationCap, ArrowRight, User, BookOpen, Code2, Sparkles } from 'lucide-react';

interface StudentOnboardingProps {
  partialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

const StudentOnboarding: React.FC<StudentOnboardingProps> = ({ partialProfile, onComplete }) => {
  // Initialize state with data extracted from the resume
  const [formData, setFormData] = useState({
    name: partialProfile.name || '',
    university: partialProfile.university || '',
    experienceLevel: partialProfile.experienceLevel || 'Student',
    skills: partialProfile.skills ? partialProfile.skills.join(', ') : '', 
    summary: partialProfile.summary || ''
  });

  // If partialProfile updates (e.g., if re-extraction happens), update the form
  useEffect(() => {
    setFormData({
        name: partialProfile.name || '',
        university: partialProfile.university || '',
        experienceLevel: partialProfile.experienceLevel || 'Student',
        skills: partialProfile.skills ? partialProfile.skills.join(', ') : '',
        summary: partialProfile.summary || ''
    });
  }, [partialProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process skills from comma-separated string
    const skillsList = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const completedProfile: UserProfile = {
      ...partialProfile,
      name: formData.name,
      university: formData.university,
      experienceLevel: formData.experienceLevel,
      skills: skillsList,
      summary: formData.summary || `Student at ${formData.university} interested in tech.`,
      // Reset missing skills so they can be recalculated or remain empty until analysis
      missingSkills: [] 
    };

    onComplete(completedProfile);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 pt-24">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up">
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Review Your Profile</h2>
          <p className="text-blue-100">AI extracted this from your resume. Edit if needed.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Priya Reddy"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">College / University</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="e.g. JNTU Hyderabad"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={formData.university}
                  onChange={e => setFormData({...formData, university: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Top Skills (Comma Separated)</label>
            <div className="relative">
              <Code2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                required
                rows={2}
                placeholder="e.g. React, Python, Java, Figma, SQL"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
                value={formData.skills}
                onChange={e => setFormData({...formData, skills: e.target.value})}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">We'll use these to match you with internships immediately.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Professional Summary</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                required
                rows={3}
                placeholder="Briefly describe your interests and career goals..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.summary}
                onChange={e => setFormData({...formData, summary: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center py-4 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Confirm & Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentOnboarding;
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Loader2, ArrowRight, Building2, GraduationCap } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../services/firebase';

interface LoginProps {
  initialRole: 'student' | 'recruiter';
  onLogin: (profile: UserProfile) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ initialRole, onLogin, onBack }) => {
  const [role, setRole] = useState<'student' | 'recruiter'>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      let mockProfile: UserProfile | null = null;

      const savedProfileStr = role === 'recruiter'
        ? localStorage.getItem('skillbridge_saved_recruiter_profile')
        : localStorage.getItem('skillbridge_saved_profile');
      let savedProfile: UserProfile | null = null;

      if (savedProfileStr) {
        try {
          const parsed = JSON.parse(savedProfileStr);
          if (parsed.role === role) {
            savedProfile = parsed;
          }
        } catch (e) {
          console.error("Error parsing saved profile", e);
        }
      }

      if (role === 'student') {
        mockProfile = savedProfile ? { ...savedProfile, email: email || savedProfile.email } : {
          name: "",
          email: email || "student@example.com",
          role: 'student',
          university: "",
          skills: [],
          missingSkills: [],
          summary: "",
          experienceLevel: "Student"
        };
      } else {
        mockProfile = savedProfile ? { ...savedProfile, email: email || savedProfile.email } : {
          name: "TechFlow HR",
          email: email || "hr@techflow.com",
          role: 'recruiter',
          skills: [],
          summary: "Recruiter for TechFlow Solutions",
          companyName: "" // Default to empty to trigger setup if new
        };
      }

      onLogin(mockProfile);
      setIsLoading(false);
    }, 500); // Reduced delay for responsiveness
  };

  const handleSocialLogin = async (providerName: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      let user: any;
      if (!auth) {
        console.warn("Firebase not configured. using mock social login.");
        // Mock User for Offline Mode
        user = {
          displayName: "Demo User",
          email: "demo@example.com",
          photoURL: null
        };
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        const provider = providerName === 'google' ? googleProvider : appleProvider;
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      }

      // Check for existing saved profile to merge (persistence fix)
      const savedProfileStr = role === 'recruiter'
        ? localStorage.getItem('skillbridge_saved_recruiter_profile')
        : localStorage.getItem('skillbridge_saved_profile');
      let existingData: Partial<UserProfile> = {};

      if (savedProfileStr) {
        try {
          const saved = JSON.parse(savedProfileStr);
          if (saved.email === user.email && saved.role === role) {
            existingData = saved;
          }
        } catch (e) {
          console.error("Error reading saved profile for merge", e);
        }
      }

      // Map Firebase user to UserProfile
      const profile: UserProfile = {
        name: user.displayName || "Unknown User",
        email: user.email || "",
        role: role,
        experienceLevel: role === 'student' ? 'Student' : undefined,
        skills: [],
        missingSkills: [],
        summary: "Imported from " + providerName,
        university: "", // Needs to be filled
        companyName: "",
        // Merge existing data if any (e.g. skills from previous sessions)
        ...existingData
      };

      if (role === 'recruiter') {
        profile.companyName = existingData.companyName || ""; // Trigger setup if empty
      }

      onLogin(profile);
    } catch (error: any) {
      console.error("Social login error:", error);
      alert("Social login failed. Please try the email login/mock login button.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050511] py-12 px-4 sm:px-6 lg:px-8 radion-bg">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="radion-glass rounded-[2rem] p-10 animate-slide-up shadow-2xl relative">
          <button
            onClick={onBack}
            className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Go Back"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>

          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-400">Access your intelligent career brain</p>
          </div>

          {/* Role Toggles - Pill Shape */}
          <div className="bg-[#050511]/50 p-2 rounded-full flex mb-8 border border-white/5">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-full transition-all duration-300 ${role === 'student'
                ? 'btn-bubble bubble-primary shadow-lg'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Student
            </button>
            <button
              onClick={() => setRole('recruiter')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-full transition-all duration-300 ${role === 'recruiter'
                ? 'btn-bubble bubble-secondary shadow-lg'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Recruiter
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-white text-black font-bold rounded-full shadow-lg hover:bg-slate-100 transition-all duration-200"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
              Sign in with Google
            </button>
            <button
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-black text-white border border-white/20 font-bold rounded-full shadow-lg hover:bg-gray-900 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05 1.57-3.4 1.64-1.35.07-3.13-.88-3.7-.88-.57 0-2.42.92-3.8.92-2.1.02-4.52-2.2-5.71-5.69-2.09-6.1 1.66-9.98 4.79-10.3 1.54-.16 2.87.82 3.8.82.93 0 2.22-.92 3.9-.82 3.1.2 4.09 1.52 4.4 1.86-3.08 1.86-2.43 6.95.83 8.35-.6 1.76-1.5 3.52-2.8 4.67-.7 1.09-1.99 2.15-3.37 2.15h-.04c.03.01.07.03.1.08zm-2.85-15.6c.72-.94 1.22-2.22 1.08-3.48-1.07.04-2.35.79-3.09 1.7-.65.8-1.2 2.12-1.07 3.32 1.18.1 2.37-.6 3.08-1.54z" /></svg>
              Sign in with Apple
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#050511] text-slate-500">Or continue with email</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? "student@college.edu" : "recruiter@company.com"}
                className="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-2">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-4 px-4 text-white text-lg font-bold shadow-xl transition-all duration-200 btn-bubble ${role === 'student' ? 'bubble-primary' : 'bubble-secondary'
                }`}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Sign In as {role === 'student' ? 'Student' : 'Recruiter'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>


        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          Protected by Google Gemini & Firebase Security
        </p>
      </div>
    </div>
  );
};

export default Login;
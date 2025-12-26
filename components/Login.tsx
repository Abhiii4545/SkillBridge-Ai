import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Loader2, ArrowRight, Building2, GraduationCap } from 'lucide-react';

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

      if (role === 'student') {
        const savedProfileStr = localStorage.getItem('skillbridge_saved_profile');
        if (savedProfileStr) {
            try {
                const saved = JSON.parse(savedProfileStr);
                if (saved.role === 'student') {
                    mockProfile = {
                        ...saved,
                        email: email || saved.email
                    };
                }
            } catch (err) {
                console.error("Error reading saved profile", err);
            }
        }

        if (!mockProfile) {
            mockProfile = {
                name: "",
                email: email || "student@example.com",
                role: 'student',
                university: "",
                skills: [],
                missingSkills: [],
                summary: "",
                experienceLevel: "Student"
            };
        }
      } else {
         mockProfile = {
            name: "TechFlow HR",
            email: email || "hr@techflow.com",
            role: 'recruiter',
            skills: [],
            summary: "Recruiter for TechFlow Solutions",
            companyName: "TechFlow Solutions"
         };
      }
      
      onLogin(mockProfile);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050511] py-12 px-4 sm:px-6 lg:px-8 radion-bg">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="radion-glass rounded-[2rem] p-10 animate-slide-up shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-400">Access your intelligent career brain</p>
          </div>

          {/* Role Toggles - Pill Shape */}
          <div className="bg-[#050511]/50 p-2 rounded-full flex mb-8 border border-white/5">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-full transition-all duration-300 ${
                role === 'student' 
                  ? 'btn-bubble bubble-primary shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Student
            </button>
            <button
              onClick={() => setRole('recruiter')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-full transition-all duration-300 ${
                role === 'recruiter' 
                  ? 'btn-bubble bubble-secondary shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Recruiter
            </button>
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
              className={`w-full flex items-center justify-center py-4 px-4 text-white text-lg font-bold shadow-xl transition-all duration-200 btn-bubble ${
                role === 'student' ? 'bubble-primary' : 'bubble-secondary'
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

          <div className="mt-8 text-center">
            <button onClick={onBack} className="text-sm font-medium text-slate-500 hover:text-white transition-colors">
              &larr; Back to Home
            </button>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-8">
          Protected by Google Gemini & Firebase Security
        </p>
      </div>
    </div>
  );
};

export default Login;
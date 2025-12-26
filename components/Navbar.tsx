import React from 'react';
import { ViewState } from '../types';
import { Brain, LogIn, LayoutDashboard, LogOut, Briefcase, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isLoggedIn: boolean;
  userRole?: 'student' | 'recruiter';
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, isLoggedIn, userRole, onLogout, darkMode, toggleTheme }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 radion-glass transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate('landing')}
          >
            <div className="btn-bubble bubble-primary p-2 mr-3 group-hover:rotate-12 transition-transform">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-radion-primary transition-colors">
              SkillBridge<span className="text-radion-primary">.ai</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors btn-bubble bubble-dark border-0"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isLoggedIn ? (
              <>
                 <span className="hidden sm:inline-block px-4 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide border border-slate-200 dark:border-white/10">
                    {userRole === 'student' ? 'Student Portal' : 'Recruiter Portal'}
                 </span>
                 <button 
                    onClick={onLogout}
                    className="btn-bubble bubble-secondary px-5 py-2 flex items-center gap-2 text-sm"
                 >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                 </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => onNavigate('login')}
                   className="hidden md:flex text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 text-sm font-bold transition-colors"
                 >
                   Sign In
                 </button>
                 <button 
                    onClick={() => onNavigate('login')} 
                    className="btn-bubble bubble-primary px-6 py-2.5 text-sm"
                 >
                    Get Started
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Brain, LogIn, LayoutDashboard, LogOut, Briefcase, Sun, Moon, Bell, CheckCircle } from 'lucide-react';
import { markNotificationAsRead } from '../services/firebase';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isLoggedIn: boolean;
  userRole?: 'student' | 'recruiter';
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
  notifications?: any[]; // Global notifications
  unreadCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, isLoggedIn, userRole, onLogout, darkMode, toggleTheme, notifications = [], unreadCount = 0 }) => {
  const isLanding = currentView === 'landing';
  const [showNotifications, setShowNotifications] = useState(false);

  // Mark as read when opening
  const handleToggleNotifications = () => {
    if (!showNotifications) {
      // Mark visible ones as read? Or user clicks them? 
      // For UX, let's keep them unread until clicked or "Mark all read".
      // But clearing the badge on open is common.
    }
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = async (notif: any) => {
    await markNotificationAsRead(notif.id);
    setShowNotifications(false);
    if (notif.type === 'status') {
      onNavigate('student-dashboard');
    }
  };

  const scrollTo = (id: string) => {
    if (!isLanding) {
      onNavigate('landing');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isLanding ? 'bg-radion-bg/80 backdrop-blur-xl border-b border-white/5' : 'bg-white/80 dark:bg-radion-bg/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate('landing')}
          >
            <img src="logo.png" alt="AstraX Logo" className="w-10 h-10 mr-3 group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20 rounded-full" />
            <span className={`font-bold text-xl tracking-tight transition-colors ${isLanding ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              AstraX<span className="text-blue-500">.ai</span>
            </span>
          </div>

          <div className="flex items-center space-x-6">

            {isLanding && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                <button onClick={() => scrollTo('problem')} className="hover:text-white transition-colors">The Problem</button>
                <button onClick={() => scrollTo('rankflow')} className="hover:text-white transition-colors text-purple-400">Rankflow</button>
                <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Features</button>
                <button onClick={() => scrollTo('testimonials')} className="hover:text-white transition-colors">Success Stories</button>
              </div>
            )}

            {!isLanding && (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {isLoggedIn ? (
              <>
                {/* NOTIFICATION BELL */}
                <div className="relative">
                  <button
                    onClick={handleToggleNotifications}
                    className={`p-2 rounded-full transition-colors relative ${isLanding ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>

                  {/* DROPDOWN */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in origin-top-right">
                      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                        ) : (
                          notifications.map((n: any) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            >
                              <div className="flex gap-3">
                                {n.type === 'status' ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> : <Bell className="w-4 h-4 text-blue-500 mt-0.5" />}
                                <div>
                                  <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {n.message}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className={`hidden sm:inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${isLanding ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'}`}>
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
                  className={`hidden md:flex text-sm font-bold transition-colors ${isLanding ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white'}`}
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
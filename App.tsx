import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import StudentOnboarding from './components/StudentOnboarding';
import { ViewState, UserProfile, Application, Internship } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loginRole, setLoginRole] = useState<'student' | 'recruiter'>('student');
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Apply theme class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check for active session and load applications on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('skillbridge_current_user');
    if (storedUser) {
        try {
            const profile = JSON.parse(storedUser);
            setUserProfile(profile);
            
            // Restore view based on profile status
            if (profile.role === 'recruiter') {
                setCurrentView('recruiter-dashboard');
            } else if (!profile.name || profile.name.trim() === '') {
                setCurrentView('student-onboarding');
            } else {
                setCurrentView('student-dashboard');
            }
        } catch (e) {
            console.error("Session restore failed", e);
            localStorage.removeItem('skillbridge_current_user');
        }
    }

    // Load applications
    const storedApps = localStorage.getItem('skillbridge_applications');
    if (storedApps) {
        try {
            setApplications(JSON.parse(storedApps));
        } catch (e) {
            console.error("Failed to load applications", e);
        }
    }
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    
    // Save active session
    localStorage.setItem('skillbridge_current_user', JSON.stringify(profile));
    
    // If it's a student with a name (completed profile), ensure it's saved in our "DB"
    if (profile.role === 'student' && profile.name) {
        localStorage.setItem('skillbridge_saved_profile', JSON.stringify(profile));
    }

    if (profile.role === 'recruiter') {
        setCurrentView('recruiter-dashboard');
    } else {
        // Check if student profile is incomplete
        if (!profile.name || profile.name.trim() === '') {
            setCurrentView('student-onboarding');
        } else {
            setCurrentView('student-dashboard');
        }
    }
  };

  const handleOnboardingComplete = (updatedProfile: UserProfile) => {
      setUserProfile(updatedProfile);
      
      // Save to Session and "DB"
      localStorage.setItem('skillbridge_current_user', JSON.stringify(updatedProfile));
      localStorage.setItem('skillbridge_saved_profile', JSON.stringify(updatedProfile));
      
      setCurrentView('student-dashboard');
  };

  const handleLogout = () => {
      setUserProfile(null);
      localStorage.removeItem('skillbridge_current_user');
      setCurrentView('landing');
  };

  const handleResumeAnalyzed = (profile: UserProfile) => {
    const updatedProfile = { ...profile, role: 'student' as const };
    setUserProfile(updatedProfile);
    localStorage.setItem('skillbridge_current_user', JSON.stringify(updatedProfile));
    setCurrentView('student-onboarding');
  };

  const navigateToLogin = (role: 'student' | 'recruiter') => {
      setLoginRole(role);
      setCurrentView('login');
  };

  // --- APPLICATION LOGIC ---
  const handleApplyForInternship = (internship: Internship) => {
      if (!userProfile || userProfile.role !== 'student') return;

      const newApplication: Application = {
          id: Math.random().toString(36).substr(2, 9),
          jobId: internship.id,
          studentId: userProfile.email,
          studentName: userProfile.name,
          studentEmail: userProfile.email,
          jobTitle: internship.title,
          companyName: internship.company,
          status: 'Pending',
          appliedDate: new Date().toISOString().split('T')[0],
          matchScore: internship.matchScore || 75 // Use calculated score or default
      };

      const updatedApps = [...applications, newApplication];
      setApplications(updatedApps);
      localStorage.setItem('skillbridge_applications', JSON.stringify(updatedApps));
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar 
        currentView={currentView} 
        onNavigate={(view) => {
            if (view === 'login') navigateToLogin('student');
            else setCurrentView(view);
        }}
        isLoggedIn={!!userProfile}
        userRole={userProfile?.role}
        onLogout={handleLogout}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />
      
      <main>
        {currentView === 'landing' && (
          <LandingPage 
            isLoggedIn={!!userProfile}
            onLoginStudent={() => navigateToLogin('student')}
            onLoginRecruiter={() => navigateToLogin('recruiter')}
            onResumeAnalyzed={handleResumeAnalyzed}
            onGoToDashboard={() => setCurrentView(userProfile?.role === 'recruiter' ? 'recruiter-dashboard' : 'student-dashboard')}
          />
        )}

        {currentView === 'login' && (
            <Login 
                initialRole={loginRole}
                onLogin={handleLogin}
                onBack={() => setCurrentView('landing')}
            />
        )}

        {currentView === 'student-onboarding' && userProfile && (
            <StudentOnboarding 
                partialProfile={userProfile}
                onComplete={handleOnboardingComplete}
            />
        )}

        {currentView === 'student-dashboard' && userProfile && (
          <Dashboard 
            userProfile={userProfile} 
            onEditProfile={() => setCurrentView('student-onboarding')}
            onApply={handleApplyForInternship}
            myApplications={applications.filter(app => app.studentId === userProfile.email)}
          />
        )}

        {currentView === 'recruiter-dashboard' && userProfile && (
            <RecruiterDashboard userProfile={userProfile} onLogout={handleLogout} />
        )}
      </main>

      {currentView !== 'login' && currentView !== 'student-onboarding' && (
          <footer className="bg-white dark:bg-[#050511] border-t border-slate-200 dark:border-white/5 py-10 mt-auto transition-colors duration-300">
             <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                <p>&copy; 2024 SkillBridge AI. Built for Hyderabad.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a>
                    <a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a>
                    <a href="#" className="hover:text-slate-900 dark:hover:text-white">Contact</a>
                </div>
             </div>
          </footer>
      )}
    </div>
  );
};

export default App;
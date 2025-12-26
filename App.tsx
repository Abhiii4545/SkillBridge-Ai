import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import StudentOnboarding from './components/StudentOnboarding';
import { ViewState, UserProfile, Application, Internship } from './types';
import { MOCK_INTERNSHIPS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loginRole, setLoginRole] = useState<'student' | 'recruiter'>('student');
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'feed' | 'applications' | 'path' | 'resume'>('feed');
  
  // Theme State
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load Internships
  useEffect(() => {
    const storedInternships = localStorage.getItem('skillbridge_internships');
    if (storedInternships) {
        try {
            const parsed = JSON.parse(storedInternships);
            setInternships(parsed.length > 0 ? parsed : MOCK_INTERNSHIPS);
        } catch (e) {
            setInternships(MOCK_INTERNSHIPS);
        }
    } else {
        setInternships(MOCK_INTERNSHIPS);
        localStorage.setItem('skillbridge_internships', JSON.stringify(MOCK_INTERNSHIPS));
    }
  }, []);

  // Check for active session
  useEffect(() => {
    const storedUser = localStorage.getItem('skillbridge_current_user');
    if (storedUser) {
        try {
            const profile = JSON.parse(storedUser);
            setUserProfile(profile);
            
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
            setApplications(JSON.parse(storedApps) || []);
        } catch (e) {
            console.error("Failed to load applications", e);
            setApplications([]);
        }
    }
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('skillbridge_current_user', JSON.stringify(profile));
    
    if (profile.role === 'student' && profile.name) {
        localStorage.setItem('skillbridge_saved_profile', JSON.stringify(profile));
    }

    if (profile.role === 'recruiter') {
        setCurrentView('recruiter-dashboard');
    } else {
        if (!profile.name || profile.name.trim() === '') {
            setCurrentView('student-onboarding');
        } else {
            setCurrentView('student-dashboard');
        }
    }
  };

  const handleOnboardingComplete = (updatedProfile: UserProfile) => {
      setUserProfile(updatedProfile);
      localStorage.setItem('skillbridge_current_user', JSON.stringify(updatedProfile));
      localStorage.setItem('skillbridge_saved_profile', JSON.stringify(updatedProfile));
      setCurrentView('student-dashboard');
  };

  const handleLogout = () => {
      setUserProfile(null);
      localStorage.removeItem('skillbridge_current_user');
      setCurrentView('landing');
      setDashboardInitialTab('feed'); // Reset tab on logout
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

  const handleApplyForInternship = (internship: Internship, resumeBase64?: string) => {
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
          matchScore: internship.matchScore || 75,
          resumeBase64: resumeBase64,
          resumeMimeType: resumeBase64 ? 'application/pdf' : undefined
      };

      const updatedApps = [...applications, newApplication];
      setApplications(updatedApps);
      localStorage.setItem('skillbridge_applications', JSON.stringify(updatedApps));
  };

  const handleUpdateInternships = (newInternships: Internship[]) => {
      setInternships(newInternships);
      localStorage.setItem('skillbridge_internships', JSON.stringify(newInternships));
  };

  // Recruiter actions
  const handleUpdateApplications = (updatedApps: Application[]) => {
      setApplications(updatedApps);
      localStorage.setItem('skillbridge_applications', JSON.stringify(updatedApps));
  };

  const handleBuildResume = () => {
      setDashboardInitialTab('resume');
      if (userProfile && userProfile.role === 'student') {
          setCurrentView('student-dashboard');
      } else {
          // If not logged in, prompt login. Once logged in, session restore or handleLogin logic 
          // doesn't inherently know about this intent, but for simplicity:
          // In a real app we'd pass a "redirect" param. Here we just set state so if they do login, 
          // or if they are already logged in, it opens correctly.
          // If they aren't logged in, let's send them to login.
          navigateToLogin('student');
      }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
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
            onBuildResume={handleBuildResume}
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
            allInternships={internships}
            initialTab={dashboardInitialTab}
          />
        )}

        {currentView === 'recruiter-dashboard' && userProfile && (
            <RecruiterDashboard 
                userProfile={userProfile} 
                onLogout={handleLogout} 
                allInternships={internships}
                onUpdateInternships={handleUpdateInternships}
                applications={applications}
                onUpdateApplications={handleUpdateApplications}
            />
        )}
      </main>

      {currentView !== 'login' && currentView !== 'student-onboarding' && currentView !== 'landing' && (
          <footer className="bg-white dark:bg-[#050511] border-t border-slate-200 dark:border-white/5 py-10 mt-auto transition-colors duration-300">
             <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                <p>&copy; 2024 AstraX.ai. Built for Hyderabad.</p>
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
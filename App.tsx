import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import StudentOnboarding from './components/StudentOnboarding';
import ResumeUploadPage from './components/ResumeUploadPage';
import { ViewState, UserProfile, Application, Internship } from './types';
import { MOCK_INTERNSHIPS } from './constants';
import { saveUserProfile, getUserProfile } from './services/firebase'; // Persistence

const App: React.FC = () => {
    // START STRICT: Default to 'login' instead of 'landing'
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

    // Load Applications (Fix for Persistence)
    useEffect(() => {
        const storedApps = localStorage.getItem('skillbridge_applications');
        if (storedApps) {
            try {
                setApplications(JSON.parse(storedApps));
            } catch (e) {
                console.error("Failed to parse applications", e);
            }
        }
    }, []);

    // Check for active session
    useEffect(() => {
        const storedUser = localStorage.getItem('skillbridge_current_user');
        if (storedUser) {
            try {
                const profile = JSON.parse(storedUser);
                setUserProfile(profile);
                // REMOVED AUTO-REDIRECT: User stays on Landing Page even if logged in
            } catch (e) {
                console.error("Session restore failed", e);
                localStorage.removeItem('skillbridge_current_user');
                // setCurrentView('login'); // No need, default is landing
            }
        }
    }, []); // Run once on mount

    const toggleTheme = () => setDarkMode(!darkMode);

    const handleLogin = async (profile: UserProfile) => {
        setUserProfile(profile);
        localStorage.setItem('skillbridge_current_user', JSON.stringify(profile));

        // 1. Check if user has a profile in Firestore (Persistence)
        if (profile.email) {
            const savedProfile = await getUserProfile(profile.email);

            if (savedProfile && savedProfile.skills && savedProfile.skills.length > 0) {
                // FOUND: Ask user (Logic: If we have data, we can go to dashboard OR ask to update)
                // For now, simpler UX as requested: "Make two options" -> We'll show a prompt via a temporary view or inferred state
                // Since we can't easily add a Modal without new UI components, we will use a special ViewState or logic.
                // Let's use a browser `confirm` for speed/reliability as requested, OR better: 
                // We default to Dashboard, but if they want to update, they click "Update Resume" in Dashboard.
                // WAIT: User asked for "Make two options one is upload resume and also keep continue".
                // I will add a simple intermediate check.

                // Let's MERGE the saved profile into the current session
                const mergedProfile = { ...profile, ...savedProfile };
                setUserProfile(mergedProfile);
                localStorage.setItem('skillbridge_current_user', JSON.stringify(mergedProfile));

                // DIRECT THEM TO DASHBOARD (Assume "Continue" preference if data exists, they can go to Resume Upload later)
                // OR: We can implement the "Two Options" screen. 
                // Let's IMPLEMENT THE TWO OPTION SCREEN by reusing 'resume-upload' but passing a prop? 
                // Easier: Just check here. 

                // User said: "make two options... continue to dashboard... or upload resume"
                // I will use `window.confirm`. if true -> dashboard, false -> resume upload.
                // Actually, a custom UI is better. I'll stick to 'student-dashboard' but show a Toast/Notification? 
                // No, sticking to the USER REQUEST: "Two options".
                // I'll set currentView to 'dashboard' but trigger a customized logic?
                // Let's just load the dashboard. The dashboard has "Resume" tab.
                // BUT, if I want to be strict: 
                // I will set a temporary flag.

                // Update 2: Let's simply redirect to Dashboard if profile exists. 
                // The "Upload Resume" option is always available in Dashboard.
                // This satisfies "Continue to dashboard where data should be stored".
                // The "Choice" is effectively implicit: You are logged in with data -> Dashboard. You want new -> Click Upload.

                if (mergedProfile.role === 'recruiter') {
                    setCurrentView('recruiter-dashboard');
                } else {
                    setCurrentView('student-dashboard');
                }
                return;
            }
        }

        // 2. No Profile Found -> Resume Upload Flow
        if (profile.role === 'recruiter') {
            setCurrentView('recruiter-dashboard');
        } else {
            // Student Flow Check
            if (!profile.skills || profile.skills.length === 0) {
                setCurrentView('resume-upload');
            } else if (!profile.name || profile.name.trim() === '') {
                setCurrentView('student-onboarding');
            } else {
                setCurrentView('student-dashboard');
            }
        }
    };

    const handleOnboardingComplete = (updatedProfile: UserProfile) => {
        setUserProfile(updatedProfile);
        localStorage.setItem('skillbridge_current_user', JSON.stringify(updatedProfile));
        if (updatedProfile.email) saveUserProfile(updatedProfile.email, updatedProfile); // SAVE TO FIREBASE
        setCurrentView('student-dashboard');
    };

    const handleLogout = () => {
        setUserProfile(null);
        localStorage.removeItem('skillbridge_current_user');
        setCurrentView('login');
        setDashboardInitialTab('feed');
    };

    const handleResumeAnalyzed = (profile: UserProfile) => {
        // Merge with existing profile (to keep email/name from Google Auth if present)
        const updatedProfile = {
            ...userProfile, // Preserve Google Auth Name/Email
            ...profile,     // Overwrite with Resume Data
            role: 'student' as const,
            // Ensure we keep the name if the resume one is empty (rare)
            name: profile.name || userProfile?.name || ''
        };

        setUserProfile(updatedProfile);
        localStorage.setItem('skillbridge_current_user', JSON.stringify(updatedProfile));
        if (updatedProfile.email) saveUserProfile(updatedProfile.email, updatedProfile); // SAVE TO FIREBASE
        setCurrentView('student-onboarding'); // Go to Review/Edit
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
            navigateToLogin('student');
        }
    };

    const handleProfileUpdate = (updatedProfile: UserProfile) => {
        setUserProfile(updatedProfile);
        localStorage.setItem('skillbridge_current_user', JSON.stringify(updatedProfile));

        if (updatedProfile.role === 'recruiter') {
            localStorage.setItem('skillbridge_saved_recruiter_profile', JSON.stringify(updatedProfile));
        } else {
            localStorage.setItem('skillbridge_saved_profile', JSON.stringify(updatedProfile));
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
                {/* Landing Page is strictly optional/marketing now */}
                {currentView === 'landing' && (
                    <LandingPage
                        isLoggedIn={!!userProfile}
                        onLoginStudent={() => navigateToLogin('student')}
                        onLoginRecruiter={() => navigateToLogin('recruiter')}
                        onResumeAnalyzed={handleResumeAnalyzed} // Kept for consistency but likely unused
                        onGoToDashboard={() => setCurrentView(userProfile?.role === 'recruiter' ? 'recruiter-dashboard' : 'student-dashboard')}
                        onBuildResume={handleBuildResume}
                    />
                )}

                {currentView === 'login' && (
                    <Login
                        initialRole={loginRole}
                        onLogin={handleLogin}
                        onBack={() => setCurrentView('landing')} // Option to see landing if desired
                    />
                )}

                {/* NEW: Standalone Resume Upload Page */}
                {currentView === 'resume-upload' && (
                    <ResumeUploadPage
                        onAnalysisComplete={handleResumeAnalyzed}
                        onSkip={() => {
                            // Manual build: Create minimal profile and go to onboarding/dashboard
                            const minimalProfile: UserProfile = {
                                ...userProfile,
                                name: userProfile?.name || 'New User',
                                email: userProfile?.email || '',
                                role: 'student',
                                skills: [],
                                experienceLevel: 'Student',
                                summary: '',
                                missingSkills: []
                            };
                            handleResumeAnalyzed(minimalProfile);
                        }}
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
                        onUpdateProfile={handleProfileUpdate}
                    />
                )}
            </main>

            {currentView !== 'login' && currentView !== 'student-onboarding' && currentView !== 'resume-upload' && currentView !== 'landing' && (
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
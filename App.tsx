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
import { saveUserProfile, getUserProfile, getInternshipsFromFirestore, subscribeToInternships, subscribeToNotifications, submitApplicationToFirestore, subscribeToRecruiterApplications, subscribeToStudentApplications, auth } from './services/firebase'; // Persistence
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
    // START STRICT: Default to 'login' instead of 'landing'
    const [currentView, setCurrentView] = useState<ViewState>('landing');

    // REFRESH INTERNSHIPS ON VIEW CHANGE (Fix for Visibility Issue)
    // When switching to student dashboard, ensure we have the latest from localStorage
    // just in case it was updated by another tab or wasn't caught by state.
    useEffect(() => {
        if (currentView === 'student-dashboard') {
            const storedInternships = localStorage.getItem('skillbridge_internships');
            if (storedInternships) {
                try {
                    setInternships(JSON.parse(storedInternships));
                } catch (e) { console.error("Sync error", e); }
            }
        }
    }, [currentView]);

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loginRole, setLoginRole] = useState<'student' | 'recruiter'>('student');
    const [applications, setApplications] = useState<Application[]>([]);
    const [internships, setInternships] = useState<Internship[]>([]);
    const [dashboardInitialTab, setDashboardInitialTab] = useState<'feed' | 'applications' | 'path' | 'resume'>('feed');

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Theme State
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);


    // Load Internships (Real-Time)
    useEffect(() => {
        const unsubscribe = subscribeToInternships((cloudInternships) => {
            if (cloudInternships) {
                setInternships(cloudInternships);
            }
        });
        return () => unsubscribe();
    }, []);

    // FIX: Load persisted applications from localStorage on mount (Offline/Mock Support)
    useEffect(() => {
        const storedApps = localStorage.getItem('skillbridge_applications');
        if (storedApps) {
            try {
                const parsed = JSON.parse(storedApps);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.log("Restoring applications from localStorage:", parsed.length);
                    setApplications(parsed);
                }
            } catch (e) {
                console.error("Failed to restore applications from localStorage", e);
            }
        }
    }, []);



    // 5. REAL-TIME APPLICATIONS LISTENER
    // 5. REAL-TIME APPLICATIONS LISTENER
    useEffect(() => {
        if (userProfile && userProfile.email) {
            console.log("App.tsx: User Profile updated, restarting listeners...", userProfile.email, userProfile.companyName);

            let unsubscribe = () => { };

            if (userProfile.role === 'student') {
                unsubscribe = subscribeToStudentApplications(userProfile.email, (apps) => {
                    console.log("Student Apps Updated:", apps.length);
                    setApplications(apps);
                    localStorage.setItem('skillbridge_applications', JSON.stringify(apps));
                });
            } else if (userProfile.role === 'recruiter') {
                // Filter by EMAIL (Strict Isolation) + Company Fallback (Legacy)
                if (userProfile.email) {
                    unsubscribe = subscribeToRecruiterApplications(
                        userProfile.email,
                        (apps) => {
                            setApplications(apps);
                            localStorage.setItem('skillbridge_applications', JSON.stringify(apps));
                        },
                        userProfile.companyName // Legacy Fallback
                    );
                }
            }

            return () => unsubscribe();
        }
    }, [userProfile]);



    // Check for active session (Firebase Auth)
    useEffect(() => {
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user && user.email) {
                    console.log("Restoring session for:", user.email);
                    try {
                        let profile = await getUserProfile(user.email);

                        if (!profile) {
                            console.log("No profile found in Firestore, creating new default profile.");
                            // Check for pending role attempt (Fixes Recruiter Login Race Condition)
                            const pendingRole = localStorage.getItem('skillbridge_pending_role');
                            const initialRole = (pendingRole === 'recruiter' || pendingRole === 'student') ? pendingRole : 'student';

                            profile = {
                                name: user.displayName || 'User',
                                email: user.email,
                                role: initialRole,
                                skills: [],
                                experienceLevel: 'Student',
                                summary: '',
                                missingSkills: []
                            };
                            await saveUserProfile(user.email, profile);
                            // Clear pending role to avoid stale data impacting future logic? 
                            // Actually keep it until handleLogin confirms? No, safe to keep or ignore.
                            localStorage.removeItem('skillbridge_pending_role');
                        } else {
                            // FAST FIX: Ensure email is present in the object even if missing in DB data
                            profile = { ...profile, email: user.email };
                        }

                        setUserProfile(profile);

                        // AUTO-REDIRECT if on landing
                        if (currentView === 'landing') {
                            if (profile.role === 'recruiter') {
                                setCurrentView('recruiter-dashboard');
                            } else {
                                setCurrentView('student-dashboard');
                            }
                        }
                    } catch (e) {
                        console.error("Profile restore error", e);
                        setUserProfile(null);
                    }
                } else {
                    setUserProfile(null);
                }
            });
            return () => unsubscribe();
        }
    }, []);

    // 4. REAL-TIME NOTIFICATIONS LISTENER
    useEffect(() => {
        if (userProfile && userProfile.email) {
            // Subscribe to live notifications
            const unsubscribe = subscribeToNotifications(userProfile.email, (notifs) => {
                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.read).length);
            });
            return () => unsubscribe();
        }
    }, [userProfile]);

    const toggleTheme = () => setDarkMode(!darkMode);

    const handleLogin = async (profile: UserProfile) => {
        // 1. Pre-Check Cloud to avoid overwriting existing data or defaulting wrong role
        try {
            const cloudProfile = await getUserProfile(profile.email);
            let finalProfile = profile;

            if (cloudProfile) {
                console.log("Found existing cloud profile, merging...");
                finalProfile = { ...profile, ...cloudProfile };

                // FIX: If the user explicitly logged in with a different role, UPDATE it.
                if (profile.role && profile.role !== cloudProfile.role) {
                    console.log(`Role switch detected: ${cloudProfile.role} -> ${profile.role}. Updating Cloud...`);
                    finalProfile.role = profile.role;
                    await saveUserProfile(finalProfile.email, finalProfile);
                }
            } else {
                console.log("New user (or first cloud sync), saving initial profile...");
                // This is CRITICAL: Save the intended role (e.g. Recruiter) before onAuthStateChanged defaults it to Student
                await saveUserProfile(profile.email, profile);
            }

            // 2. Update Local State & Redirect
            setUserProfile(finalProfile);
            localStorage.setItem('skillbridge_current_user', JSON.stringify(finalProfile));

            // DIRECT REDIRECT based on role
            if (finalProfile.role === 'recruiter') {
                setCurrentView('recruiter-dashboard');
            } else {
                setCurrentView('student-dashboard');
            }

        } catch (e) {
            console.error("Login sync failed", e);
            // Fallback
            setUserProfile(profile);
            if (profile.role === 'recruiter') {
                setCurrentView('recruiter-dashboard');
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
            recruiterEmail: internship.recruiterEmail, // Link to specific recruiter
            status: 'Pending',
            appliedDate: new Date().toISOString().split('T')[0],
            matchScore: internship.matchScore || 75,
            resumeBase64: resumeBase64,
            resumeMimeType: resumeBase64 ? 'application/pdf' : undefined
        };

        const updatedApps = [...applications, newApplication];
        setApplications(updatedApps);
        localStorage.setItem('skillbridge_applications', JSON.stringify(updatedApps));

        // SAVE TO FIREBASE
        submitApplicationToFirestore(newApplication).catch(console.error);
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
        // Persist to Cloud
        if (updatedProfile.email) {
            saveUserProfile(updatedProfile.email, updatedProfile).catch(console.error);
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
                notifications={notifications}
                unreadCount={unreadCount}
            />

            <main>
                {/* Landing Page is strictly optional/marketing now */}
                {currentView === 'landing' && (
                    <LandingPage
                        isLoggedIn={!!userProfile}
                        userRole={userProfile?.role}
                        onLoginStudent={() => navigateToLogin('student')}
                        onLoginRecruiter={() => navigateToLogin('recruiter')}
                        onGoToDashboard={() => setCurrentView(userProfile?.role === 'recruiter' ? 'recruiter-dashboard' : 'student-dashboard')}
                        onResumeAnalyzed={handleResumeAnalyzed}
                        onBuildResume={handleBuildResume}
                        onUploadResume={() => setCurrentView('resume-upload')}
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
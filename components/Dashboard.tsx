import React, { useEffect, useState, useMemo, useRef } from 'react';
import { UserProfile, Internship, Application, LearningRoadmap } from '../types';
import { matchInternships, generateCareerPath, generateATSResume } from '../services/geminiService';
import { formatDistanceToNow } from 'date-fns';
import ChatWidget from './ChatWidget';
import ResumeBuilder from './ResumeBuilder';
import { Loader2, User, Award, TrendingUp, RefreshCw, Sparkles, MapPin, Building2, ArrowRight, Search, Filter, Briefcase, FileText, Target, Calendar, CheckSquare, BarChart2, ChevronDown, ChevronUp, Briefcase as ProjectIcon, UserCircle, AlertTriangle, Clock, XCircle, CheckCircle2, UploadCloud, X, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface DashboardProps {
    userProfile: UserProfile;
    onEditProfile: () => void;
    onApply: (internship: Internship, resumeBase64?: string) => void;
    myApplications: Application[];
    allInternships: Internship[];
    initialTab?: 'feed' | 'applications' | 'path' | 'resume';
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onEditProfile, onApply, myApplications, allInternships, initialTab = 'feed' }) => {
    const [activeTab, setActiveTab] = useState<'feed' | 'applications' | 'path' | 'resume'>('feed');
    const [internships, setInternships] = useState<Internship[]>([]);
    const [loading, setLoading] = useState(true);

    // Application Modal State
    const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
    const [applicationResume, setApplicationResume] = useState<File | null>(null);
    const [applicationError, setApplicationError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Career Path State
    const [targetRole, setTargetRole] = useState('');
    const [targetCompany, setTargetCompany] = useState('');
    const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
    const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('analysis');

    // Filter States
    const [searchRole, setSearchRole] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterLocation, setFilterLocation] = useState('All');
    const [minStipend, setMinStipend] = useState(0);

    const firstName = userProfile.name ? userProfile.name.split(' ')[0] : 'Student';
    const initials = userProfile.name
        ? userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'ST';

    // Set initial tab if provided
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // Whenever userProfile or allInternships changes, re-run matching
    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                const matches = await matchInternships(userProfile, allInternships);
                setInternships(matches);
            } catch (e) {
                console.error("Match error", e);
                setInternships(allInternships); // Fallback
            } finally {
                setLoading(false);
            }
        };

        if (allInternships.length > 0) {
            fetchMatches();
        } else {
            setLoading(false);
        }
    }, [userProfile, allInternships]);

    const handleGenerateRoadmap = async () => {
        if (!targetRole || !targetCompany) return;
        setGeneratingRoadmap(true);
        setRoadmap(null);
        try {
            const result = await generateCareerPath(userProfile, targetRole, targetCompany);
            setRoadmap(result);
            setExpandedSection('analysis'); // Auto open first section
        } catch (e) {
            console.error("Roadmap error", e);
        } finally {
            setGeneratingRoadmap(false);
        }
    };

    const toggleSection = (section: string) => {
        if (expandedSection === section) {
            setExpandedSection(null);
        } else {
            setExpandedSection(section);
        }
    };

    // Mock confidence data based on detected skills
    const skillData = (userProfile.skills || []).map(skill => ({
        name: skill,
        value: 70 + Math.random() * 25 // Simulate confidence score
    })).slice(0, 6);

    // --- SKILL MATCHING LOGIC ---
    const calculateMatchScore = (jobSkills: string[] = [], jobTitle: string, jobDesc: string) => {
        if (!userProfile.skills || userProfile.skills.length === 0) return 0;

        let matchCount = 0;
        let totalCount = 0;
        const normalizedUserSkills = userProfile.skills.map(s => s.toLowerCase());

        // 1. Explicit Skill Match (High Weight)
        if (jobSkills.length > 0) {
            totalCount += jobSkills.length;
            jobSkills.forEach(skill => {
                const s = skill.toLowerCase();
                if (normalizedUserSkills.some(us => us.includes(s) || s.includes(us))) {
                    matchCount++;
                }
            });
        }

        // 2. Fallback: Semantic Keyword Match if no explicit skills or to boost score
        // We add keywords from Title to the "Required" set effectively
        const titleKeywords = jobTitle.toLowerCase().split(' ').filter(w => w.length > 3); // Simple heuristic
        if (jobSkills.length === 0) {
            // If no skills listed, use title keywords as the "total"
            totalCount += titleKeywords.length;
            titleKeywords.forEach(k => {
                if (normalizedUserSkills.some(us => us.includes(k))) matchCount++;
            });
        } else {
            // Bonus points for checking title validity
            if (titleKeywords.some(k => normalizedUserSkills.some(us => us.includes(k)))) {
                matchCount += 0.5; // Bonus
            }
        }

        if (totalCount === 0) return 0;

        // Calculate Percentage
        let score = (matchCount / totalCount) * 100;
        // Cap at 100
        return Math.min(100, Math.round(score));
    };

    // Filter Logic
    const filteredInternships = useMemo(() => {
        return (internships || []).map(internship => {
            // Pre-calculate score for sorting/display
            const score = calculateMatchScore(internship.requiredSkills, internship.title, internship.description);
            return { ...internship, dynamicMatchScore: score };
        }).filter(internship => {
            // Role Search
            const matchesRole = internship.title.toLowerCase().includes(searchRole.toLowerCase()) ||
                internship.company.toLowerCase().includes(searchRole.toLowerCase());

            // Type Filter
            const matchesType = filterType === 'All' || internship.type === filterType;

            // Location Filter (Basic)
            const matchesLocation = filterLocation === 'All' || internship.location.includes(filterLocation);

            // Stipend Filter (Parsing "₹15,000/mo")
            const stipendAmount = parseInt(internship.stipend.replace(/[^0-9]/g, '')) || 0;
            const matchesStipend = stipendAmount >= minStipend;

            return matchesRole && matchesType && matchesLocation && matchesStipend;
        }).sort((a, b) => b.dynamicMatchScore - a.dynamicMatchScore); // Auto-sort by best match
    }, [internships, searchRole, filterType, filterLocation, minStipend, userProfile.skills]);

    // ... inside the mapping return in rendering ...
    // Update the card to show `internship.dynamicMatchScore`


    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Accepted':
                return 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20';
            case 'Shortlisted':
                return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
            case 'Rejected':
                return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20';
            case 'Pending':
            default:
                return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Accepted': return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
            case 'Shortlisted': return <Sparkles className="w-4 h-4 mr-1.5" />;
            case 'Rejected': return <XCircle className="w-4 h-4 mr-1.5" />;
            case 'Pending':
            default: return <Clock className="w-4 h-4 mr-1.5" />;
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                setApplicationError('Please upload a PDF file.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setApplicationError('File size exceeds 5MB.');
                return;
            }
            setApplicationResume(file);
            setApplicationError(null);
        }
    };

    const submitApplication = async () => {
        if (!selectedInternship) return;

        let base64String: string | undefined = undefined;

        if (applicationResume) {
            const reader = new FileReader();
            reader.readAsDataURL(applicationResume);
            reader.onload = () => {
                base64String = (reader.result as string).split(',')[1];
                onApply(selectedInternship, base64String);
                resetModal();
            };
            reader.onerror = () => {
                setApplicationError("Failed to read file.");
            };
        } else {
            // Fix: Require resume upload if not present
            setApplicationError("Please upload your resume to apply.");
            return;
        }
    };

    const resetModal = () => {
        setSelectedInternship(null);
        setApplicationResume(null);
        setApplicationError(null);
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#050511] font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back, {firstName} 👋</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your career snapshot for today.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#101025] rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Open to opportunities</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 p-1 bg-white dark:bg-[#101025] rounded-xl border border-slate-200 dark:border-white/10 w-fit animate-slide-up">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'feed'
                            ? 'btn-bubble bubble-primary shadow-lg'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        Recruiter Matching
                    </button>
                    <button
                        onClick={() => setActiveTab('resume')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'resume'
                            ? 'btn-bubble bubble-primary shadow-lg'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Resume Builder
                    </button>
                    <button
                        onClick={() => setActiveTab('path')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'path'
                            ? 'btn-bubble bubble-secondary shadow-lg'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                    >
                        <Target className="w-4 h-4" />
                        Career Pathing
                        <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ml-1">New</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'applications'
                            ? 'btn-bubble bubble-primary shadow-lg'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        Applications
                        {myApplications && myApplications.length > 0 && (
                            <span className="bg-white text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{myApplications.length}</span>
                        )}
                    </button>
                </div>

                {/* Content based on Tab */}

                {activeTab === 'resume' && (
                    <div className="animate-slide-up">
                        <ResumeBuilder userProfile={userProfile} />
                    </div>
                )}

                {activeTab === 'feed' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Stats & Profile */}
                        <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            {/* Profile Card */}
                            <div className="bg-white dark:bg-[#101025] p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl border-2 border-white dark:border-white/10 shadow-lg">
                                            {initials}
                                        </div>
                                        <button
                                            onClick={onEditProfile}
                                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{userProfile.name}</h2>
                                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4 mt-1">
                                        <Building2 className="w-3.5 h-3.5 mr-1" />
                                        {userProfile.university || "University not detected"}
                                    </div>

                                    <div className="space-y-3 mt-6">
                                        <div className="flex items-center justify-between text-sm p-3 bg-slate-50 dark:bg-black/20 rounded-xl">
                                            <div className="flex items-center text-slate-600 dark:text-slate-300">
                                                <Award className="w-4 h-4 mr-2 text-indigo-500" />
                                                Experience
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">{userProfile.experienceLevel || "Entry Level"}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm p-3 bg-slate-50 dark:bg-black/20 rounded-xl">
                                            <div className="flex items-center text-slate-600 dark:text-slate-300">
                                                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                                                Top Skill
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">{(userProfile.skills && userProfile.skills[0]) || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills Detected</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(userProfile.skills || []).slice(0, 8).map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs rounded-full font-medium border border-slate-200 dark:border-white/10">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white dark:bg-[#101025] p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-500">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2 relative z-10 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    Skill Confidence
                                </h3>
                                <div className="h-64 w-full relative z-10" style={{ minHeight: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={skillData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {skillData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#a855f7', '#ec4899', '#3b82f6'][index % 4]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                cursor={false}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
                                                    backgroundColor: '#0f172a',
                                                    color: '#f8fafc'
                                                }}
                                                itemStyle={{ color: '#e2e8f0' }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                formatter={(value) => <span className="text-slate-500 dark:text-slate-400 text-xs font-medium ml-1">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                                        <div className="text-center">
                                            <span className="text-3xl font-bold text-slate-800 dark:text-white">{skillData.length}</span>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Skills</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center/Right Column: Internship Feed */}
                        <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="bg-white dark:bg-[#101025] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm sticky top-20 z-10">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by role or company..."
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"
                                            value={searchRole}
                                            onChange={(e) => setSearchRole(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                                        <select
                                            className="px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none dark:text-white"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <option value="All">All Types</option>
                                            <option value="Remote">Remote</option>
                                            <option value="On-site">On-site</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>

                                        <select
                                            className="px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none dark:text-white"
                                            value={filterLocation}
                                            onChange={(e) => setFilterLocation(e.target.value)}
                                        >
                                            <option value="All">All Locations</option>
                                            <option value="Hyderabad">Hyderabad</option>
                                            <option value="Bangalore">Bangalore</option>
                                            <option value="Remote">Remote</option>
                                        </select>

                                        <select
                                            className="px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none dark:text-white"
                                            value={minStipend}
                                            onChange={(e) => setMinStipend(Number(e.target.value))}
                                        >
                                            <option value="0">Any Stipend</option>
                                            <option value="10000">₹10k+</option>
                                            <option value="20000">₹20k+</option>
                                            <option value="30000">₹30k+</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {filteredInternships.length} Internship{filteredInternships.length !== 1 && 's'} Found
                                </h2>
                                <button
                                    onClick={() => { }}
                                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    title="Refresh Recommendations"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#101025] rounded-[2rem] border border-slate-200 dark:border-white/5">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                    <p className="text-slate-500 dark:text-slate-400">Gemini is finding the best matches for your profile...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredInternships.length > 0 ? (
                                        filteredInternships.map((internship) => (
                                            <div key={internship.id} className="group bg-white dark:bg-[#101025] rounded-2xl border border-slate-200 dark:border-white/5 p-6 hover:border-radion-primary/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-radion-primary/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

                                                <div className="flex justify-between items-start mb-4 relative z-10">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-radion-primary transition-colors">{internship.title}</h3>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                                                            <Building2 className="w-3.5 h-3.5" />
                                                            {internship.company}
                                                            {/* MATCH BADGE */}
                                                            {(internship as any).dynamicMatchScore > 0 && (
                                                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold border ${(internship as any).dynamicMatchScore >= 80 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                                    (internship as any).dynamicMatchScore >= 50 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                                                    }`}>
                                                                    {(internship as any).dynamicMatchScore}% Match
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-red-500">
                                                        <Heart className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">{internship.type}</span>
                                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">{internship.location}</span>
                                                    {internship.stipend && (
                                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">₹{internship.stipend.toLocaleString()}/month</span>
                                                    )}
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 relative z-10 line-clamp-3">{internship.description}</p>
                                                <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                                    {internship.skills.map((skill, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs rounded-full font-medium border border-slate-200 dark:border-white/10">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-center relative z-10">
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">Posted {formatDistanceToNow(new Date(internship.postedDate), { addSuffix: true })}</span>
                                                    <button
                                                        onClick={() => setSelectedInternship(internship)}
                                                        className="px-5 py-2 bg-radion-primary text-white font-semibold rounded-full hover:bg-radion-primary/90 transition-colors shadow-lg shadow-radion-primary/20"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-16 bg-white dark:bg-[#101025] rounded-[2rem] border border-slate-200 dark:border-white/5">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Filter className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matches found</h3>
                                            <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters.</p>
                                            <button
                                                onClick={() => {
                                                    setFilterType('All');
                                                    setFilterLocation('All');
                                                    setSearchRole('');
                                                    setMinStipend(0);
                                                }}
                                                className="mt-4 text-blue-600 font-medium hover:underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ... (Rest of component for path and applications remains the same) ... */}
                {activeTab === 'path' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
                        {/* Input Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-[#101025] p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                        <Target className="w-6 h-6 text-purple-500" />
                                        Target Lock
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                                        Tell us where you want to go. Gemini will analyze the gap between your current skills and their requirements.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Job Role</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. SDE-1, Data Scientist"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white transition-all"
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Company</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Microsoft, Google, Swiggy"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white transition-all"
                                            value={targetCompany}
                                            onChange={(e) => setTargetCompany(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleGenerateRoadmap}
                                        disabled={generatingRoadmap || !targetRole || !targetCompany}
                                        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                        {generatingRoadmap ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Analyzing Gap...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Generate Roadmap
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Readiness Score (Only show if roadmap exists) */}
                            {roadmap && (
                                <div className="bg-white dark:bg-[#101025] p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 z-0"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">Recruiter Readiness Score</h3>
                                        <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                                            {roadmap.readinessScore}%
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 mt-4 text-sm font-medium">
                                            {roadmap.readinessScore > 75 ? "You're almost there! Just a few tweaks." : "Some serious upskilling needed, but totally doable."}
                                        </p>
                                        <div className="mt-6 p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-purple-100 dark:border-white/10 text-left">
                                            <h4 className="font-bold text-sm text-purple-700 dark:text-purple-300 mb-2 flex items-center">
                                                <ArrowRight className="w-4 h-4 mr-2" />
                                                Next Immediate Step
                                            </h4>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{roadmap.nextImmediateStep}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results Section - ACCORDION PALETTE */}
                        <div className="lg:col-span-2 space-y-4">
                            {!roadmap && !generatingRoadmap && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-[#101025] rounded-[2rem] border border-slate-200 dark:border-white/5 border-dashed min-h-[400px]">
                                    <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/10 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                                        <Target className="w-10 h-10 text-purple-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to chart your course?</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                                        Enter a target role and company on the left to get a personalized skill gap analysis and monthly learning plan.
                                    </p>
                                </div>
                            )}

                            {generatingRoadmap && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-[#101025] rounded-[2rem] border border-slate-200 dark:border-white/5 min-h-[400px]">
                                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-6" />
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Company Standards...</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Checking {targetCompany} requirements against your profile.</p>
                                </div>
                            )}

                            {roadmap && (
                                <>
                                    {/* Section 1: Analysis (Strong Points & Gaps) */}
                                    <div className="bg-[#0f172a] dark:bg-[#101025] rounded-[1.5rem] border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => toggleSection('analysis')}
                                            className="w-full flex items-center justify-between p-6 bg-[#0f172a] hover:bg-[#1e293b] dark:bg-[#101025] dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <BarChart2 className="w-6 h-6 text-emerald-400" />
                                                <span className="text-lg font-bold text-white">Analysis Breakdown</span>
                                            </div>
                                            {expandedSection === 'analysis' ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                                        </button>

                                        {expandedSection === 'analysis' && (
                                            <div className="p-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in bg-[#0f172a] dark:bg-[#101025]">
                                                <div>
                                                    <h4 className="text-emerald-400 font-bold mb-4 flex items-center">
                                                        <CheckSquare className="w-4 h-4 mr-2" />
                                                        Your Strong Points
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {(roadmap.strongSkills || []).map((item, i) => (
                                                            <div key={i} className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-sm hover:shadow-md transition-all">
                                                                <div className="font-bold text-emerald-300 text-sm mb-1">{item.skill}</div>
                                                                <div className="text-emerald-400/60 text-xs leading-relaxed">{item.reason}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-rose-400 font-bold mb-4 flex items-center">
                                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                                        Critical Gaps
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {/* Combine toImprove and toLearn for critical gaps list */}
                                                        {[...(roadmap.skillsToImprove || []), ...(roadmap.skillsToLearn || [])].slice(0, 4).map((item, i) => (
                                                            <div key={i} className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 shadow-sm hover:shadow-md transition-all">
                                                                <div className="font-bold text-rose-300 text-sm mb-1">{item.skill}</div>
                                                                <div className="text-rose-400/60 text-xs leading-relaxed">{item.reason}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 2: Roadmap */}
                                    <div className="bg-[#0f172a] dark:bg-[#101025] rounded-[1.5rem] border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => toggleSection('roadmap')}
                                            className="w-full flex items-center justify-between p-6 bg-[#0f172a] hover:bg-[#1e293b] dark:bg-[#101025] dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-6 h-6 text-blue-400" />
                                                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Your Personalized Roadmap</span>
                                            </div>
                                            {expandedSection === 'roadmap' ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                                        </button>

                                        {expandedSection === 'roadmap' && (
                                            <div className="p-8 border-t border-white/10 bg-[#0f172a] dark:bg-[#101025]">
                                                <div className="relative border-l-2 border-slate-700 ml-4 space-y-12">
                                                    {(roadmap.roadmap || []).map((phase, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative pl-8 animate-fade-in opacity-0"
                                                            style={{ animationDelay: `${i * 150}ms` }}
                                                        >
                                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#0f172a] shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                                                            <h4 className="text-lg font-bold text-white mb-2">{phase.month}</h4>

                                                            <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 space-y-4 hover:bg-gradient-to-br hover:from-slate-800 hover:to-slate-900 hover:scale-[1.02] hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 group">
                                                                <div>
                                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 group-hover:text-blue-400 transition-colors">Focus Skills</div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {(phase.skills || []).map(s => (
                                                                            <span key={s} className="px-3 py-1 bg-white/10 rounded-lg text-sm font-medium text-slate-300 shadow-sm group-hover:bg-white/15 transition-colors">{s}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 group-hover:text-blue-400 transition-colors">Tools</div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {(phase.tools || []).map(t => (
                                                                            <span key={t} className="px-3 py-1 bg-white/10 rounded-lg text-sm font-medium text-slate-300 border border-white/5 group-hover:border-white/20 transition-colors">{t}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="pt-2 border-t border-white/5 group-hover:border-white/10">
                                                                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Mission</div>
                                                                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{phase.task}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 3: Project */}
                                    <div className="bg-[#4c1d95] rounded-[1.5rem] border border-white/10 overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => toggleSection('project')}
                                            className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-[#4c1d95] to-[#5b21b6] hover:brightness-110 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ProjectIcon className="w-6 h-6 text-white" />
                                                <span className="text-lg font-bold text-white">Project for Portfolio</span>
                                            </div>
                                            {expandedSection === 'project' ? <ChevronUp className="text-white/70" /> : <ChevronDown className="text-white/70" />}
                                        </button>

                                        {expandedSection === 'project' && (
                                            <div className="p-6 border-t border-white/10 bg-[#4c1d95] animate-fade-in text-white relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                                <div className="grid gap-4 relative z-10">
                                                    {(roadmap.recommendedProjects || []).map((project, i) => (
                                                        <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                                            <h4 className="font-bold text-lg mb-2">{project.name}</h4>
                                                            <p className="text-indigo-100 text-sm mb-4 opacity-90 leading-relaxed">{project.reason}</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(project.skillsCovered || []).map(s => (
                                                                    <span key={s} className="px-2 py-1 bg-black/20 rounded-md text-xs font-medium">{s}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 4: Resume */}
                                    <div className="bg-[#0f172a] dark:bg-[#101025] rounded-[1.5rem] border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => toggleSection('resume')}
                                            className="w-full flex items-center justify-between p-6 bg-[#0f172a] hover:bg-[#1e293b] dark:bg-[#101025] dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <UserCircle className="w-6 h-6 text-indigo-400" />
                                                <span className="text-lg font-bold text-white">Resume Quick Wins</span>
                                            </div>
                                            {expandedSection === 'resume' ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                                        </button>

                                        {expandedSection === 'resume' && (
                                            <div className="p-6 border-t border-white/10 bg-[#0f172a] dark:bg-[#101025] animate-fade-in">
                                                <ul className="space-y-4">
                                                    {(roadmap.profileSuggestions || []).map((s, i) => (
                                                        <li key={i} className="flex items-start gap-4 text-sm text-slate-300">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                                                            <span className="leading-relaxed">{s}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="animate-slide-up">
                        {(!myApplications || myApplications.length === 0) ? (
                            <div className="text-center py-24 bg-white dark:bg-[#101025] rounded-[2rem] border border-slate-200 dark:border-white/5">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Briefcase className="w-10 h-10 text-slate-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Applications Yet</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">You haven't applied to any internships yet. Check the Job Feed to find matches!</p>
                                <button
                                    onClick={() => setActiveTab('feed')}
                                    className="btn-bubble bubble-primary px-8 py-3 text-white"
                                >
                                    Find Internships
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101025] border border-slate-200 dark:border-white/5 shadow-sm">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total</p>
                                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{myApplications.length}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101025] border border-slate-200 dark:border-white/5 shadow-sm">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Reviewing</p>
                                        <p className="text-2xl font-extrabold text-amber-500">{myApplications.filter(a => a.status === 'Pending').length}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101025] border border-slate-200 dark:border-white/5 shadow-sm">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Shortlisted</p>
                                        <p className="text-2xl font-extrabold text-blue-500">{myApplications.filter(a => a.status === 'Shortlisted').length}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101025] border border-slate-200 dark:border-white/5 shadow-sm">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Accepted</p>
                                        <p className="text-2xl font-extrabold text-green-500">{myApplications.filter(a => a.status === 'Accepted').length}</p>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    {myApplications.map((app) => (
                                        <div key={app.id} className="bg-white dark:bg-[#101025] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 font-bold text-xl border border-slate-200 dark:border-white/10">
                                                    {app.companyName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{app.jobTitle}</h3>
                                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                                        <Building2 className="w-4 h-4" />
                                                        {app.companyName}
                                                        <span className="mx-1">•</span>
                                                        <span>Applied {app.appliedDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center ${getStatusStyle(app.status)}`}>
                                                    {getStatusIcon(app.status)}
                                                    {app.status}
                                                </div>
                                                <div className="text-xs text-slate-400">Match Score: {app.matchScore}%</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            {selectedInternship && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Apply to {selectedInternship.company}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedInternship.title}</p>
                            </div>
                            <button onClick={resetModal} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Resume</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Please upload your specific resume for this role (PDF only, max 5MB).</p>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${applicationResume
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                    />
                                    {applicationResume ? (
                                        <div className="flex flex-col items-center">
                                            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                                            <span className="text-sm font-bold text-green-700 dark:text-green-400 truncate max-w-full px-2">{applicationResume.name}</span>
                                            <span className="text-xs text-green-600 dark:text-green-500 mt-1">Ready to submit</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload PDF</span>
                                        </div>
                                    )}
                                </div>
                                {applicationError && (
                                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {applicationError}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={resetModal} className="flex-1 py-3 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={submitApplication}
                                    className="flex-1 py-3 btn-bubble bubble-primary text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    Submit Application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Chat Widget */}
            <ChatWidget userProfile={userProfile} />
        </div>
    );
};

export default Dashboard;
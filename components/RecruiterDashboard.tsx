import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Internship, Application } from '../types';
import { Plus, Users, Search, MessageSquare, Briefcase, X, Check, Building2, Globe, Layout, LogOut, ArrowRight, Settings, ChevronRight, ChevronDown, Mail, Phone, Calendar, GraduationCap, MapPin, Download, Sparkles, XCircle, CheckCircle2 } from 'lucide-react';

interface RecruiterDashboardProps {
    userProfile: UserProfile;
    onLogout: () => void;
    allInternships: Internship[];
    onUpdateInternships: (internships: Internship[]) => void;
    applications: Application[];
    onUpdateApplications: (apps: Application[]) => void;
    onUpdateProfile: (profile: UserProfile) => void;
}

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
    userProfile,
    onLogout,
    allInternships,
    onUpdateInternships,
    applications,
    onUpdateApplications,
    onUpdateProfile
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'candidates' | 'profile'>('overview');
    const [showPostModal, setShowPostModal] = useState(false);
    const [showCompanySetup, setShowCompanySetup] = useState(!userProfile.companyName);
    const [saveMessage, setSaveMessage] = useState('');

    // Company Info State
    const [companyInfo, setCompanyInfo] = useState({
        name: userProfile.companyName || '',
        website: userProfile.companyWebsite || '',
        description: userProfile.companyDescription || ''
    });

    // Filter jobs to show only those belonging to this recruiter's company
    const myJobs = useMemo(() => {
        return allInternships.filter(job => job.company === companyInfo.name);
    }, [allInternships, companyInfo.name]);

    // Form State
    const [editingJobId, setEditingJobId] = useState<string | null>(null);
    const [jobForm, setJobForm] = useState({ title: '', type: 'Remote', stipend: '', description: '', status: 'Active' });

    // Applicants Modal State
    const [viewingApplicantsFor, setViewingApplicantsFor] = useState<string | null>(null);
    const [viewingApplicantsJobId, setViewingApplicantsJobId] = useState<string | null>(null);

    // Detailed Candidate Profile State
    const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);

    // Filter state
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Closed'>('All');

    useEffect(() => {
        if (userProfile.companyName) {
            setCompanyInfo({
                name: userProfile.companyName,
                website: userProfile.companyWebsite || '',
                description: userProfile.companyDescription || ''
            });
            setShowCompanySetup(false);
        } else {
            setShowCompanySetup(true);
        }
    }, [userProfile]);

    const handleCompanySetup = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedProfile: UserProfile = {
            ...userProfile,
            companyName: companyInfo.name,
            companyWebsite: companyInfo.website,
            companyDescription: companyInfo.description
        };
        onUpdateProfile(updatedProfile);
        setShowCompanySetup(false);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedProfile: UserProfile = {
            ...userProfile,
            companyName: companyInfo.name,
            companyWebsite: companyInfo.website,
            companyDescription: companyInfo.description
        };
        onUpdateProfile(updatedProfile);
        setSaveMessage('Company profile updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const openPostModal = () => {
        setEditingJobId(null);
        setJobForm({ title: '', type: 'Remote', stipend: '', description: '', status: 'Active' });
        setShowPostModal(true);
    };

    const openEditModal = (job: Internship) => {
        setEditingJobId(job.id);
        setJobForm({
            title: job.title,
            type: job.type as string,
            stipend: job.stipend,
            description: job.description,
            status: job.status || 'Active'
        });
        setShowPostModal(true);
    };

    const handleSaveJob = (e: React.FormEvent) => {
        e.preventDefault();

        let updatedInternships: Internship[];

        if (editingJobId) {
            updatedInternships = allInternships.map(j => j.id === editingJobId ? {
                ...j,
                title: jobForm.title,
                type: jobForm.type as any,
                stipend: jobForm.stipend,
                description: jobForm.description,
                status: jobForm.status as any
            } : j);
        } else {
            const newId = Math.random().toString(36).substr(2, 9);
            const newJob: Internship = {
                id: newId,
                title: jobForm.title,
                applicants: 0,
                status: 'Active',
                type: jobForm.type as any,
                stipend: jobForm.stipend,
                description: jobForm.description,
                company: companyInfo.name,
                location: 'Hyderabad', // In a real app, this would be editable or derived from profile
                requiredSkills: [], // Could add skills input later
                postedDate: new Date().toISOString().split('T')[0]
            };
            updatedInternships = [newJob, ...allInternships];
        }

        onUpdateInternships(updatedInternships);
        setShowPostModal(false);
    };

    const handleViewApplicants = (jobId: string, jobTitle: string) => {
        setViewingApplicantsFor(jobTitle);
        setViewingApplicantsJobId(jobId);
    };

    const handleStatusUpdate = (appId: string, newStatus: Application['status']) => {
        const updatedApplications = applications.map(app =>
            app.id === appId ? { ...app, status: newStatus } : app
        );
        onUpdateApplications(updatedApplications);

        if (selectedCandidate && selectedCandidate.id === appId) {
            setSelectedCandidate({ ...selectedCandidate, status: newStatus });
        }

        setSaveMessage(`Status updated to ${newStatus}`);
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleDownloadResume = (app: Application) => {
        if (app.resumeBase64) {
            const link = document.createElement('a');
            link.href = `data:${app.resumeMimeType || 'application/pdf'};base64,${app.resumeBase64}`;
            link.download = `${app.studentName.replace(/\s+/g, '_')}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Fallback content if no PDF was uploaded (legacy data)
            const resumeContent = `
ASTRAX AI - CANDIDATE APPLICATION (LEGACY)
-------------------------------------
Name: ${app.studentName}
Email: ${app.studentEmail}
Position: ${app.jobTitle}
Company: ${app.companyName}
Applied Date: ${app.appliedDate}
Match Score: ${app.matchScore}%

Status: ${app.status}

This candidate applied before the resume upload feature was mandatory.
          `.trim();

            const blob = new Blob([resumeContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${app.studentName.replace(/\s+/g, '_')}_Summary.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const currentApplicants = useMemo(() => {
        if (!viewingApplicantsJobId) return [];
        return applications.filter(app => app.jobId === viewingApplicantsJobId);
    }, [applications, viewingApplicantsJobId]);

    if (showCompanySetup) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full p-8 animate-slide-up border border-slate-200 dark:border-slate-800">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Setup Company Profile</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Before posting internships, tell students about your company.</p>
                    </div>
                    <form onSubmit={handleCompanySetup} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                value={companyInfo.name}
                                onChange={e => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                                placeholder="e.g. TechFlow Solutions"
                            />
                        </div>
                        <button type="submit" className="w-full py-3 btn-bubble bubble-primary text-white font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 mt-4">
                            Continue to Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const filteredJobs = filterStatus === 'All' ? myJobs : myJobs.filter(j => j.status === filterStatus);

    // Calculate actual applicant counts for display
    const jobsWithCounts = filteredJobs.map(job => ({
        ...job,
        applicants: applications.filter(app => app.jobId === job.id).length
    }));

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 relative font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* ... Header and Navigation ... */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Recruiter Portal</h1>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                            <Building2 className="w-4 h-4" /> {companyInfo.name || "Setup Company"}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onLogout}
                            className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                        <button
                            onClick={openPostModal}
                            className="btn-bubble bubble-primary px-5 py-2.5 text-white flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Post Internship
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'overview', label: 'Overview', icon: Layout },
                        { id: 'jobs', label: 'Active Jobs', icon: Briefcase },
                        { id: 'candidates', label: 'Candidates', icon: Users },
                        { id: 'profile', label: 'Company Profile', icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Success Message Toast */}
                {saveMessage && (
                    <div className="fixed top-24 right-4 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-fade-in font-bold">
                        <Check className="w-5 h-5 text-green-500" />
                        {saveMessage}
                    </div>
                )}

                <div className="animate-fade-in">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Listings</p>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{myJobs.filter(j => j.status === 'Active').length}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Applicants</p>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                            {applications.filter(app => app.companyName === companyInfo.name).length}
                                        </h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-green-300 dark:hover:border-green-700 transition-colors">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Interviews</p>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">0</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div className="space-y-6">
                            {/* Status Filter */}
                            <div className="flex gap-2">
                                {['All', 'Active', 'Closed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status as any)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === status ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <div className="grid gap-4">
                                {jobsWithCounts.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                        No jobs posted yet.
                                    </div>
                                ) : (
                                    jobsWithCounts.map((job) => (
                                        <div key={job.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${job.status === 'Active' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                                                        {job.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>{job.type}</span>
                                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                                    <span className="text-slate-900 dark:text-slate-200 font-medium">{job.stipend}</span>
                                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                                    <span>{job.applicants} Applicants</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 w-full md:w-auto">
                                                <button
                                                    onClick={() => openEditModal(job)}
                                                    className="flex-1 md:flex-none px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleViewApplicants(job.id, job.title)}
                                                    className="flex-1 md:flex-none px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Users className="w-4 h-4" />
                                                    View Applicants
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ... Other Tabs (Candidates, Profile) ... */}
                    {activeTab === 'candidates' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Showing candidates for {companyInfo.name}.
                            </div>

                            {applications.filter(app => app.companyName === companyInfo.name).map((app, i) => (
                                <div key={i} className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xl border-2 border-indigo-100 dark:border-indigo-900/50">
                                        {app.studentName.charAt(0)}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{app.studentName}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Applied for: <span className="font-medium text-slate-700 dark:text-slate-300">{app.jobTitle}</span></p>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                            <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{app.studentEmail}</span>
                                            <span className={`text-[11px] px-2 py-1 rounded-md border ${app.status === 'Shortlisted'
                                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                : app.status === 'Accepted'
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                                    : app.status === 'Rejected'
                                                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                                        : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-right">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{app.matchScore}%</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match Score</div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCandidate(app)}
                                        className="w-full sm:w-auto px-6 py-2.5 btn-bubble bubble-dark rounded-full text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                            {/* ... Profile Form Content (Same as previous) ... */}
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Company Settings</h2>
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                                    <input type="text" value={companyInfo.name} onChange={e => setCompanyInfo({ ...companyInfo, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Website</label>
                                    <input type="text" value={companyInfo.website} onChange={e => setCompanyInfo({ ...companyInfo, website: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                    <textarea rows={4} value={companyInfo.description} onChange={e => setCompanyInfo({ ...companyInfo, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all resize-none" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="px-6 py-3 btn-bubble bubble-primary text-white rounded-full transition-colors flex items-center gap-2 font-medium">
                                        <Check className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals for Post Job, View Applicants, View Candidate Detail remain same structure but use updated state/props */}
            {showPostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editingJobId ? 'Edit Internship' : 'Post New Internship'}</h3>
                            <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveJob} className="p-6 space-y-5">
                            {/* ... (Same fields as before) ... */}
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Job Title</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-400" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Senior React Developer" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label><div className="relative"><select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white appearance-none transition-all" value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}><option>Remote</option><option>On-site</option><option>Hybrid</option></select><ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" /></div></div>
                                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Stipend</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all" value={jobForm.stipend} onChange={(e) => setJobForm({ ...jobForm, stipend: e.target.value })} placeholder="e.g. ₹25,000" /></div>
                            </div>
                            {editingJobId && (<div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label><div className="relative"><select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white appearance-none transition-all" value={jobForm.status} onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}><option value="Active">Active</option><option value="Closed">Closed</option></select><ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" /></div></div>)}
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label><textarea required rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all resize-none placeholder:text-slate-400" value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Describe the role responsibilities..." /></div>
                            <div className="pt-2"><button type="submit" className="w-full py-4 btn-bubble bubble-primary text-white font-bold transition-colors flex items-center justify-center gap-2"><Check className="w-5 h-5" />{editingJobId ? 'Update Listing' : 'Publish Listing'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {viewingApplicantsFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div><h3 className="font-bold text-lg text-slate-900 dark:text-white">Applicants</h3><p className="text-sm text-slate-500 dark:text-slate-400">For: {viewingApplicantsFor}</p></div>
                            <button onClick={() => setViewingApplicantsFor(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {currentApplicants.length === 0 ? <div className="text-center py-10 text-slate-500"><p>No applicants yet for this role.</p></div> : currentApplicants.map(applicant => (
                                <div key={applicant.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                                    <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/50">{applicant.studentName.charAt(0)}</div>
                                        <div><h4 className="font-bold text-slate-900 dark:text-white">{applicant.studentName}</h4><div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{applicant.studentEmail}</span><span>•</span><span>{applicant.appliedDate}</span></div></div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-right mr-2"><div className="font-bold text-green-600 dark:text-green-400">{applicant.matchScore}%</div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match</div></div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative group/select">
                                                <select
                                                    value={applicant.status}
                                                    onChange={(e) => handleStatusUpdate(applicant.id, e.target.value as any)}
                                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border outline-none cursor-pointer transition-all ${applicant.status === 'Accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                                                        applicant.status === 'Shortlisted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                                                            applicant.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                                                                'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                        }`}
                                                >
                                                    <option value="Pending" className="text-slate-900 bg-white">Pending</option>
                                                    <option value="Shortlisted" className="text-slate-900 bg-white">Shortlisted</option>
                                                    <option value="Accepted" className="text-slate-900 bg-white">Accepted</option>
                                                    <option value="Rejected" className="text-slate-900 bg-white">Rejected</option>
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                                            </div>
                                            <button onClick={() => setSelectedCandidate(applicant)} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-full hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm">Profile</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedCandidate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh]">
                        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                            <button onClick={() => setSelectedCandidate(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"><X className="w-5 h-5 text-white" /></button>
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="w-24 h-24 rounded-2xl bg-white text-blue-600 flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-white/20">{selectedCandidate.studentName.charAt(0)}</div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold mb-2 tracking-tight">{selectedCandidate.studentName}</h2>
                                    <div className="flex flex-wrap gap-4 text-blue-100 text-sm font-medium">
                                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10"><GraduationCap className="w-4 h-4" />Student</div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${selectedCandidate.status === 'Accepted' ? 'bg-green-500/20 border-green-400 text-white' :
                                            selectedCandidate.status === 'Shortlisted' ? 'bg-blue-500/20 border-blue-400 text-white' :
                                                selectedCandidate.status === 'Rejected' ? 'bg-red-500/20 border-red-400 text-white' :
                                                    'bg-white/10 border-white/10'
                                            }`}>
                                            <Check className="w-4 h-4" />{selectedCandidate.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center min-w-[100px]"><div className="text-3xl font-bold">{selectedCandidate.matchScore}%</div><div className="text-[10px] font-bold uppercase tracking-wider opacity-80">AI Match</div></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <section><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500" /> Application Details</h3><p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">Applied on {selectedCandidate.appliedDate} for {selectedCandidate.jobTitle}</p></section>
                            <section className="pt-6 border-t border-slate-100 dark:border-slate-800"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Details</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"><Mail className="w-5 h-5 text-slate-400" /><span className="text-slate-700 dark:text-slate-300 font-medium">{selectedCandidate.studentEmail}</span></div></div></section>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <button onClick={() => handleDownloadResume(selectedCandidate)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors font-medium text-sm"><Download className="w-4 h-4" />Download Resume PDF</button>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => handleStatusUpdate(selectedCandidate.id, 'Rejected')}
                                    className="flex-1 sm:flex-none px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl font-bold transition-colors flex items-center justify-center"
                                    title="Reject Candidate"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedCandidate.id, 'Shortlisted')}
                                    className="flex-1 sm:flex-none px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold transition-colors flex items-center justify-center"
                                    title="Shortlist Candidate"
                                >
                                    <Sparkles className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedCandidate.id, 'Accepted')}
                                    className="flex-1 sm:flex-none px-6 py-3 btn-bubble bubble-primary text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    title="Accept Candidate"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterDashboard;
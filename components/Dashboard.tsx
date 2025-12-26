import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile, Internship, Application } from '../types';
import { matchInternships } from '../services/geminiService';
import InternshipCard from './InternshipCard';
import ChatWidget from './ChatWidget';
import { MOCK_INTERNSHIPS } from '../constants';
import { Loader2, User, Award, TrendingUp, RefreshCw, Sparkles, MapPin, Building2, ArrowRight, Search, Filter, Briefcase, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  userProfile: UserProfile;
  onEditProfile: () => void;
  onApply: (internship: Internship) => void;
  myApplications: Application[];
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onEditProfile, onApply, myApplications }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'applications'>('feed');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchRole, setSearchRole] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [minStipend, setMinStipend] = useState(0);

  const firstName = userProfile.name.split(' ')[0];
  const initials = userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const matches = await matchInternships(userProfile, MOCK_INTERNSHIPS);
        setInternships(matches);
      } catch (e) {
        console.error("Match error", e);
        setInternships(MOCK_INTERNSHIPS); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [userProfile]);

  // Mock confidence data based on detected skills
  const skillData = userProfile.skills.map(skill => ({
    name: skill,
    value: 70 + Math.random() * 25 // Simulate confidence score
  })).slice(0, 6);

  // Filter Logic
  const filteredInternships = useMemo(() => {
    return internships.filter(internship => {
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
    });
  }, [internships, searchRole, filterType, filterLocation, minStipend]);

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
        <div className="flex gap-2 p-1 bg-white dark:bg-[#101025] rounded-xl border border-slate-200 dark:border-white/10 w-fit animate-slide-up">
            <button 
                onClick={() => setActiveTab('feed')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'feed' 
                    ? 'btn-bubble bubble-primary shadow-lg' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
            >
                Job Feed
            </button>
            <button 
                onClick={() => setActiveTab('applications')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'applications' 
                    ? 'btn-bubble bubble-primary shadow-lg' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
            >
                My Applications
                {myApplications.length > 0 && (
                    <span className="bg-white text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{myApplications.length}</span>
                )}
            </button>
        </div>

        {activeTab === 'feed' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Profile */}
          <div className="space-y-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
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
                    <span className="font-semibold text-slate-900 dark:text-white">{userProfile.skills[0] || "N/A"}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                   <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills Detected</h4>
                   <div className="flex flex-wrap gap-2">
                      {userProfile.skills.slice(0, 8).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs rounded-full font-medium border border-slate-200 dark:border-white/10">
                          {skill}
                        </span>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            {/* Skill Gap Analysis */}
             <div className="bg-white dark:bg-[#101025] p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                   Your Skill Gaps
                   <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-[10px] uppercase font-bold rounded-full border border-red-200 dark:border-red-500/20">Important</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Gemini suggests learning these to increase your match score:</p>
                <ul className="space-y-3">
                  {userProfile.missingSkills && userProfile.missingSkills.length > 0 ? userProfile.missingSkills.map((skill, idx) => (
                    <li key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors group">
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{skill}</span>
                      <a 
                        href={`https://www.google.com/search?q=learn+${skill}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      >
                        Learn <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </li>
                  )) : (
                     <li className="text-sm text-slate-400 italic">No major gaps detected! Great job.</li>
                  )}
                </ul>
             </div>
             
             {/* Chart */}
             <div className="bg-white dark:bg-[#101025] p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Skill Confidence</h3>
                <div className="h-64 w-full" style={{ minHeight: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillData}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: '#1e293b'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {skillData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Center/Right Column: Internship Feed */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
            
            {/* Filter Bar */}
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
                 onClick={() => {}} 
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
                        <InternshipCard 
                          key={internship.id} 
                          internship={internship} 
                          onApply={onApply}
                          hasApplied={myApplications.some(app => app.jobId === internship.id)}
                        />
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
        ) : (
            /* --- APPLICATIONS TAB --- */
            <div className="animate-slide-up">
                {myApplications.length === 0 ? (
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
                                     <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                                         app.status === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30' : 
                                         app.status === 'Accepted' ? 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30' :
                                         'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'
                                     }`}>
                                         {app.status}
                                     </div>
                                     <div className="text-xs text-slate-400">Match Score: {app.matchScore}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
      
      {/* Sticky Chat Widget */}
      <ChatWidget userProfile={userProfile} />
    </div>
  );
};

export default Dashboard;
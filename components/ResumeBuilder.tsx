import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ResumeData, EducationItem, ProjectItem, ExperienceItem } from '../types';
import { generateATSResume } from '../services/geminiService';
import { Loader2, Sparkles, Download, Save, Plus, Trash2, ChevronDown, ChevronUp, FileText, Share2, Printer, Award } from 'lucide-react';

interface ResumeBuilderProps {
  userProfile: UserProfile;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ userProfile }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const printRef = useRef<HTMLDivElement>(null);

  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: userProfile.name || '',
    email: userProfile.email || '',
    phone: '',
    linkedin: '',
    github: '',
    summary: userProfile.summary || '',
    skills: userProfile.skills || [],
    education: [{ id: '1', institution: userProfile.university || '', degree: 'B.Tech Computer Science', year: '2025', gpa: '' }],
    projects: [],
    experience: [],
    certifications: []
  });

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      // Pass current state to AI to polish
      const optimizedResume = await generateATSResume(resumeData);
      setResumeData(optimizedResume);
    } catch (error) {
      console.error("Failed to generate resume", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now().toString(), title: '', techStack: [], description: '' }]
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', duration: '', description: '' }]
    }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
        ...prev,
        certifications: [...prev.certifications, '']
    }));
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };
  
  const removeProject = (id: string) => {
      setResumeData(prev => ({...prev, projects: prev.projects.filter(p => p.id !== id)}));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };
  
  const removeExperience = (id: string) => {
      setResumeData(prev => ({...prev, experience: prev.experience.filter(e => e.id !== id)}));
  };

  const updateCertification = (index: number, value: string) => {
      const newCerts = [...resumeData.certifications];
      newCerts[index] = value;
      setResumeData(prev => ({ ...prev, certifications: newCerts }));
  };

  const removeCertification = (index: number) => {
      setResumeData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));
  };

  // Toggle Accordion
  const toggleSection = (section: string) => {
      setActiveSection(activeSection === section ? null : section);
  };

  // Shared Styles
  const inputClass = "w-full px-4 py-3 bg-slate-100 dark:bg-[#1c1c1e] border border-transparent focus:bg-white dark:focus:bg-[#2c2c2e] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400";
  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block";
  const sectionHeaderClass = "w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-[#1c1c1e]/50 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1c1c1e] transition-colors";

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* LEFT PANE: EDITOR */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-[#101014] rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#101014]">
            <div>
                <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Resume Studio
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Craft your ATS-ready profile</p>
            </div>
            <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="btn-bubble bubble-primary px-4 py-2 text-sm text-white flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20"
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Polishing...' : 'AI Enhance'}
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white dark:bg-[#101014]">
            {/* Personal Info */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => toggleSection('personal')} className={sectionHeaderClass}>
                    <span>Personal Information</span>
                    {activeSection === 'personal' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeSection === 'personal' && (
                    <div className="p-5 space-y-5 bg-white dark:bg-black/20">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input type="text" className={inputClass} value={resumeData.fullName} onChange={(e) => setResumeData({...resumeData, fullName: e.target.value})} />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="text" className={inputClass} value={resumeData.email} onChange={(e) => setResumeData({...resumeData, email: e.target.value})} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input type="text" className={inputClass} value={resumeData.phone} onChange={(e) => setResumeData({...resumeData, phone: e.target.value})} placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className={labelClass}>LinkedIn URL</label>
                                <input type="text" className={inputClass} value={resumeData.linkedin} onChange={(e) => setResumeData({...resumeData, linkedin: e.target.value})} placeholder="linkedin.com/in/..." />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass}>GitHub URL</label>
                                <input type="text" className={inputClass} value={resumeData.github} onChange={(e) => setResumeData({...resumeData, github: e.target.value})} placeholder="github.com/..." />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Professional Summary</label>
                            <textarea rows={4} className={inputClass} value={resumeData.summary} onChange={(e) => setResumeData({...resumeData, summary: e.target.value})} placeholder="Experienced software engineer with a focus on..." />
                        </div>
                    </div>
                )}
            </div>

            {/* Skills */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => toggleSection('skills')} className={sectionHeaderClass}>
                    <span>Skills</span>
                    {activeSection === 'skills' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeSection === 'skills' && (
                    <div className="p-5 bg-white dark:bg-black/20">
                        <label className={labelClass}>Technical Skills (Comma Separated)</label>
                        <textarea 
                            rows={3} 
                            className={inputClass} 
                            value={resumeData.skills.join(', ')} 
                            onChange={(e) => setResumeData({...resumeData, skills: e.target.value.split(',').map(s => s.trim())})} 
                            placeholder="Java, Python, React, SQL, AWS, Docker" 
                        />
                    </div>
                )}
            </div>

            {/* Certifications - NEW SECTION */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => toggleSection('certifications')} className={sectionHeaderClass}>
                    <span>Certifications</span>
                    {activeSection === 'certifications' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeSection === 'certifications' && (
                    <div className="p-5 space-y-3 bg-white dark:bg-black/20">
                        {resumeData.certifications.length === 0 && (
                            <p className="text-sm text-slate-500 italic mb-2">No certifications added yet.</p>
                        )}
                        {resumeData.certifications.map((cert, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    type="text" 
                                    className={inputClass} 
                                    value={cert} 
                                    onChange={(e) => updateCertification(idx, e.target.value)}
                                    placeholder="e.g. AWS Certified Cloud Practitioner" 
                                />
                                <button 
                                    onClick={() => removeCertification(idx)}
                                    className="px-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button onClick={addCertification} className="w-full py-3 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-500 hover:border-blue-500 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                            <Plus className="w-4 h-4" /> Add Certification
                        </button>
                    </div>
                )}
            </div>

            {/* Projects */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => toggleSection('projects')} className={sectionHeaderClass}>
                    <span>Projects</span>
                    {activeSection === 'projects' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeSection === 'projects' && (
                    <div className="p-5 space-y-6 bg-white dark:bg-black/20">
                        {resumeData.projects.map((proj, idx) => (
                            <div key={proj.id} className="p-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-[#1c1c1e] relative group">
                                <button onClick={() => removeProject(proj.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Project Title</label>
                                        <input type="text" className={inputClass} value={proj.title} onChange={(e) => updateProject(proj.id, 'title', e.target.value)} placeholder="e.g. E-Commerce Platform" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Tech Stack (Comma Separated)</label>
                                        <input type="text" className={inputClass} value={proj.techStack.join(', ')} onChange={(e) => updateProject(proj.id, 'techStack', e.target.value.split(',').map(s => s.trim()))} placeholder="React, Node.js, MongoDB" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea rows={3} className={inputClass} value={proj.description} onChange={(e) => updateProject(proj.id, 'description', e.target.value)} placeholder="Describe what you built and the impact..." />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addProject} className="w-full py-3 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-500 hover:border-blue-500 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                            <Plus className="w-4 h-4" /> Add Project
                        </button>
                    </div>
                )}
            </div>

            {/* Experience */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => toggleSection('experience')} className={sectionHeaderClass}>
                    <span>Experience</span>
                    {activeSection === 'experience' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeSection === 'experience' && (
                    <div className="p-5 space-y-6 bg-white dark:bg-black/20">
                        {resumeData.experience.map((exp, idx) => (
                            <div key={exp.id} className="p-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-[#1c1c1e] relative group">
                                <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Company</label>
                                            <input type="text" className={inputClass} value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company Name" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Role</label>
                                            <input type="text" className={inputClass} value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} placeholder="Job Title" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Duration</label>
                                        <input type="text" className={inputClass} value={exp.duration} onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)} placeholder="Jan 2023 - Present" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea rows={3} className={inputClass} value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} placeholder="Key responsibilities and achievements..." />
                                    </div>
                                </div>
                            </div>
                        ))}
                         <button onClick={addExperience} className="w-full py-3 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-500 hover:border-blue-500 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                            <Plus className="w-4 h-4" /> Add Experience
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* RIGHT PANE: PREVIEW */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-200 dark:bg-slate-900 rounded-[2rem] border border-slate-300 dark:border-white/5 overflow-hidden shadow-inner relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2 no-print">
              <button onClick={handlePrint} className="bg-slate-800 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" title="Print / Download PDF">
                  <Printer className="w-5 h-5" />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
              {/* RESUME DOCUMENT - A4 RATIO */}
              <div 
                ref={printRef}
                id="resume-preview"
                className="bg-white text-black w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl origin-top transform scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.85] xl:scale-100 transition-transform"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                  {/* Header */}
                  <div className="text-center border-b-2 border-black pb-4 mb-4">
                      <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">{resumeData.fullName || 'YOUR NAME'}</h1>
                      <div className="text-sm flex justify-center gap-4 flex-wrap">
                          {resumeData.email && <span>{resumeData.email}</span>}
                          {resumeData.phone && <span>• {resumeData.phone}</span>}
                          {resumeData.linkedin && <span>• {resumeData.linkedin}</span>}
                          {resumeData.github && <span>• {resumeData.github}</span>}
                      </div>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && (
                      <div className="mb-4">
                          <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Professional Summary</h2>
                          <p className="text-sm leading-relaxed">{resumeData.summary}</p>
                      </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && (
                       <div className="mb-4">
                          <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Education</h2>
                          {resumeData.education.map((edu, i) => (
                              <div key={i} className="mb-2 flex justify-between">
                                  <div>
                                      <div className="font-bold text-sm">{edu.institution}</div>
                                      <div className="text-sm italic">{edu.degree}</div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-sm font-bold">{edu.year}</div>
                                      {edu.gpa && <div className="text-sm">GPA: {edu.gpa}</div>}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills.length > 0 && (
                      <div className="mb-4">
                          <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Technical Skills</h2>
                          <p className="text-sm leading-relaxed">
                              {resumeData.skills.join(' • ')}
                          </p>
                      </div>
                  )}

                   {/* Certifications */}
                   {resumeData.certifications.length > 0 && (
                      <div className="mb-4">
                          <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Certifications</h2>
                          <ul className="list-disc list-inside text-sm leading-relaxed">
                              {resumeData.certifications.map((cert, i) => (
                                  <li key={i}>{cert}</li>
                              ))}
                          </ul>
                      </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                      <div className="mb-4">
                          <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Projects</h2>
                          {resumeData.projects.map((proj, i) => (
                              <div key={i} className="mb-3">
                                  <div className="flex justify-between items-baseline">
                                      <h3 className="text-sm font-bold">{proj.title}</h3>
                                      <span className="text-xs italic">{proj.techStack.join(', ')}</span>
                                  </div>
                                  <p className="text-sm mt-1 leading-snug">{proj.description}</p>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                      <div className="mb-4">
                          <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Experience</h2>
                          {resumeData.experience.map((exp, i) => (
                              <div key={i} className="mb-3">
                                  <div className="flex justify-between">
                                      <h3 className="text-sm font-bold">{exp.company}</h3>
                                      <span className="text-sm font-bold">{exp.duration}</span>
                                  </div>
                                  <div className="text-sm italic mb-1">{exp.role}</div>
                                  <p className="text-sm leading-snug">{exp.description}</p>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            transform: none !important;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
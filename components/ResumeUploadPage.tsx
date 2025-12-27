import React from 'react';
import ResumeUpload from './ResumeUpload';
import { UserProfile } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ResumeUploadPageProps {
    onAnalysisComplete: (profile: UserProfile) => void;
}

const ResumeUploadPage: React.FC<ResumeUploadPageProps> = ({ onAnalysisComplete }) => {
    return (
        <div className="min-h-screen bg-radion-bg text-white flex flex-colitems-center justify-center p-4">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-radion-primary/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

            <div className="w-full max-w-4xl mx-auto z-10 flex flex-col items-center pt-20">

                <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-slate-700/50 bg-slate-900/50 backdrop-blur-md shadow-lg shadow-radion-primary/10">
                    <Sparkles className="w-4 h-4 text-radion-accent" />
                    <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Step 1: Profile Setup</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 tracking-tight">
                    Let's build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-radion-primary to-radion-accent">Career Profile.</span>
                </h1>

                <p className="text-xl text-slate-400 text-center max-w-2xl mb-12">
                    Upload your resume to let our AI identify your skills, experience, and gaps. We'll match you with the right internships instantly.
                </p>

                <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 opacity-50"></div>

                    <ResumeUpload onAnalysisComplete={onAnalysisComplete} />
                </div>

                <div className="mt-12 flex flex-col items-center gap-4 opacity-60">
                    <p className="text-sm text-slate-500">Don't have a resume?</p>
                    <button className="text-sm text-white font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                        Build one manually <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeUploadPage;

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { analyzeResume } from '../services/geminiService';
import { UserProfile } from '../types';

interface ResumeUploadProps {
  onAnalysisComplete: (profile: UserProfile) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onAnalysisComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError("Please upload a PDF file.");
      return;
    }

    // Check for 5MB limit (5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const profile = await analyzeResume(base64String, file.type);
          onAnalysisComplete(profile);
        } catch (err) {
          console.error(err);
          setError("Failed to analyze resume with Gemini. Please try again.");
          setIsAnalyzing(false);
        }
      };
      reader.onerror = () => {
        setError("Error reading file.");
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 group cursor-pointer ${isDragging
          ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-xl'
          : isAnalyzing
            ? 'border-slate-200 bg-slate-50'
            : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50 hover:shadow-lg bg-white'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileSelect}
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-200 rounded-full blur animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-full shadow-sm">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Profile...</h3>
            <p className="text-slate-500 text-sm">Gemini is reading your projects and skills.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${isDragging ? 'bg-blue-200 scale-110' : 'bg-blue-50 group-hover:bg-blue-100 group-hover:scale-110'}`}>
              <UploadCloud className={`w-10 h-10 transition-colors ${isDragging ? 'text-blue-700' : 'text-blue-600'}`} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {isDragging ? 'Drop it like it\'s hot' : 'Upload Resume'}
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
              Upload 1 page resume up to 5MB
            </p>
            <div className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm group-hover:border-blue-300 group-hover:text-blue-600 transition-all">
              Select PDF File
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-700 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {!isAnalyzing && !error && (
        <div className="mt-8 text-center flex items-center justify-center gap-6 text-slate-400 grayscale opacity-70">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold">PDF Only</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">ATS Friendly</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
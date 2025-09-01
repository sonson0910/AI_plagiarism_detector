import React from 'react';
import type { PlagiarizedSentence, GroundingSource } from '../types';
import { GlobeIcon, XIcon, BotIcon } from './icons';

interface SourceDetailModalProps {
  sentence: PlagiarizedSentence;
  sources: GroundingSource[];
  onClose: () => void;
}

const SourceDetailModal: React.FC<SourceDetailModalProps> = ({ sentence, sources, onClose }) => {
  const sourceInfo = sources.find(s => s.web?.uri === sentence.source);
  const title = sourceInfo?.web?.title;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const isAI = sentence.sourceType === 'AI';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fadeIn"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-900/50 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-2xl w-full max-w-2xl animate-scaleIn relative glow-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
            aria-label="Đóng"
          >
            <XIcon className="w-6 h-6" />
          </button>
          
          <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
            {isAI ? <BotIcon className="w-6 h-6 text-fuchsia-400" /> : <GlobeIcon className="w-6 h-6 text-cyan-400" />}
            Chi tiết nguồn
          </h2>
          
          <div className="space-y-4 text-slate-300">
            <div>
              <h3 className="font-semibold text-slate-400 text-sm mb-1 uppercase tracking-wider">Văn bản trùng khớp</h3>
              <p className="p-3 bg-black/20 rounded-md font-mono text-sm border border-white/10">"{sentence.sentence}"</p>
            </div>

            {isAI ? (
                 <div>
                    <h3 className="font-semibold text-slate-400 text-sm mb-1 uppercase tracking-wider">Phân tích</h3>
                    <p className="p-3 bg-black/20 rounded-md border border-white/10">{sentence.source}</p>
                </div>
            ) : (
                <>
                    {title && (
                        <div>
                            <h3 className="font-semibold text-slate-400 text-sm mb-1 uppercase tracking-wider">Tiêu đề trang</h3>
                            <p className="p-3 bg-black/20 rounded-md border border-white/10">{title}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-slate-400 text-sm mb-1 uppercase tracking-wider">URL Nguồn</h3>
                        <a 
                            href={sentence.source} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-3 bg-black/20 rounded-md block break-all text-cyan-400 hover:underline hover:bg-black/40 transition-colors border border-white/10"
                        >
                            {sentence.source}
                        </a>
                    </div>
                </>
            )}
          </div>
      </div>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SourceDetailModal;
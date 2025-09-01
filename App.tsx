import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Loader from './components/Loader';
import ScoreDonut from './components/ScoreDonut';
import HighlightedText from './components/HighlightedText';
import SourceDetailModal from './components/SourceDetailModal';
import { checkPlagiarism } from './services/geminiService';
import type { PlagiarismResult, GroundingSource, PlagiarizedSentence } from './types';
import { FileTextIcon, AlertTriangleIcon, LinkIcon, GlobeIcon, BotIcon } from './components/icons';

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<PlagiarizedSentence | null>(null);

  const handleViewSource = (sentence: PlagiarizedSentence) => {
    setSelectedSentence(sentence);
  };

  const handleCloseModal = () => {
    setSelectedSentence(null);
  };

  const handleCheck = useCallback(async () => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSources([]);
    setSelectedSentence(null);

    try {
      const { result: analysis, sources: groundingSources } = await checkPlagiarism(text);
      
      if (analysis && analysis.plagiarizedSentences) {
        const totalChars = text.length;
        const plagiarizedChars = analysis.plagiarizedSentences.reduce(
          (sum, s) => sum + s.sentence.length,
          0
        );

        const score = totalChars > 0 ? Math.round((plagiarizedChars / totalChars) * 100) : 0;
        
        const webCount = analysis.plagiarizedSentences.filter(s => s.sourceType === 'WEB').length;
        const aiCount = analysis.plagiarizedSentences.filter(s => s.sourceType === 'AI').length;

        let summary: string;
        if (score === 0 && webCount === 0 && aiCount === 0) {
            summary = 'Xuất sắc! Không phát hiện dấu hiệu đạo văn hay nội dung do AI tạo ra.';
        } else if (webCount > 0 && aiCount > 0) {
            summary = `Phát hiện ${webCount} trường hợp đạo văn từ internet và ${aiCount} phân đoạn do AI tạo.`;
        } else if (webCount > 0) {
            summary = `Phát hiện ${webCount} trường hợp đạo văn từ các nguồn trên internet.`;
        } else if (aiCount > 0) {
            summary = `Phát hiện ${aiCount} phân đoạn có khả năng cao do AI tạo ra.`;
        } else {
            summary = `Phân tích hoàn tất. Điểm đạo văn/AI được tính là ${score}%.`;
        }

        const fullResult: PlagiarismResult = {
          plagiarismScore: score,
          summary: summary,
          plagiarizedSentences: analysis.plagiarizedSentences,
        };
        setResult(fullResult);

      } else if (analysis) { 
         const fullResult: PlagiarismResult = {
          plagiarismScore: 0,
          summary: 'Xuất sắc! Không phát hiện dấu hiệu đạo văn hay nội dung do AI tạo ra.',
          plagiarizedSentences: [],
        };
        setResult(fullResult);
      } else {
        setError('Không thể phân tích phản hồi từ API. Định dạng có thể không hợp lệ.');
      }
      setSources(groundingSources);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, [text, isLoading]);
  
  const Panel: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10 shadow-lg ${className}`}>
        {children}
    </div>
  );

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 bg-red-900/20 p-6 rounded-lg border border-red-500/50 animate-fadeInUp">
          <AlertTriangleIcon className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Phân tích thất bại</h3>
          <p className="text-center">{error}</p>
        </div>
      );
    }
    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-fadeInUp">
          <FileTextIcon className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">Báo cáo phân tích</h3>
          <p>Kết quả phân tích của bạn sẽ được hiển thị ở đây.</p>
        </div>
      );
    }

    const webSentences = result.plagiarizedSentences.filter(s => s.sourceType === 'WEB');
    const aiSentences = result.plagiarizedSentences.filter(s => s.sourceType === 'AI');

    return (
      <div className="space-y-6 animate-fadeInUp">
        <Panel className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <ScoreDonut score={result.plagiarismScore} />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-100">Tổng quan phân tích</h3>
            <p className="text-slate-400 mt-1">{result.summary}</p>
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold text-slate-100 mb-3">Văn bản được đánh dấu</h3>
          <div className="max-h-60 overflow-y-auto pr-2 bg-black/20 p-3 rounded-md border border-white/10">
            <HighlightedText text={text} sentences={result.plagiarizedSentences} onSentenceClick={handleViewSource} />
          </div>
        </Panel>
        
        {webSentences.length > 0 && (
          <Panel>
            <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
              <GlobeIcon className="w-5 h-5 text-cyan-400" />
              Đạo văn từ Internet
            </h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {webSentences.map((item, index) => (
                <li key={index}>
                    <button 
                        onClick={() => handleViewSource(item)}
                        title="Nhấp để xem chi tiết"
                        className="w-full text-left text-sm p-3 bg-cyan-900/20 rounded-md border-l-4 border-cyan-500 hover:bg-cyan-900/40 transition-colors"
                    >
                      <p className="font-semibold text-cyan-300 truncate">"{item.sentence}"</p>
                      <p className="text-slate-400 mt-1 flex items-center gap-1.5 font-mono text-xs">
                        <span className="font-medium">Nguồn:</span>
                        <span className="underline truncate">
                          {item.source}
                        </span>
                      </p>
                    </button>
                </li>
              ))}
            </ul>
          </Panel>
        )}
            
        {aiSentences.length > 0 && (
          <Panel>
            <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
              <BotIcon className="w-5 h-5 text-fuchsia-400" />
              Nội dung có thể do AI tạo
            </h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {aiSentences.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleViewSource(item)}
                    title="Nhấp để xem chi tiết"
                    className="w-full text-left text-sm p-3 bg-fuchsia-900/20 rounded-md border-l-4 border-fuchsia-500 hover:bg-fuchsia-900/40 transition-colors"
                  >
                    <p className="font-semibold text-fuchsia-300 truncate">"{item.sentence}"</p>
                    <p className="text-slate-400 mt-1 truncate">
                        <span className="font-medium">Phân tích:</span> {item.source}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        )}
        
        {sources.length > 0 && (
          <Panel>
            <h3 className="text-lg font-bold text-slate-100 mb-3">Tham khảo từ Google Search</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {sources.filter(s => s.web && s.web.uri).map((source, index) => (
                <li key={index} className="text-sm p-2 bg-black/20 rounded-md border border-white/10">
                  <a href={source.web!.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-cyan-300 hover:underline">
                    <LinkIcon className="w-4 h-4" />
                    <span className="truncate">{source.web!.title || source.web!.uri}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg border border-white/10 shadow-lg glow-border">
             <h2 id="textarea-label" className="text-xl font-bold text-slate-100 mb-4">Nhập văn bản để phân tích</h2>
             <div className="relative">
               <textarea
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 placeholder="Dán văn bản của bạn vào đây..."
                 className="w-full h-96 p-4 bg-black/20 border border-white/10 rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none resize-none placeholder-slate-500 transition-colors"
                 aria-labelledby="textarea-label"
               />
               <span className="absolute bottom-3 right-3 text-xs text-slate-500 font-mono" aria-live="polite">{text.length} ký tự</span>
             </div>
             <button
               onClick={handleCheck}
               disabled={isLoading || !text.trim()}
               className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-md hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-cyan-500/50 disabled:shadow-none"
             >
               {isLoading ? 'Đang phân tích...' : 'Thực hiện quét'}
             </button>
          </div>
          {/* Results Panel */}
          <div className="bg-black/20 border border-white/10 p-6 rounded-lg shadow-lg min-h-[574px] flex flex-col">
            <div className="flex-grow overflow-y-auto -mr-4 pr-4">
              {renderResults()}
            </div>
          </div>
        </div>
      </main>
      {selectedSentence && (
        <SourceDetailModal
          sentence={selectedSentence}
          sources={sources}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default App;
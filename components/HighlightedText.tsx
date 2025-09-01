import React from 'react';
import type { PlagiarizedSentence } from '../types';

interface HighlightedTextProps {
  text: string;
  sentences: PlagiarizedSentence[];
  onSentenceClick: (sentence: PlagiarizedSentence) => void;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, sentences, onSentenceClick }) => {
  if (sentences.length === 0) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const sortedSentences = [...sentences].sort((a, b) => b.sentence.length - a.sentence.length);
  const pattern = sortedSentences.map(s => `(${escapeRegExp(s.sentence)})`).join('|');
  const regex = new RegExp(pattern, 'g');

  const parts = text.split(regex).filter(part => part);

  return (
    <p className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, index) => {
        const foundSentence = sortedSentences.find(s => s.sentence === part);
        if (foundSentence) {
          const isAI = foundSentence.sourceType === 'AI';
          const markClass = isAI 
            ? "bg-fuchsia-500/20 text-fuchsia-300" 
            : "bg-cyan-500/20 text-cyan-300";
          return (
            <mark 
              key={index} 
              className={`${markClass} px-1 py-0.5 rounded-md cursor-pointer hover:ring-1 hover:ring-white/50 transition-all`} 
              title={`Nhấp để xem chi tiết`}
              onClick={() => onSentenceClick(foundSentence)}
            >
              {part}
            </mark>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};

export default HighlightedText;
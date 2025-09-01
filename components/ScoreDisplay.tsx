import React, { useState, useEffect } from 'react';

export const ScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animateScore = () => {
      if (displayScore < score) {
        setDisplayScore(prev => Math.min(prev + 1, score));
        animationFrameId = requestAnimationFrame(animateScore);
      } else if (displayScore > score) {
         setDisplayScore(prev => Math.max(prev - 1, score));
         animationFrameId = requestAnimationFrame(animateScore);
      }
    };
    animationFrameId = requestAnimationFrame(animateScore);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score, displayScore]);
  
   useEffect(() => {
    if (score === 0) {
      setDisplayScore(0);
    }
  }, [score]);

  let colorClass = 'text-green-400';
  if (score > 10) colorClass = 'text-yellow-400';
  if (score > 25) colorClass = 'text-orange-400';
  if (score > 50) colorClass = 'text-red-500';

  return (
    <div className="flex-shrink-0 w-32 h-24 bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-slate-600 p-2">
      <span className={`text-5xl font-bold font-mono ${colorClass} transition-colors`}>
        {Math.round(displayScore)}%
      </span>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
        ĐẠO VĂN
      </span>
    </div>
  );
};

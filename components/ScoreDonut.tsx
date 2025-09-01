import React, { useState, useEffect, useRef } from 'react';

const ScoreDonut: React.FC<{ score: number }> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const circumference = 2 * Math.PI * 54; // 54 is the radius (cx - stroke-width/2)
  const [offset, setOffset] = useState(circumference);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      let diff = score - displayScore;
      if (Math.abs(diff) < 0.1) {
        setDisplayScore(score);
        return;
      }
      const newDisplayScore = displayScore + diff * 0.1;
      setDisplayScore(newDisplayScore);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score, displayScore]);

  useEffect(() => {
    const progress = displayScore / 100;
    setOffset(circumference - progress * circumference);
  }, [displayScore, circumference]);

  let colorId = 'score-gradient-green';
  if (score > 25) colorId = 'score-gradient-yellow';
  if (score > 50) colorId = 'score-gradient-red';

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg ref={svgRef} className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="score-gradient-green" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="score-gradient-yellow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="score-gradient-red" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="54"
          strokeWidth="12"
          className="stroke-current text-white/10"
          fill="transparent"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          strokeWidth="12"
          fill="transparent"
          stroke={`url(#${colorId})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.35s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono text-white">
          {Math.round(displayScore)}%
        </span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
          Đạo văn
        </span>
      </div>
    </div>
  );
};

export default ScoreDonut;
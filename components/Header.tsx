import React from 'react';
import { SearchIcon } from './icons';

const Header: React.FC = () => {
  return (
    <>
      <header className="bg-black/30 backdrop-blur-lg sticky top-0 z-10 border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-400/10 rounded-lg border border-cyan-400/20">
              <SearchIcon className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-wider font-mono">
              Quét Đạo Văn & Phát Hiện AI
            </h1>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
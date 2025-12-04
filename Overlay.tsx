
import React from 'react';
import { THEMES } from '../constants';
import { ThemeColor } from '../types';

interface OverlayProps {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  storm: boolean;
  setStorm: (storm: boolean) => void;
}

const Overlay: React.FC<OverlayProps> = ({ theme, setTheme, storm, setStorm }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12">
      
      {/* Header */}
      <header className="flex flex-col items-start gap-2 animate-fade-in-down">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-[0_4px_0_rgba(255,0,85,0.8)]" style={{ fontFamily: 'Playfair Display' }}>
          四畳半
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#FF0055] drop-shadow-md bg-white px-2 italic transform -skew-x-12">
          ROSE GALAXY
        </h2>
      </header>

      {/* Controls */}
      <div className="pointer-events-auto self-end md:self-center flex flex-col items-end md:items-center gap-6">
        
        {/* Storm Trigger */}
        <button
           onClick={() => setStorm(!storm)}
           className={`
             group relative px-10 py-4 rounded-none text-lg font-black tracking-widest uppercase transition-all duration-300 transform
             ${storm 
               ? 'bg-[#FF0055] text-white scale-110 rotate-2' 
               : 'bg-white text-[#FF0055] border-4 border-[#FF0055] hover:bg-[#FF0055] hover:text-white hover:-rotate-2'
             }
           `}
        >
          <span className="relative z-10">{storm ? 'CALM' : 'IGNITE STORM'}</span>
        </button>

        {/* Theme Selectors */}
        <div className="flex gap-4 bg-white/80 backdrop-blur-sm p-2 border-2 border-[#FF0055]">
          {(Object.keys(THEMES) as ThemeColor[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`
                px-6 py-2 text-xs font-bold tracking-widest uppercase transition-all duration-300
                ${theme === t 
                  ? 'bg-[#FF0055] text-white' 
                  : 'bg-transparent text-[#FF0055] hover:bg-[#FF0055]/10'
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex justify-between items-end text-[#4A0E2E] font-bold text-sm md:text-base">
        <div className="max-w-[200px] bg-white/50 p-2 backdrop-blur">
          <p>DRAG TO ROTATE</p>
          <p>CLICK TREES TO INTERACT</p>
        </div>
      </footer>
    </div>
  );
};

export default Overlay;

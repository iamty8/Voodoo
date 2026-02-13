
import React, { useState } from 'react';

interface ControlsProps {
  name: string;
  onNameChange: (name: string) => void;
  onFaceUpload: (url: string) => void;
  onClearPins: () => void;
  pinCount: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  name, 
  onNameChange, 
  onFaceUpload, 
  onClearPins,
  pinCount 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onFaceUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2 mb-4 transition-all duration-500 ease-in-out">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-800/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transition-all hover:bg-slate-700 active:scale-95 flex items-center gap-2"
      >
        <span>{isExpanded ? '▼ Hide Tools' : '▲ Show Tools'}</span>
        {pinCount > 0 && !isExpanded && (
          <span className="bg-red-600 text-white px-1.5 rounded-full text-[10px]">{pinCount}</span>
        )}
      </button>

      {/* Main Controls Panel */}
      <div className={`
        bg-slate-800/80 backdrop-blur-lg p-6 rounded-[2rem] border border-slate-700 shadow-2xl 
        flex flex-col md:flex-row gap-4 items-center w-full max-w-4xl 
        transition-all duration-500 origin-bottom
        ${isExpanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none h-0 p-0 overflow-hidden'}
      `}>
        
        {/* Name Input */}
        <div className="flex flex-col gap-1 flex-grow w-full md:w-auto">
          <label className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-wider">Victim Identity</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Name your target..."
            className="bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Face Upload */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-wider">Soul Capture</label>
          <label 
            htmlFor="face-upload"
            className="bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-2 text-white cursor-pointer hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">📷</span>
            Upload Face
          </label>
          <input 
            id="face-upload"
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-wider">Dark Ritual</label>
          <button 
            onClick={onClearPins}
            className="bg-red-700 hover:bg-red-600 text-white font-bold rounded-2xl px-6 py-2 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:rotate-12 transition-transform">🧶</span>
            Remove All {pinCount > 0 ? `(${pinCount})` : ''}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <p className="text-slate-500 text-[10px] uppercase tracking-tighter opacity-50">
          Click the doll to strike • Drag to rotate
        </p>
      )}
    </div>
  );
};

export default Controls;

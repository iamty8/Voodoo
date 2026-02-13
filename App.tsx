
import React, { useState, useCallback, useRef } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import { DollState, PinData } from './types';

const App: React.FC = () => {
  const [dollState, setDollState] = useState<DollState>({
    name: 'Unknown Victim',
    faceImageUrl: null,
    pins: [],
  });

  const handleNameChange = (name: string) => {
    setDollState(prev => ({ ...prev, name }));
  };

  const handleFaceUpload = (url: string) => {
    setDollState(prev => ({ ...prev, faceImageUrl: url }));
  };

  const handleAddPin = (pin: PinData) => {
    setDollState(prev => ({
      ...prev,
      pins: [...prev.pins, pin]
    }));
  };

  const handleClearPins = () => {
    setDollState(prev => ({ ...prev, pins: [] }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-white">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene 
          dollState={dollState} 
          onAddPin={handleAddPin}
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-red-500 drop-shadow-lg mb-2">
            扎小人
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Upload a face, write a name, and place your pins. 
            The doll remembers every interaction.
          </p>
        </header>

        <Controls 
          name={dollState.name}
          onNameChange={handleNameChange}
          onFaceUpload={handleFaceUpload}
          onClearPins={handleClearPins}
          pinCount={dollState.pins.length}
        />
      </div>

      {/* Aesthetic Gradients */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </div>
  );
};

export default App;

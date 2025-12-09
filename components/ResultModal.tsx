import React, { useEffect, useState } from 'react';
import { RecognitionResult } from '../types';

interface ResultModalProps {
  result: RecognitionResult;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  const [displayImage, setDisplayImage] = useState<string>(result.generatedImage || result.sourceImage);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
     if (result.type === 'sketch' && !result.generatedImage) {
        const encoded = encodeURIComponent(`photorealistic cute ${result.englishName} object white background`);
        const url = `https://image.pollinations.ai/prompt/${encoded}?nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
        setDisplayImage(url);
     }
  }, [result]);

  const handleClose = () => {
      setClosing(true);
      setTimeout(onClose, 300); // Match animation duration
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; 
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 transition-colors duration-300 ${closing ? 'bg-black/0' : 'bg-black/40 backdrop-blur-sm'}`}>
      
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={handleClose}></div>

      {/* Card Content */}
      <div 
        className={`bg-white w-full max-w-sm sm:rounded-[2rem] rounded-t-[2rem] shadow-ios-deep overflow-hidden flex flex-col items-center text-center transform transition-transform duration-300 ${closing ? 'translate-y-full sm:scale-95 sm:opacity-0' : 'translate-y-0 sm:scale-100'}`}
        style={{ maxHeight: '90vh' }}
      >
        
        {/* Drag Handle (Mobile visual cue) */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mt-3 mb-2 shrink-0 sm:hidden"></div>

        {/* Close Button (Desktop/Mobile Corner) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        >
          <span className="material-icons-round text-lg">close</span>
        </button>

        <div className="p-6 w-full overflow-y-auto pb-12">
            
            {/* Real/Source Image */}
            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100 bg-gray-50 relative group">
                <img 
                    src={displayImage} 
                    alt={result.englishName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x400?text=${result.englishName}`;
                    }}
                />
            </div>

            {/* Typography */}
            <div className="mb-6 space-y-2">
                <div className="flex items-center justify-center gap-3">
                    <h2 className="text-4xl font-black text-gray-900 capitalize tracking-tight font-comic">
                        {result.englishName}
                    </h2>
                    <span className="text-4xl">{result.emoji}</span>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-500 font-medium font-serif italic text-lg">
                        /{result.phonetic}/
                    </span>
                    <button 
                        onClick={() => playAudio(result.englishName)} 
                        className="w-10 h-10 bg-ios-blue text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                    >
                        <span className="material-icons-round">volume_up</span>
                    </button>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-400 font-comic">
                    {result.chineseName}
                </h3>
            </div>

            {/* Sentence Box */}
            {result.simpleSentence && (
                <div className="bg-ios-bg p-5 rounded-2xl w-full text-left relative overflow-hidden group cursor-pointer" onClick={() => playAudio(result.simpleSentence || "")}>
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-kid-yellow"></div>
                    <p className="text-gray-800 text-lg font-comic leading-relaxed">
                        "{result.simpleSentence}"
                    </p>
                    <div className="mt-3 flex items-center text-ios-blue text-sm font-bold uppercase tracking-wide">
                        <span className="material-icons-round text-base mr-1">play_circle</span> Read Aloud
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
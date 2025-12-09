import React from 'react';
import { RecognitionResult } from '../types';

interface HistoryViewProps {
  history: RecognitionResult[];
  onSelect: (item: RecognitionResult) => void;
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-icons-round text-4xl text-gray-300">auto_stories</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">No collections yet</h3>
            <p className="text-gray-500">Draw or snap a photo to start your dictionary.</p>
        </div>
    );
  }

  return (
    <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-4 mt-2">
            <h2 className="text-xl font-bold text-gray-900">Recent</h2>
            <button 
                onClick={onClear} 
                className="text-red-500 text-sm font-medium px-3 py-1 bg-red-50 rounded-full active:bg-red-100 transition-colors"
            >
                Clear All
            </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {history.slice().reverse().map((item) => (
                <button 
                    key={item.id} 
                    onClick={() => onSelect(item)}
                    className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 active:scale-95 transition-all text-left group"
                >
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 relative">
                        <img src={item.generatedImage || item.sourceImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.englishName} />
                        <span className="absolute bottom-1 right-1 text-xl drop-shadow-sm">{item.emoji}</span>
                        {item.type === 'photo' && (
                            <span className="absolute top-1 left-1 bg-black/40 backdrop-blur text-white rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wider">PHOTO</span>
                        )}
                    </div>
                    <div className="px-1">
                        <div className="font-bold text-gray-900 leading-tight truncate font-comic">{item.englishName}</div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{item.chineseName}</div>
                    </div>
                </button>
            ))}
        </div>
    </div>
  );
};

export default HistoryView;
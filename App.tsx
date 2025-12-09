import React, { useRef, useState, useEffect } from 'react';
import DrawingCanvas, { DrawingCanvasHandle } from './components/DrawingCanvas';
import ResultModal from './components/ResultModal';
import BottomNav from './components/BottomNav';
import HistoryView from './components/HistoryView';
import TranslateView from './components/TranslateView';
import CameraView from './components/CameraView';
import { identifySketch } from './services/geminiService';
import { RecognitionResult } from './types';

// Ensure API key is present at start
if (!process.env.API_KEY) {
    console.error("Missing API_KEY in environment");
}

type View = 'draw' | 'camera' | 'translate' | 'history';

const App: React.FC = () => {
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [currentView, setCurrentView] = useState<View>('draw');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<RecognitionResult | null>(null);
  const [penColor, setPenColor] = useState<string>('#000000');
  
  // History State
  const [history, setHistory] = useState<RecognitionResult[]>(() => {
      const saved = localStorage.getItem('magicSketchHistory');
      return saved ? JSON.parse(saved) : [];
  });

  // Persist history
  useEffect(() => {
      localStorage.setItem('magicSketchHistory', JSON.stringify(history));
  }, [history]);

  const addToHistory = (result: RecognitionResult) => {
      setHistory(prev => [...prev, result]);
      setCurrentResult(result);
  };

  const colors = [
    '#000000', '#FF3B30', '#34C759', '#007AFF', '#FF9500', '#AF52DE'
  ];

  const handleSketchGuess = async () => {
    if (!canvasRef.current || !canvasRef.current.hasDrawing()) {
        alert("Draw something first! 🎨");
        return;
    }

    try {
      setIsProcessing(true);
      const base64 = canvasRef.current.getDataUrl();
      const data = await identifySketch(base64);
      
      const fullResult: RecognitionResult = {
          ...data,
          id: Date.now().toString(),
          timestamp: Date.now(),
          sourceImage: base64,
          type: 'sketch',
      };
      
      const encoded = encodeURIComponent(`photorealistic cute ${data.englishName} object white background`);
      fullResult.generatedImage = `https://image.pollinations.ai/prompt/${encoded}?nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

      addToHistory(fullResult);

    } catch (error) {
      console.error("Error identifying sketch:", error);
      alert("Try again!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ios-bg text-gray-900 font-sans select-none flex flex-col">
      
      {/* Dynamic Header */}
      <header className="safe-top w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-20 flex items-center justify-center h-[60px] flex-none">
        <h1 className="text-lg font-bold tracking-tight text-gray-900">
          {currentView === 'draw' && 'Magic Canvas'}
          {currentView === 'camera' && 'Camera'}
          {currentView === 'translate' && 'Translator'}
          {currentView === 'history' && 'Collection'}
        </h1>
        {currentView === 'draw' && (
             <button 
                onClick={() => canvasRef.current?.clear()}
                className="absolute right-4 text-ios-blue font-medium text-sm active:opacity-50"
             >
                Clear
             </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow relative w-full max-w-2xl mx-auto overflow-hidden bg-ios-bg">
        
        {/* VIEW: DRAW */}
        <div className={`absolute inset-0 flex flex-col p-4 transition-all duration-300 ${currentView === 'draw' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            
            {/* Canvas Card */}
            <div className="w-full aspect-square bg-white rounded-3xl shadow-ios overflow-hidden relative border border-gray-100 mb-6">
                <DrawingCanvas 
                    ref={canvasRef} 
                    color={penColor} 
                    lineWidth={8} 
                />
                
                 {/* Undo Button - Floating */}
                <button 
                    onClick={() => canvasRef.current?.undo()}
                    className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-700 p-2.5 rounded-full shadow-sm border border-gray-100 active:scale-95 transition-transform"
                >
                    <span className="material-icons-round text-xl">undo</span>
                </button>

                {isProcessing && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                         <div className="w-12 h-12 border-4 border-ios-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                         <p className="font-semibold text-gray-600">Thinking...</p>
                    </div>
                )}
            </div>

            {/* Tools Palette - Floating Pill */}
            <div className="w-full bg-white rounded-[2rem] p-4 shadow-ios border border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setPenColor(c)}
                            className={`w-10 h-10 rounded-full transition-all duration-200 ${penColor === c ? 'ring-2 ring-offset-2 ring-gray-300 scale-110' : 'hover:scale-105'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
                
                <button 
                    onClick={handleSketchGuess}
                    disabled={isProcessing}
                    className="w-full bg-black text-white font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <span>✨ Identify</span>
                </button>
            </div>
        </div>

        {/* OTHER VIEWS */}
        <div className={`absolute inset-0 overflow-y-auto pb-24 transition-opacity duration-300 ${currentView === 'camera' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
             <CameraView onResult={addToHistory} />
        </div>

        <div className={`absolute inset-0 overflow-y-auto pb-24 transition-opacity duration-300 ${currentView === 'translate' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
             <TranslateView />
        </div>

        <div className={`absolute inset-0 overflow-y-auto pb-24 transition-opacity duration-300 ${currentView === 'history' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
             <HistoryView 
                history={history} 
                onSelect={setCurrentResult} 
                onClear={() => setHistory([])}
            />
        </div>

      </main>

      {/* Bottom Navigation */}
      <BottomNav current={currentView} onChange={setCurrentView} />

      {/* Result Modal Overlay */}
      {currentResult && (
        <ResultModal 
            result={currentResult} 
            onClose={() => setCurrentResult(null)} 
        />
      )}

    </div>
  );
};

export default App;
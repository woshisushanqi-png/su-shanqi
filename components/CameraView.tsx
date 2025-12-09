import React, { useRef, useState } from 'react';
import { identifyPhoto } from '../services/geminiService';
import { RecognitionResult } from '../types';

interface CameraViewProps {
    onResult: (result: RecognitionResult) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onResult }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!preview) return;
        setProcessing(true);
        try {
            const data = await identifyPhoto(preview);
            const result: RecognitionResult = {
                ...data,
                id: Date.now().toString(),
                timestamp: Date.now(),
                sourceImage: preview,
                type: 'photo'
            };
            onResult(result);
            setPreview(null);
        } catch (e) {
            alert("Identification failed. Try a clearer photo!");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4">
            
            {!preview ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-8">
                    <div 
                        onClick={() => inputRef.current?.click()}
                        className="w-64 h-64 bg-white rounded-[2.5rem] flex items-center justify-center shadow-ios border border-gray-100 cursor-pointer active:scale-95 transition-transform"
                    >
                        <span className="material-icons-round text-6xl text-gray-300">add_a_photo</span>
                    </div>
                    
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Identify Object</h2>
                        <p className="text-gray-500 max-w-[200px] mx-auto">Snap a picture of a toy or fruit to learn its name.</p>
                    </div>

                    <button 
                        onClick={() => inputRef.current?.click()}
                        className="w-full max-w-xs bg-ios-blue text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-round">photo_camera</span>
                        Open Camera
                    </button>
                    
                    <input 
                        ref={inputRef}
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                </div>
            ) : (
                <div className="flex-col h-full flex gap-4">
                     <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-lg bg-black">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-90" />
                        {processing && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                                <span className="text-5xl animate-spin mb-4">🌀</span>
                                <span className="font-bold tracking-wide">Analyzing...</span>
                            </div>
                        )}
                        <button 
                            onClick={() => setPreview(null)}
                            className="absolute top-4 left-4 bg-black/20 backdrop-blur text-white p-2 rounded-full"
                        >
                            <span className="material-icons-round">close</span>
                        </button>
                     </div>

                     <button 
                        onClick={handleAnalyze}
                        disabled={processing}
                        className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                     >
                        Identify Object
                     </button>
                </div>
            )}
        </div>
    );
};

export default CameraView;
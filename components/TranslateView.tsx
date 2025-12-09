import React, { useState } from 'react';
import { translateContent } from '../services/geminiService';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';

const TranslateView: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [targetLang, setTargetLang] = useState<SupportedLanguage>('English');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleTranslate = async () => {
        if (!inputText && !selectedImage) return;
        setLoading(true);
        try {
            const res = await translateContent(inputText, targetLang, selectedImage || undefined);
            setResult(res);
        } catch (e) {
            setResult("Oops, translation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setSelectedImage(ev.target?.result as string);
                setResult("");
            };
            reader.readAsDataURL(file);
        }
    };

    const playResult = () => {
        if (!result) return;
        const utterance = new SpeechSynthesisUtterance(result);
        const langCode = SUPPORTED_LANGUAGES.find(l => l.name === targetLang)?.code || 'en';
        utterance.lang = langCode;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="p-4 space-y-4">
            
            {/* Language Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setTargetLang(lang.name)}
                        className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            targetLang === lang.name 
                            ? 'bg-black text-white shadow-md' 
                            : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                    >
                        <span className="text-lg">{lang.flag}</span> {lang.name}
                    </button>
                ))}
            </div>

            {/* Input Card */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                <textarea 
                    className="w-full h-32 text-lg bg-transparent border-none focus:ring-0 p-0 resize-none placeholder-gray-400 text-gray-800"
                    placeholder="Type words here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                
                {selectedImage && (
                    <div className="mt-4 relative inline-block">
                        <img src={selectedImage} alt="Upload" className="h-24 rounded-xl border border-gray-200 object-cover" />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 border-2 border-white shadow-sm"
                        >
                            <span className="material-icons-round text-xs block">close</span>
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 text-ios-blue font-medium cursor-pointer active:opacity-50">
                        <span className="material-icons-round">add_photo_alternate</span>
                        <span className="text-sm">Add Image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    <button 
                        onClick={handleTranslate}
                        disabled={loading || (!inputText && !selectedImage)}
                        className="bg-ios-blue text-white px-6 py-2 rounded-full font-bold text-sm shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? '...' : 'Translate'}
                    </button>
                </div>
            </div>

            {/* Result Card */}
            {result && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative animate-fade-in">
                    <button onClick={playResult} className="absolute top-4 right-4 text-ios-blue bg-blue-50 p-2 rounded-full active:bg-blue-100">
                        <span className="material-icons-round block">volume_up</span>
                    </button>
                    <p className="text-gray-900 text-xl font-medium pr-10 leading-relaxed">{result}</p>
                </div>
            )}
        </div>
    );
};

export default TranslateView;
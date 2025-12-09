export interface RecognitionResult {
  id: string; // Timestamp
  englishName: string;
  chineseName: string;
  phonetic: string; // IPA
  emoji: string;
  type: 'sketch' | 'photo';
  simpleSentence?: string; // For photos/learning
  sourceImage: string; // Base64 of sketch or photo
  generatedImage?: string; // URL for sketch "real" version
  timestamp: number;
}

export interface TranslationResult {
  original: string;
  translated: string;
  detectedLanguage?: string;
}

export type SupportedLanguage = 
  | 'Chinese' 
  | 'English' 
  | 'Korean' 
  | 'German' 
  | 'Italian' 
  | 'French' 
  | 'Spanish' 
  | 'Japanese';

export const SUPPORTED_LANGUAGES: {code: string, name: SupportedLanguage, flag: string}[] = [
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
];

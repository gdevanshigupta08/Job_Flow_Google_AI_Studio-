import React, { useState, useRef } from 'react';
import { generateStyledAvatar } from '../services/gemini';
import { 
  Upload, Sparkles, Image as ImageIcon, Download, RefreshCw, 
  Wand2, Save, Camera, Key
} from 'lucide-react';

const STYLE_PRESETS = [
  { id: 'corporate', label: 'Corporate Headshot', prompt: 'High-quality professional corporate headshot, studio lighting, neutral grey background, wearing a suit.' },
  { id: 'tech', label: 'Tech Conference', prompt: 'Modern tech conference speaker profile, vibrant but professional lighting, blurred modern office background.' },
  { id: 'creative', label: 'Creative Studio', prompt: 'Artistic portrait, warm dramatic lighting, minimalist aesthetic, high contrast black and white.' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'Futuristic cyberpunk style, neon lighting, blue and pink hues, high tech city background.' },
  { id: 'illustration', label: '3D Illustration', prompt: '3D pixar style character illustration, soft rendering, friendly expression, solid color background.' },
];

export const AvatarBuilder: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(STYLE_PRESETS[0].prompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSourceImage(ev.target?.result as string);
      setGeneratedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const checkApiKeyAndGenerate = async () => {
    // API Key Check logic for high-end models
    const aiStudio = (window as any).aistudio;
    if (aiStudio && aiStudio.hasSelectedApiKey) {
      const hasKey = await aiStudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
          await aiStudio.openSelectKey();
          // Wait a moment for the key to register if immediately successful (race condition mitigation handled in service via new instance)
        } catch (e) {
          console.error("Key selection failed or cancelled", e);
          return;
        }
      }
    }

    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!sourceImage || !prompt) return;

    setIsGenerating(true);
    try {
      // Remove header from base64 if present for the API call
      const base64Data = sourceImage.split(',')[1] || sourceImage;
      const resultBase64 = await generateStyledAvatar(base64Data, prompt);
      setGeneratedImage(`data:image/jpeg;base64,${resultBase64}`);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate avatar. Please ensure you have selected a valid API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Wand2 className="w-8 h-8 text-emerald-600" />
          AI Avatar Studio
        </h1>
        <p className="text-slate-500 mt-1">Transform your selfies into professional headshots or creative portraits.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        
        {/* Left Panel: Input */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-6 overflow-y-auto">
          
          {/* Upload Area */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-500" />
              1. Upload Source Image
            </h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                ${sourceImage ? 'border-emerald-500/50 bg-emerald-50/30' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}
              `}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
              
              {sourceImage ? (
                <>
                  <img src={sourceImage} alt="Source" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Change Image
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-slate-700">Click to upload a selfie</p>
                  <p className="text-sm text-slate-400 mt-1">JPG or PNG. Good lighting helps.</p>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Area */}
          <div className="space-y-4 flex-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              2. Choose Style
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setPrompt(preset.prompt)}
                  className={`p-3 text-left rounded-lg text-sm border transition-all ${
                    prompt === preset.prompt 
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/20 text-emerald-900 font-medium' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Custom Style Prompt</label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm min-h-[100px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the look you want (e.g. 'Cinematic lighting, confident expression, futuristic background...')"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
             <button
               onClick={checkApiKeyAndGenerate}
               disabled={!sourceImage || !prompt || isGenerating}
               className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
             >
               {isGenerating ? (
                 <>
                   <RefreshCw className="w-5 h-5 animate-spin" />
                   Generating Magic...
                 </>
               ) : (
                 <>
                   <Wand2 className="w-5 h-5" />
                   Generate Avatar
                 </>
               )}
             </button>
             <p className="text-center text-xs text-slate-400 mt-3">
               Powered by Gemini 3 Pro (Vision). Requires a funded API key.
             </p>
          </div>
        </div>

        {/* Right Panel: Output */}
        <div className="bg-slate-900 rounded-2xl p-1 shadow-inner flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
          
          <div className="flex-1 flex items-center justify-center p-6">
            {generatedImage ? (
              <div className="relative group max-h-full">
                <img 
                  src={generatedImage} 
                  alt="Generated Avatar" 
                  className="rounded-xl shadow-2xl max-h-[60vh] object-contain border border-slate-700"
                />
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-4 transition-all group-hover:bottom-4">
                  <a 
                    href={generatedImage} 
                    download={`jobflow-avatar-${Date.now()}.jpg`}
                    className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-emerald-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 max-w-sm">
                 <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <ImageIcon className="w-10 h-10 text-slate-600" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-400 mb-2">Ready to Create</h3>
                 <p className="text-sm text-slate-500">
                   Upload your photo and select a style to generate a professional avatar in seconds.
                 </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
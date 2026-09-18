import { useState } from 'react';
import { provider } from './lib/GenerationProvider';
import type { GenerationResult, GenerationMode } from './lib/GenerationProvider';

function App() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenerationMode>('video');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);
    try {
      const res = await provider.generate(prompt, mode);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-higgs-black text-white font-sans p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl mb-12 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Higgsfield Clone</h1>
        <p className="text-gray-400">Mocking the core generation loop...</p>
      </header>

      <main className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Controls Panel */}
        <div className="w-full md:w-1/3 bg-higgs-gray p-6 rounded-xl border border-gray-800 flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Mode</label>
            <div className="flex bg-black rounded-lg p-1">
              <button 
                onClick={() => setMode('video')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'video' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Video
              </button>
              <button 
                onClick={() => setMode('image')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'image' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Image
              </button>
            </div>
          </div>

          <div>
             <label className="block text-sm font-semibold mb-2 text-gray-300">Prompt</label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="Describe what you want to see..."
               className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-higgs-green transition-colors resize-none h-32"
             />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="mt-auto w-full bg-higgs-green text-black font-black uppercase py-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate ✦ 45'
            )}
          </button>
        </div>

        {/* Canvas / Result Panel */}
        <div className="w-full md:w-2/3 bg-black border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px] relative">
          {!isGenerating && !result && (
            <div className="text-gray-600 font-semibold text-center p-8">
              <span className="block text-4xl mb-2">✦</span>
              Ready to generate
            </div>
          )}

          {isGenerating && (
             <div className="absolute inset-0 flex items-center justify-center bg-higgs-gray bg-opacity-50 backdrop-blur-sm z-10">
                 <div className="text-higgs-green font-bold text-lg animate-pulse">Creating your vision...</div>
             </div>
          )}

          {result && result.status === 'completed' && result.url && (
            <div className="w-full h-full relative group">
              {result.mode === 'video' ? (
                <video src={result.url} controls autoPlay loop className="w-full h-full object-cover" />
              ) : (
                <img src={result.url} alt={result.prompt} className="w-full h-full object-cover" />
              )}
              <div className="absolute top-4 left-4 bg-black bg-opacity-75 px-3 py-1 rounded text-xs font-mono text-gray-300">
                {result.prompt}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { provider, fetchGenerations, type GenerationMode, type GenerationResult } from './lib/GenerationProvider';
import { AI_MODELS, type AspectRatio } from './lib/constants';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { GalleryPage } from './pages/GalleryPage';
import { GenerationDetailPage } from './pages/GenerationDetailPage';
import { LandingPage } from './pages/LandingPage';

function Router() {
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);

  // Parse route
  const generationMatch = route.match(/^#\/generations\/(.+)$/);

  if (route === '#/gallery') {
    return <AppShell navigate={navigate} activeTab="gallery"><GalleryPage onNavigate={navigate} /></AppShell>;
  }
  if (route === '#/create') {
    return <AppShell navigate={navigate} activeTab="create"><GenerationPage /></AppShell>;
  }
  if (generationMatch) {
    return (
      <AppShell navigate={navigate} activeTab="gallery">
        <GenerationDetailPage generationId={generationMatch[1]} onNavigate={navigate} />
      </AppShell>
    );
  }
  // Default: landing page
  return <LandingPage onNavigate={navigate} />;
}

function AppShell({ children, navigate, activeTab }: {
  children: React.ReactNode;
  navigate: (hash: string) => void;
  activeTab: 'create' | 'gallery';
}) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);

  return (
    <>
      <nav className="top-nav">
        <button className="nav-logo" onClick={() => navigate('#/')}>
          <span className="nav-logo-icon">✦</span>
          <span className="nav-logo-text">Higgsfield</span>
        </button>
        <div className="nav-links">
          <button
            className={`nav-link ${activeTab === 'create' ? 'nav-link-active' : ''}`}
            onClick={() => navigate('#/create')}
          >
            Create
          </button>
          <button
            className={`nav-link ${activeTab === 'gallery' ? 'nav-link-active' : ''}`}
            onClick={() => navigate('#/gallery')}
          >
            Gallery
          </button>
        </div>
        <UserMenu 
          onLoginClick={() => setAuthMode('signin')} 
          onSignupClick={() => setAuthMode('signup')} 
        />
      </nav>

      <main className="main-content">
        {children}
      </main>

      {authMode && (
        <AuthModal 
          initialMode={authMode} 
          onClose={() => setAuthMode(null)} 
        />
      )}
    </>
  );
}

function GenerationPage() {
  const { user, credits, refreshCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenerationMode>('video');
  const [selectedModel, setSelectedModel] = useState('seedance-2.5');
  const [aspectRatio] = useState<AspectRatio>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  const [tab, setTab] = useState<'history' | 'how'>('history');
  const [history, setHistory] = useState<GenerationResult[]>([]);

  const availableModels = AI_MODELS;
  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);
  const creditCost = currentModel?.creditCost ?? 45;



  useEffect(() => {
    if (user && tab === 'history') {
      fetchGenerations().then(setHistory).catch(console.error);
    }
  }, [user, tab, result]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!user) { setAuthMode('signin'); return; }
    if (credits < creditCost) { setError('Insufficient credits'); return; }

    setIsGenerating(true);
    setResult(null);
    setError('');

    try {
      const res = await provider.generate(prompt, mode, user.id, { model: selectedModel, aspectRatio });
      setResult(res);
      await refreshCredits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="gen-page">
      <div className="gen-layout">
        {/* Left Sidebar */}
        <div className="gen-sidebar">
          {/* Model Preset Card */}
          <div className="model-preset-card">
            <div className="model-preset-info">
              <div className="model-placeholder-thumb" />
              <div className="model-preset-text">
                <span className="model-preset-label">Model</span>
                <span className="model-preset-name">{currentModel?.name ?? selectedModel}</span>
              </div>
            </div>
            <button className="btn-ghost btn-small" onClick={() => setShowModelDropdown(!showModelDropdown)}>Change</button>
          </div>
          
          {showModelDropdown && (
            <div className="model-dropdown sidebar-dropdown">
              {availableModels.map((m) => (
                <button
                  key={m.id}
                  className={`model-option ${m.id === selectedModel ? 'model-option-active' : ''}`}
                  onClick={() => { 
                    setSelectedModel(m.id); 
                    setMode(m.type);
                    setShowModelDropdown(false); 
                  }}
                >
                  <span>{m.name}</span>
                  <span className="model-option-cost">⚡{m.creditCost}</span>
                </button>
              ))}
            </div>
          )}

          {/* Prompt */}
          <div className="gen-section gen-section-grow">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the visual change you want..."
              className="gen-prompt"
            />
          </div>

          {error && <div className="gen-error">{error}</div>}

          {/* Generate Button at bottom */}
          <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="gen-button gen-button-full">
            {isGenerating ? <><span className="auth-spinner" /> Generating...</> : <>Generate ✦ {creditCost}</>}
          </button>
        </div>

        {/* Right Main Area */}
        <div className="gen-main-area">
          <div className="gen-canvas">
            {!isGenerating && !result && (
              <div className="gen-canvas-empty">
                <span className="gen-canvas-icon">✦</span>
                <p>Ready to generate</p>
                <p className="gen-canvas-hint">
                  {user ? 'Enter a prompt and click Generate' : 'Sign in to start creating'}
                </p>
              </div>
            )}
            {isGenerating && (
              <div className="gen-canvas-loading">
                <div className="gen-loading-pulse" />
                <p>Creating your vision...</p>
              </div>
            )}
            {result && result.status === 'completed' && result.result_url && (
              <div className="gen-canvas-result">
                {result.mode === 'video' ? (
                  <video src={result.result_url} controls autoPlay loop className="gen-result-media" />
                ) : (
                  <img src={result.result_url} alt={result.prompt} className="gen-result-media" />
                )}
                <div className="gen-result-overlay">
                  <span className="gen-result-prompt">{result.prompt}</span>
                </div>
              </div>
            )}
          </div>

          <div className="gen-tabs-container">
            <div className="gen-tabs">
              <button className={`gen-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
              <button className={`gen-tab ${tab === 'how' ? 'active' : ''}`} onClick={() => setTab('how')}>How it works</button>
            </div>
            
            <div className="gen-tab-content">
              {tab === 'history' && (
                <div className="gen-history-grid">
                  {history.length === 0 && <p className="history-empty">No generations yet.</p>}
                  {history.map(gen => (
                    <div key={gen.id} className="history-card">
                      <div className="history-thumb-wrapper">
                        {gen.result_url ? (
                          gen.mode === 'video' ? <video src={gen.result_url} /> : <img src={gen.result_url} />
                        ) : <div className="history-placeholder" />}
                        <span className={`status-badge status-${gen.status}`}>{gen.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'how' && (
                <div className="how-steps">
                  <div className="how-step"><span className="how-icon">✏️</span><p>Add Prompt</p></div>
                  <div className="how-divider" />
                  <div className="how-step"><span className="how-icon">🧠</span><p>Choose Model</p></div>
                  <div className="how-divider" />
                  <div className="how-step"><span className="how-icon">🎬</span><p>Get Video</p></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {authMode && <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;

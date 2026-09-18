import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { provider, type GenerationMode, type GenerationResult } from './lib/GenerationProvider';
import { AI_MODELS, ASPECT_RATIOS, type AspectRatio } from './lib/constants';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { GalleryPage } from './pages/GalleryPage';
import { GenerationDetailPage } from './pages/GenerationDetailPage';

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
  if (generationMatch) {
    return (
      <AppShell navigate={navigate} activeTab="gallery">
        <GenerationDetailPage generationId={generationMatch[1]} onNavigate={navigate} />
      </AppShell>
    );
  }
  // Default: generation page
  return <AppShell navigate={navigate} activeTab="create"><GenerationPage /></AppShell>;
}

function AppShell({ children, navigate, activeTab }: {
  children: React.ReactNode;
  navigate: (hash: string) => void;
  activeTab: 'create' | 'gallery';
}) {
  const [showAuth, setShowAuth] = useState(false);

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
            onClick={() => navigate('#/')}
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
        <UserMenu onLoginClick={() => setShowAuth(true)} />
      </nav>

      <main className="main-content">
        {children}
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

function GenerationPage() {
  const { user, credits, refreshCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenerationMode>('video');
  const [selectedModel, setSelectedModel] = useState('seedance-2.5');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Filter models by current mode
  const availableModels = AI_MODELS.filter((m) => m.type === mode);
  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);
  const creditCost = currentModel?.creditCost ?? 45;

  // When mode changes, pick the first model of that type
  useEffect(() => {
    const firstModel = AI_MODELS.find((m) => m.type === mode);
    if (firstModel) setSelectedModel(firstModel.id);
  }, [mode]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!user) {
      setShowAuth(true);
      return;
    }

    if (credits < creditCost) {
      setError('Insufficient credits');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setError('');

    try {
      const res = await provider.generate(prompt, mode, user.id, {
        model: selectedModel,
        aspectRatio,
      });
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
        {/* Controls Panel */}
        <div className="gen-controls">
          {/* Mode Toggle */}
          <div className="gen-section">
            <label className="gen-label">Mode</label>
            <div className="mode-toggle">
              <button
                onClick={() => setMode('video')}
                className={`mode-btn ${mode === 'video' ? 'mode-btn-active' : ''}`}
              >
                🎬 Video
              </button>
              <button
                onClick={() => setMode('image')}
                className={`mode-btn ${mode === 'image' ? 'mode-btn-active' : ''}`}
              >
                🖼 Image
              </button>
            </div>
          </div>

          {/* Model Selector */}
          <div className="gen-section">
            <label className="gen-label">Model</label>
            <div className="model-selector">
              <button
                className="model-selected"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
              >
                <span>{currentModel?.name ?? selectedModel}</span>
                {currentModel?.badge && (
                  <span className={`model-badge model-badge-${currentModel.badge.toLowerCase()}`}>
                    {currentModel.badge}
                  </span>
                )}
                <span className="model-arrow">▾</span>
              </button>
              {showModelDropdown && (
                <div className="model-dropdown">
                  {availableModels.map((m) => (
                    <button
                      key={m.id}
                      className={`model-option ${m.id === selectedModel ? 'model-option-active' : ''}`}
                      onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }}
                    >
                      <span>{m.name}</span>
                      {m.badge && (
                        <span className={`model-badge model-badge-${m.badge.toLowerCase()}`}>
                          {m.badge}
                        </span>
                      )}
                      <span className="model-option-cost">⚡{m.creditCost}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="gen-section">
            <label className="gen-label">Aspect Ratio</label>
            <div className="pill-group">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  className={`pill ${aspectRatio === ratio ? 'pill-active' : ''}`}
                  onClick={() => setAspectRatio(ratio)}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="gen-section gen-section-grow">
            <label className="gen-label">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'video'
                ? 'Describe the visual change you want — e.g., "Make it snow" or "Add dramatic lighting"'
                : 'Describe the scene you imagine...'}
              className="gen-prompt"
            />
          </div>

          {/* Error */}
          {error && <div className="gen-error">{error}</div>}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="gen-button"
          >
            {isGenerating ? (
              <>
                <span className="auth-spinner" />
                Generating...
              </>
            ) : (
              <>Generate ✦ {creditCost}</>
            )}
          </button>
        </div>

        {/* Result Panel */}
        <div className="gen-canvas">
          {!isGenerating && !result && (
            <div className="gen-canvas-empty">
              <span className="gen-canvas-icon">✦</span>
              <p>Ready to generate</p>
              <p className="gen-canvas-hint">
                {user
                  ? 'Enter a prompt and click Generate'
                  : 'Sign in to start creating'}
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
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
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

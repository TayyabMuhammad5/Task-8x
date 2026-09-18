import { UserMenu } from '../components/UserMenu';
import { AuthModal } from '../components/AuthModal';
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';

export function LandingPage({ onNavigate }: { onNavigate: (hash: string) => void }) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      onNavigate('#/create');
    }
  }, [user, onNavigate]);

  return (
    <div className="landing-page">
      <nav className="top-nav">
        <div className="nav-logo">
          <span className="nav-logo-icon">✦</span>
          <span className="nav-logo-text">Higgsfield</span>
        </div>
        <UserMenu 
          onLoginClick={() => setAuthMode('signin')} 
          onSignupClick={() => setAuthMode('signup')} 
        />
      </nav>

      <main className="hero-container">
        <div className="hero-glow"></div>
        <h1 className="hero-title">Endless new visions.<br/>One upload in.</h1>
        <p className="hero-subtitle">
          Create stunning videos and images with state-of-the-art AI models. Build games, motion graphics, and interactive experiences with Higgsfield.
        </p>
        <button className="btn-primary hero-cta" onClick={() => onNavigate('#/create')}>
          Start Creating ✦
        </button>
      </main>

      {authMode && (
        <AuthModal 
          initialMode={authMode} 
          onClose={() => setAuthMode(null)} 
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { fetchGenerations, type GenerationResult } from '../lib/GenerationProvider';

interface GalleryPageProps {
  onNavigate: (route: string) => void;
}

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  const [generations, setGenerations] = useState<GenerationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    try {
      const data = await fetchGenerations();
      setGenerations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load generations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="gallery-page">
        <h2 className="page-title">Your Generations</h2>
        <div className="gallery-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="gallery-card skeleton shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-page">
        <h2 className="page-title">Your Generations</h2>
        <div className="gallery-empty">
          <span className="gallery-empty-icon">⚠</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="gallery-page">
        <h2 className="page-title">Your Generations</h2>
        <div className="gallery-empty">
          <span className="gallery-empty-icon">✦</span>
          <p>No generations yet</p>
          <button className="btn-primary" onClick={() => onNavigate('#/')}>
            Create your first one
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h2 className="page-title">Your Generations</h2>
        <span className="gallery-count">{generations.length} total</span>
      </div>
      <div className="gallery-grid">
        {generations.map((gen) => (
          <button
            key={gen.id}
            className="gallery-card"
            onClick={() => onNavigate(`#/generations/${gen.id}`)}
          >
            <div className="gallery-card-media">
              {gen.status === 'pending' ? (
                <div className="gallery-card-pending">
                  <span className="pulse-dot" />
                  Generating...
                </div>
              ) : gen.status === 'failed' ? (
                <div className="gallery-card-failed">Failed</div>
              ) : gen.result_url ? (
                gen.mode === 'video' ? (
                  <video
                    src={gen.result_url}
                    className="gallery-card-thumb"
                    muted
                    loop
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                ) : (
                  <img src={gen.result_url} alt={gen.prompt} className="gallery-card-thumb" />
                )
              ) : null}

              <div className="gallery-card-badge">
                <span className={`status-badge status-${gen.status}`}>
                  {gen.status}
                </span>
              </div>
            </div>

            <div className="gallery-card-info">
              <p className="gallery-card-prompt">{gen.prompt}</p>
              <div className="gallery-card-meta">
                <span className="gallery-card-model">{gen.model}</span>
                <span className="gallery-card-mode">{gen.mode === 'video' ? '🎬' : '🖼'}</span>
                <span className="gallery-card-cost">⚡{gen.credit_cost}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { fetchGenerations, type GenerationResult } from '../lib/GenerationProvider';

interface GalleryPageProps {
  onNavigate: (route: string) => void;
}

function getRelativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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
        <div className="gallery-empty-state">
          <span className="gallery-empty-icon">✦</span>
          <h3>No generations yet</h3>
          <p>Create your first video or image to see it here.</p>
          <button className="btn-primary" onClick={() => onNavigate('#/create')}>
            Start Creating ✦
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
                {gen.status === 'completed' && <span className="status-badge status-completed">✓ Completed</span>}
                {gen.status === 'failed' && <span className="status-badge status-failed">⚠ Failed</span>}
              </div>
            </div>

            <div className="gallery-card-info">
              <p className="gallery-card-prompt">
                {gen.prompt.length > 60 ? gen.prompt.slice(0, 60) + '...' : gen.prompt}
              </p>
              <div className="gallery-card-meta">
                <span className="gallery-card-model">{gen.model}</span>
                <span className="gallery-card-mode">{gen.mode === 'video' ? '🎬' : '🖼'}</span>
                <span className="gallery-card-time">{getRelativeTime(gen.created_at)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

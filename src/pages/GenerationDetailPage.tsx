import { useState, useEffect } from 'react';
import { fetchGeneration, type GenerationResult } from '../lib/GenerationProvider';

interface GenerationDetailPageProps {
  generationId: string;
  onNavigate: (route: string) => void;
}

export function GenerationDetailPage({ generationId, onNavigate }: GenerationDetailPageProps) {
  const [generation, setGeneration] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeneration(generationId).then((data) => {
      setGeneration(data);
      setLoading(false);
    });
  }, [generationId]);

  if (loading) {
    return (
      <div className="detail-page">
        <div className="detail-media skeleton shimmer" />
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="detail-page">
        <div className="gallery-empty">
          <span className="gallery-empty-icon">🔍</span>
          <p>Generation not found</p>
          <button className="btn-primary" onClick={() => onNavigate('#/gallery')}>
            Back to gallery
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(generation.created_at).toLocaleString();

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => onNavigate('#/gallery')}>
        ← Back to gallery
      </button>

      <div className="detail-content">
        <div className="detail-media-container">
          {generation.status === 'pending' ? (
            <div className="detail-pending">
              <span className="pulse-dot" />
              <p>Still generating...</p>
            </div>
          ) : generation.status === 'failed' ? (
            <div className="detail-failed">
              <p>Generation failed</p>
            </div>
          ) : generation.result_url ? (
            generation.mode === 'video' ? (
              <video
                src={generation.result_url}
                controls
                autoPlay
                loop
                className="detail-media"
              />
            ) : (
              <img
                src={generation.result_url}
                alt={generation.prompt}
                className="detail-media"
              />
            )
          ) : null}
        </div>

        <div className="detail-info">
          <h2 className="detail-prompt">{generation.prompt}</h2>

          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <span className="detail-meta-label">Model</span>
              <span className="detail-meta-value">{generation.model}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Mode</span>
              <span className="detail-meta-value">{generation.mode === 'video' ? '🎬 Video' : '🖼 Image'}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Aspect Ratio</span>
              <span className="detail-meta-value">{generation.aspect_ratio}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Credits Used</span>
              <span className="detail-meta-value">⚡ {generation.credit_cost}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Status</span>
              <span className={`status-badge status-${generation.status}`}>{generation.status}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Created</span>
              <span className="detail-meta-value">{formattedDate}</span>
            </div>
          </div>

          {generation.result_url && generation.status === 'completed' && (
            <a
              href={generation.result_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary detail-download"
            >
              ↓ Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

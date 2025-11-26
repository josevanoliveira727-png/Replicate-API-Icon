import { useState } from 'react';
import { GeneratedIcon } from '../types';
import './IconCard.css';

interface IconCardProps {
  icon?: GeneratedIcon;
  loading: boolean;
  index: number;
}

export const IconCard = ({ icon, loading, index }: IconCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const downloadIcon = async () => {
    if (!icon) return;

    try {
      const response = await fetch(icon.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `icon-${icon.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading icon:', error);
    }
  };

  if (loading) {
    return (
      <div className="icon-card loading">
        <div className="icon-card-content">
          <div className="skeleton-image">
            <div className="loading-spinner" />
            <p className="loading-text">Generating icon {index + 1}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!icon) {
    return (
      <div className="icon-card empty">
        <div className="icon-card-content">
          <div className="empty-slot">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
              <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <p>Icon {index + 1}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="icon-card">
      <div className="icon-card-content">
        <div className="icon-image-wrapper">
          {!imageLoaded && (
            <div className="image-loading">
              <div className="loading-spinner" />
            </div>
          )}
          <img
            src={icon.url}
            alt={`Icon ${index + 1}`}
            className={`icon-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        
        <div className="icon-card-actions">
          <button
            className="btn-download"
            onClick={downloadIcon}
            title="Download as PNG"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 11.25L6 8.25M9 11.25L12 8.25M9 11.25V3.75M15.75 11.25V13.5C15.75 13.8978 15.592 14.2794 15.3107 14.5607C15.0294 14.842 14.6478 15 14.25 15H3.75C3.35218 15 2.97064 14.842 2.68934 14.5607C2.40804 14.2794 2.25 13.8978 2.25 13.5V11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download PNG
          </button>
        </div>
      </div>
      
      <div className="icon-card-footer">
        <span className="icon-number">Icon {index + 1}</span>
      </div>
    </div>
  );
}


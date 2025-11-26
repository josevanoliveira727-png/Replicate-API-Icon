import { GeneratedIcon } from '../types';
import { IconCard } from './IconCard.tsx';
import './IconGrid.css';

interface IconGridProps {
  icons: GeneratedIcon[];
  loading: boolean;
}

export const IconGrid = ({ icons, loading }: IconGridProps) => {
  const downloadAll = async () => {
    for (const icon of icons) {
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
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Error downloading icon:', error);
      }
    }
  };

  return (
    <div className="icon-grid-container">
      <div className="icon-grid-header">
        <h2 className="icon-grid-title">Generated Icons</h2>
        {icons.length === 4 && !loading && (
          <button className="btn-download-all" onClick={downloadAll}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 13L6 9M10 13L14 9M10 13V3M17 13V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download All
          </button>
        )}
      </div>
      
      <div className="icon-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <IconCard
            key={index}
            icon={icons[index]}
            loading={loading && !icons[index]}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export default IconGrid;

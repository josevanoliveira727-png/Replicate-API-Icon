import { useState } from 'react';
import { PresetStyle, GeneratedIcon } from '../types';
import { generateImage } from '../services/api';
import IconForm from './IconForm.tsx';
import IconGrid from './IconGrid.tsx';
import './IconGenerator.css';

export const IconGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<GeneratedIcon[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const generateIcons = async (prompt: string, style: PresetStyle, colors: string[]) => {
    setLoading(true);
    setError(null);
    setIcons([]);
    setProgress({ current: 0, total: 4 });

    try {
      const generatedIcons: GeneratedIcon[] = [];
      
      // Build style prompt enhancement
      const stylePrompts: Record<PresetStyle, string> = {
        'Sticker': 'as a single sticker design with bold outlines and vibrant colors, one item only',
        'Pastels': 'in soft pastel colors with gentle gradients, one single item only',
        'Business': 'in a professional corporate style with clean lines, one single item only',
        'Cartoon': 'as a single cartoon illustration with playful style, one item only',
        '3D Model': 'as a single detailed 3D rendered object, one item only',
        'Gradient': 'with smooth gradient colors and minimalist design, one single item only',
      };

      const styleEnhancement = stylePrompts[style];
      
      // Color enhancement
      const colorEnhancement = colors.length > 0 
        ? ` using color palette: ${colors.join(', ')}`
        : '';

      // Generate 4 icons sequentially with delay to avoid rate limits
      for (let i = 0; i < 4; i++) {
        setProgress({ current: i, total: 4 });
        
        // Create prompt for SINGLE item icon with STRICT requirements
        const iconPrompt = `ONE single ${prompt} icon only ${styleEnhancement}${colorEnhancement}, ONLY ONE object, simple flat icon, isolated on transparent background, NO multiple items, NO collections, just one single item, vector style, clean, minimalist, professional icon design, transparent PNG, centered, no shadows, no background, THERE SHOULD BE ONLY ONE ICON IN THE IMAGE THAT YOU GENERATED. NOT MULTIPLE OR EVEN ICON PACK`;
        
        try {
          const result = await generateImage({
            prompt: iconPrompt,
            size: '1024x1024',
            quality: 'hd',
            style: 'vivid',
          });

          generatedIcons.push({
            id: result.id,
            url: result.imageUrl,
            prompt: result.revisedPrompt || iconPrompt,
          });

          setIcons([...generatedIcons]);
          
          // Add delay between requests to avoid rate limiting (except after last icon)
          if (i < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          }
        } catch (err: any) {
          // Check if it's a rate limit error
          if (err.message && err.message.includes('429')) {
            throw new Error('Replicate API rate limit exceeded. Please wait a moment and try again. The free tier allows 6 requests per minute.');
          }
          throw err;
        }
      }

      setProgress({ current: 4, total: 4 });
    } catch (err) {
      console.error('Error generating icons:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate icons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="icon-generator">
      <IconForm 
        onGenerate={generateIcons} 
        loading={loading}
        progress={progress}
      />
      
      {error && (
        <div className="error-message">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 6V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {icons.length > 0 && (
        <IconGrid icons={icons} loading={loading} />
      )}
    </div>
    </>
  );
}

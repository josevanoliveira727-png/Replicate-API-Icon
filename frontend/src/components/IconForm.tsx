import { useState, FormEvent } from 'react';
import { PresetStyle } from '../types';
import './IconForm.css';

const PRESET_STYLES: PresetStyle[] = [
  'Sticker',
  'Pastels',
  'Business',
  'Cartoon',
  '3D Model',
  'Gradient',
];

interface IconFormProps {
  onGenerate: (prompt: string, style: PresetStyle, colors: string[]) => void;
  loading: boolean;
  progress: { current: number; total: number };
}

export const IconForm = ({ onGenerate, loading, progress }: IconFormProps) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<PresetStyle>('Sticker');
  const [colorInputs, setColorInputs] = useState<string[]>(['']);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      return;
    }

    const validColors = colorInputs
      .filter((color: string) => /^#[0-9A-Fa-f]{6}$/.test(color));

    onGenerate(prompt.trim(), style, validColors);
  };

  const addColorInput = () => {
    if (colorInputs.length < 4) {
      setColorInputs([...colorInputs, '']);
    }
  };

  const removeColorInput = (index: number) => {
    setColorInputs(colorInputs.filter((_: string, i: number) => i !== index));
  };

  const updateColor = (index: number, value: string) => {
    const newColors = [...colorInputs];
    newColors[index] = value;
    setColorInputs(newColors);
  };

  return (
    <form className="icon-form" onSubmit={handleSubmit}>
      <div className="form-card">
        <div className="form-group">
          <label htmlFor="prompt" className="form-label">
            Icon Set Prompt
            <span className="required">*</span>
          </label>
          <input
            id="prompt"
            type="text"
            className="form-input"
            placeholder="e.g., Hockey equipment, Office supplies, Cooking utensils..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            required
            maxLength={200}
          />
          <p className="form-hint">
            Describe the theme for your 4-icon set
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="style" className="form-label">
            Preset Style
            <span className="required">*</span>
          </label>
          <div className="style-grid">
            {PRESET_STYLES.map((styleOption) => (
              <label
                key={styleOption}
                className={`style-card ${style === styleOption ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="style"
                  value={styleOption}
                  checked={style === styleOption}
                  onChange={(e) => setStyle(e.target.value as PresetStyle)}
                  disabled={loading}
                />
                <span className="style-name">{styleOption}</span>
                <div className="style-check">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Brand Colors
            <span className="optional">(Optional)</span>
          </label>
          <div className="color-inputs">
            {colorInputs.map((color: string, index: number) => (
              <div key={index} className="color-input-group">
                <input
                  type="color"
                  className="color-picker"
                  value={color || '#6366f1'}
                  onChange={(e) => updateColor(index, e.target.value)}
                  disabled={loading}
                />
                <input
                  type="text"
                  className="color-text-input"
                  placeholder="#000000"
                  value={color}
                  onChange={(e) => updateColor(index, e.target.value)}
                  disabled={loading}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  maxLength={7}
                />
                {colorInputs.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-color"
                    onClick={() => removeColorInput(index)}
                    disabled={loading}
                    aria-label="Remove color"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {colorInputs.length < 4 && (
            <button
              type="button"
              className="btn-add-color"
              onClick={addColorInput}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Color
            </button>
          )}
          <p className="form-hint">
            Add up to 4 brand colors to guide the palette
          </p>
        </div>

        <button
          type="submit"
          className="btn-generate"
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <>
              <div className="spinner" />
              Generating... ({progress.current}/{progress.total})
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V17M17 10H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Generate 4 Icons
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default IconForm;

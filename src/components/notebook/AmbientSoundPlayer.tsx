/**
 * AmbientSoundPlayer Component
 * 
 * Audio player for background music and ambient sounds.
 * Provides volume control, enable/disable toggle, and sound selection.
 * Persists user preferences.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import './AmbientSoundPlayer.css';

/**
 * Available ambient sounds
 */
export const AMBIENT_SOUNDS = {
  rain: {
    name: '雨声',
    url: '/sounds/rain.mp3',
    icon: '🌧️',
  },
  cafe: {
    name: '咖啡馆',
    url: '/sounds/cafe.mp3',
    icon: '☕',
  },
  forest: {
    name: '森林',
    url: '/sounds/forest.mp3',
    icon: '🌲',
  },
  ocean: {
    name: '海浪',
    url: '/sounds/ocean.mp3',
    icon: '🌊',
  },
  fireplace: {
    name: '壁炉',
    url: '/sounds/fireplace.mp3',
    icon: '🔥',
  },
} as const;

export type SoundKey = keyof typeof AMBIENT_SOUNDS;

/**
 * AmbientSoundPlayer component props
 */
export interface AmbientSoundPlayerProps {
  /** Optional className for additional styling */
  className?: string;
}

/**
 * AmbientSoundPlayer component provides ambient sound controls
 * 
 * @example
 * ```tsx
 * <AmbientSoundPlayer />
 * ```
 */
export const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({
  className = '',
}) => {
  const { 
    ambientSoundEnabled, 
    ambientSoundVolume, 
    setAmbientSound 
  } = useUIStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSound, setCurrentSound] = useState<SoundKey | null>(null);

  const enabled = ambientSoundEnabled;
  const volume = ambientSoundVolume;

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio when sound changes
  useEffect(() => {
    if (!audioRef.current || !currentSound) return;

    const sound = AMBIENT_SOUNDS[currentSound as SoundKey];
    if (sound) {
      audioRef.current.src = sound.url;
      if (enabled) {
        audioRef.current.play().catch(err => {
          console.error('Failed to play ambient sound:', err);
        });
      }
    }
  }, [currentSound, enabled]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play/pause based on enabled state
  useEffect(() => {
    if (!audioRef.current) return;

    if (enabled && currentSound) {
      audioRef.current.play().catch(err => {
        console.error('Failed to play ambient sound:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [enabled, currentSound]);

  // Toggle enabled
  const handleToggle = () => {
    setAmbientSound(!enabled, volume);
  };

  // Change volume
  const handleVolumeChange = (newVolume: number) => {
    setAmbientSound(enabled, newVolume);
  };

  // Select sound
  const handleSoundSelect = (soundKey: SoundKey) => {
    setCurrentSound(soundKey);
    setAmbientSound(true, volume); // Auto-enable when selecting a sound
    setIsExpanded(false);
  };

  const currentSoundData = currentSound ? AMBIENT_SOUNDS[currentSound as SoundKey] : null;

  return (
    <div className={`ambient-sound-player ${className}`}>
      {/* Toggle button */}
      <button
        className={`ambient-sound-player__toggle ${enabled ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label={enabled ? '关闭环境音效' : '开启环境音效'}
        title={enabled ? '关闭环境音效' : '开启环境音效'}
      >
        {enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* Expand button */}
      <button
        className="ambient-sound-player__expand"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="环境音效设置"
        title="环境音效设置"
      >
        <Music size={20} />
        {currentSoundData && (
          <span className="ambient-sound-player__current-icon">
            {currentSoundData.icon}
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="ambient-sound-player__panel">
          {/* Sound selection */}
          <div className="ambient-sound-player__sounds">
            <h3 className="ambient-sound-player__title">选择环境音效</h3>
            <div className="ambient-sound-player__sound-grid">
              {(Object.keys(AMBIENT_SOUNDS) as SoundKey[]).map((key) => {
                const sound = AMBIENT_SOUNDS[key];
                return (
                  <button
                    key={key}
                    className={`ambient-sound-player__sound-button ${
                      currentSound === key ? 'active' : ''
                    }`}
                    onClick={() => handleSoundSelect(key)}
                    aria-label={sound.name}
                    aria-pressed={currentSound === key}
                  >
                    <span className="ambient-sound-player__sound-icon">
                      {sound.icon}
                    </span>
                    <span className="ambient-sound-player__sound-name">
                      {sound.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume control */}
          <div className="ambient-sound-player__volume">
            <label htmlFor="ambient-volume" className="ambient-sound-player__volume-label">
              音量: {Math.round(volume * 100)}%
            </label>
            <input
              id="ambient-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="ambient-sound-player__volume-slider"
              disabled={!enabled}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbientSoundPlayer;

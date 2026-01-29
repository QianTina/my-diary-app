/**
 * PaperBackground Component Usage Examples
 * 
 * This file demonstrates how to use the PaperBackground component
 * with different paper styles.
 */

import React from 'react';
import { PaperBackground } from './PaperBackground';
import type { PaperStyle } from '../../types/notebook';

/**
 * Example: Basic usage with different paper styles
 */
export const PaperBackgroundExamples: React.FC = () => {
  const paperStyles: PaperStyle[] = ['blank', 'lined', 'grid', 'dotted', 'vintage'];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
      {paperStyles.map((style) => (
        <div
          key={style}
          style={{
            position: 'relative',
            width: '300px',
            height: '400px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <PaperBackground paperStyle={style} />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '20px',
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              lineHeight: '1.6',
            }}
          >
            <h3 style={{ marginTop: 0 }}>{style.charAt(0).toUpperCase() + style.slice(1)} Paper</h3>
            <p>
              This is an example of {style} paper style. The background pattern is rendered
              using SVG with a subtle paper texture overlay.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Example: Using PaperBackground in a diary entry page
 */
export const DiaryPageExample: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        height: '600px',
        margin: '0 auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <PaperBackground paperStyle="lined" />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '40px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>My Diary Entry</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>January 15, 2024</p>
        <div style={{ fontSize: '16px', lineHeight: '32px' }}>
          <p>
            Today was a wonderful day. I woke up early and went for a walk in the park.
            The morning air was crisp and refreshing.
          </p>
          <p>
            I spent the afternoon reading a fascinating book about the history of paper
            and writing. It's amazing how much our methods of recording thoughts have
            evolved over the centuries.
          </p>
          <p>
            In the evening, I reflected on my goals for the year. I want to write more
            consistently in this diary and capture the small moments that make life special.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Responsive usage
 */
export const ResponsivePaperExample: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <PaperBackground paperStyle="vintage" />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        <h1>Responsive Paper Background</h1>
        <p>
          This example demonstrates how the PaperBackground component fills its container
          and responds to different viewport sizes. Try resizing your browser window!
        </p>
      </div>
    </div>
  );
};

export default PaperBackgroundExamples;

# Notebook Components

This directory contains React components for the paper-style diary notebook feature.

## PaperBackground Component

The `PaperBackground` component renders realistic paper background patterns with texture overlays for the diary notebook interface.

### Features

- **Multiple Paper Styles**: Supports 5 different paper styles:
  - `blank` - Clean white paper with no pattern
  - `lined` - Horizontal ruled lines (32px spacing)
  - `grid` - Square grid pattern (24px cells)
  - `dotted` - Dot grid pattern (20px spacing)
  - `vintage` - Aged paper with warm tones and subtle lines

- **Paper Texture Overlay**: Subtle texture effect for realistic paper appearance
- **Responsive Design**: Automatically fills container and adapts to viewport size
- **Accessibility**: Supports high contrast mode and reduced motion preferences
- **Print-Friendly**: Optimized styles for printing

### Usage

```tsx
import { PaperBackground } from './components/notebook';

function DiaryPage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <PaperBackground paperStyle="lined" />
      <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        {/* Your content here */}
        <h1>My Diary Entry</h1>
        <p>Content goes here...</p>
      </div>
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `paperStyle` | `PaperStyle` | Yes | The paper style to render: 'blank', 'lined', 'grid', 'dotted', or 'vintage' |
| `className` | `string` | No | Optional additional CSS class names |

### Implementation Details

- **SVG Patterns**: Uses SVG `<pattern>` elements for scalable, crisp patterns
- **CSS Positioning**: Uses absolute positioning to fill container
- **Z-Index**: Background is set to `z-index: 0` to stay behind content
- **Pointer Events**: Disabled to allow interaction with content above

### Styling

The component uses CSS classes for styling:

- `.paper-background` - Main container
- `.paper-background--{style}` - Style-specific modifiers
- `.paper-background__pattern` - SVG pattern container
- `.paper-background__texture` - Texture overlay

You can override styles by passing a custom `className` prop.

### Accessibility

- Texture overlay has `aria-hidden="true"` as it's purely decorative
- Supports `prefers-contrast: high` media query
- Supports `prefers-reduced-motion: reduce` media query
- Print styles remove texture for cleaner output

### Requirements Validation

This component validates the following requirements from the design document:

- **Requirement 3.1**: System provides five paper style options
- **Requirement 3.4**: System renders appropriate paper texture and pattern

### Examples

See `PaperBackground.example.tsx` for complete usage examples including:
- Basic usage with all paper styles
- Integration in a diary entry page
- Responsive layout examples

### Browser Support

- Modern browsers with SVG support
- CSS Grid and Flexbox support
- CSS custom properties support

### Performance

- Lightweight SVG patterns (no external images)
- CSS-only texture overlay
- No JavaScript animations or calculations
- Optimized for 60fps rendering

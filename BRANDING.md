# SpotlessClean Branding Guidelines

## Overview
SpotlessClean uses the Vintage Paper design system with warm, professional colors that convey trust, reliability, and established expertise in dry cleaning services.

## Color Palette

### Primary Brand Color: Amber
- **Amber 900** (`#451A03`): Primary text, headings, key UI elements
- **Amber 800** (`#78350F`): Secondary text, borders
- **Amber 700** (`#92400E`): Buttons, interactive elements
- **Amber 600** (`#B45309`): Hover states
- **Amber 50-200**: Light backgrounds, subtle accents

### Neutral Colors
- **White** (`#FFFFFF`): Primary background
- **Light Gray** (`#F5F5F4`): Secondary background
- **Warm Gray** (`#78716B`): Tertiary text

### Status Colors
- **Pending**: Amber (#FBBF24)
- **In Progress**: Blue (#60A5FA)
- **Ready for Pickup**: Green (#4ADE80)
- **Picked Up**: Gray (#D1D5DB)
- **Completed**: Amber (#F59E0B)
- **Cancelled**: Red (#EF4444)

## Typography

### Font Families
- **Display/Headings**: Geist (Sans)
- **Body Text**: Geist (Sans)
- **Code**: Geist Mono

### Font Sizes
- **Headlines (H1)**: 48px, Bold
- **Headlines (H2)**: 36px, Bold
- **Headlines (H3)**: 30px, Semibold
- **Body Large**: 18px, Normal
- **Body**: 16px, Normal
- **Body Small**: 14px, Normal
- **Caption**: 12px, Normal

## Logo

The SpotlessClean logo features:
- A clothing hanger with rounded, professional lines
- A water droplet symbolizing the cleaning process
- Circular badge border representing quality and care
- Uses the amber brand color (currently text-amber-900)
- Scales responsively from 24px to 48px+

### Logo Usage
- **Navigation Bar**: 32px size
- **Homepage Hero**: 48px size
- **Favicon**: 32px size
- **Print Materials**: 72px+ for clarity

## Component Styling

### Buttons
- **Primary**: Amber 700 background, white text
- **Outline**: Amber 300 border, Amber 700 text
- **Hover**: Amber 800 background

### Cards
- **Border**: Amber 200
- **Background**: White
- **Shadow**: Light (md shadow on hover)

### Input Fields
- **Background**: Amber 50
- **Border**: Amber 300
- **Text**: Amber 900
- **Focus**: Ring 2, Amber 600

### Badges/Status
- **Background**: Respective status color (with opacity)
- **Text**: Corresponding darker shade
- **Border**: None

## Spacing Scale
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **2XL**: 48px

## Border Radius
- **Small**: 4px
- **Medium**: 8px (default for cards)
- **Large**: 12px
- **Full**: 9999px (for buttons, badges)

## Accessibility

- Maintain contrast ratio of at least 4.5:1 for text
- Use semantic HTML and ARIA labels
- Status should never rely on color alone; use text labels
- Ensure clickable elements are at least 44px x 44px
- Use screen-reader-only text where necessary

## Implementation

All branding values are centralized in `/lib/branding.ts` for consistency and easy maintenance. When building components:

1. Import colors from Tailwind CSS classes (e.g., `bg-amber-700`)
2. Reference typography scales for consistent sizing
3. Use the branding file for programmatic color access when needed

This ensures a cohesive, professional appearance across the entire SpotlessClean platform.

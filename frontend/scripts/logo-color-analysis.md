
# Logo Color Analysis Report
Generated: 2025-12-30T20:42:30.336Z
Logo: "Mãi Cho Hành Tinh Xanh"

## Analyzed Colors
- primary: #2E7D32
- primaryLight: #4CAF50
- primaryBright: #66BB6A
- accent: #8BC34A
- dark: #1B5E20
- white: #FFFFFF

## Tailwind Config Colors

// ============================================
// TAILWIND CONFIG - Brand Colors (from logo)
// Generated from: "Mãi Cho Hành Tinh Xanh" logo
// ============================================

brand: {
  50: '#ECF8ED',
  100: '#DAF1DB',
  200: '#B5E3B7',
  300: '#8FD693',
  400: '#6AC86F',
  500: '#2E7D32',  // Primary - #2E7D32
  600: '#3EA843',  // Hover
  700: '#348D39',
  800: '#29702D',
  900: '#1C4A1E',
},

accent: {
  DEFAULT: 'hsl(var(--accent))',
  foreground: 'hsl(var(--accent-foreground))',
  400: '#9CCC66',
  500: '#8BC34A',  // Accent - #8BC34A
  600: '#77AC39',
},


## CSS Variables

/* ============================================ */
/* CSS VARIABLES - LIGHT THEME (from logo)      */
/* Generated from: "Mãi Cho Hành Tinh Xanh"     */
/* Fresh, clean, nature-inspired design         */
/* ============================================ */

:root {
  /* Background - Clean white/light */
  --background: 0 0% 100%;        /* Pure white */
  --foreground: 120 10% 15%;      /* Dark green-gray text */
  
  /* Card backgrounds */
  --card: 120 20% 98%;            /* Very light green tint */
  --card-foreground: 120 10% 15%;
  
  /* Popover */
  --popover: 0 0% 100%;
  --popover-foreground: 120 10% 15%;
  
  /* Primary Green from logo */
  --primary: 122 39% 49%;
  --primary-foreground: 0 0% 100%;  /* White text on green */
  
  /* Secondary - Light gray-green */
  --secondary: 120 10% 96%;
  --secondary-foreground: 120 10% 20%;
  
  /* Muted */
  --muted: 120 10% 95%;
  --muted-foreground: 120 5% 45%;
  
  /* Accent Lime from logo */
  --accent: 88 50% 53%;
  --accent-foreground: 0 0% 100%;
  
  /* Destructive */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  
  /* Border & Input */
  --border: 120 10% 90%;
  --input: 120 10% 90%;
  --ring: 122 39% 49%;
  
  --radius: 0.75rem;
}

/* Remove dark mode overrides - Light theme only */


## Box Shadows

// ============================================
// BOX SHADOWS - Neon Glow Effects (from logo)
// ============================================

boxShadow: {
  'neon': '0 0 20px rgba(76, 175, 80, 0.5), 0 0 40px rgba(76, 175, 80, 0.3)',
  'neon-pink': '0 0 20px rgba(139, 195, 74, 0.5), 0 0 40px rgba(139, 195, 74, 0.3)',
  'glow': '0 0 15px rgba(76, 175, 80, 0.4)',
  'glow-lg': '0 0 30px rgba(76, 175, 80, 0.5)',
},


## Gradients

// ============================================
// GRADIENTS - LIGHT THEME (from logo colors)
// ============================================

backgroundImage: {
  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  // Light theme hero gradient
  'hero-gradient': 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(232,245,233,0.5) 50%, rgba(200,230,201,0.8) 100%)',
  // Light card gradient
  'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(232,245,233,0.95) 100%)',
  // Green neon glow
  'neon-glow': 'linear-gradient(90deg, #4CAF50, #8BC34A, #4CAF50)',
},


## Particles CSS

/* ============================================ */
/* PARTICLES BACKGROUND - LIGHT THEME           */
/* Subtle green accents on white background     */
/* ============================================ */

body {
  background: linear-gradient(180deg, #FFFFFF 0%, #F0FFF4 50%, #E8F5E9 100%);
  min-height: 100vh;
}

.particles-bg::before {
  background-image:
    radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 195, 74, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(76, 175, 80, 0.04) 0%, transparent 70%);
}


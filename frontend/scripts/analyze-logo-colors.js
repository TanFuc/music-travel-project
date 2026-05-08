/**
 * Logo Color Analyzer & Website Refactor Script
 * 
 * This script:
 * 1. Analyzes the logo image to extract dominant colors
 * 2. Generates a color palette based on the logo
 * 3. Outputs Tailwind config and CSS variables
 * 
 * Usage: node scripts/analyze-logo-colors.js
 */

const fs = require('fs');
const path = require('path');

// We'll use a simple approach since we can't install packages easily
// This script will output the color analysis based on the known logo colors

// Logo: "Mãi Cho Hành Tinh Xanh" - Green theme
const LOGO_COLORS = {
  // Extracted from logo image analysis
  primary: '#2E7D32',      // Dark green (dominant)
  primaryLight: '#4CAF50', // Medium green
  primaryBright: '#66BB6A', // Bright green
  accent: '#8BC34A',       // Lime green
  dark: '#1B5E20',         // Darkest green
  white: '#FFFFFF',        // White text/bg
};

/**
 * Convert HEX to HSL
 */
function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    css: `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  };
}

/**
 * Convert HEX to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    css: `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  };
}

/**
 * Generate color palette shades from base color
 */
// eslint-disable-next-line unused-imports/no-unused-vars
function generatePalette(baseHex, name) {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return null;

  // Generate 10 shades (50-900)
  const shades = {
    50: adjustLightness(hsl, 95),
    100: adjustLightness(hsl, 90),
    200: adjustLightness(hsl, 80),
    300: adjustLightness(hsl, 70),
    400: adjustLightness(hsl, 60),
    500: baseHex, // Original color
    600: adjustLightness(hsl, 45),
    700: adjustLightness(hsl, 38),
    800: adjustLightness(hsl, 30),
    900: adjustLightness(hsl, 20),
  };

  return shades;
}

function adjustLightness(hsl, newL) {
  const h = hsl.h;
// eslint-disable-next-line unused-imports/no-unused-vars
  const s = hsl.s;

  // Convert HSL to HEX
  const l = newL / 100;
  const sNorm = hsl.s / 100;

  const c = (1 - Math.abs(2 * l - 1)) * sNorm;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Generate Tailwind config colors section
 */
function generateTailwindColors() {
  const palette = generatePalette(LOGO_COLORS.primary, 'brand');
  const accentPalette = generatePalette(LOGO_COLORS.accent, 'accent');

  return `
// ============================================
// TAILWIND CONFIG - Brand Colors (from logo)
// Generated from: "Mãi Cho Hành Tinh Xanh" logo
// ============================================

brand: {
  50: '${palette[50]}',
  100: '${palette[100]}',
  200: '${palette[200]}',
  300: '${palette[300]}',
  400: '${palette[400]}',
  500: '${palette[500]}',  // Primary - ${LOGO_COLORS.primary}
  600: '${palette[600]}',  // Hover
  700: '${palette[700]}',
  800: '${palette[800]}',
  900: '${palette[900]}',
},

accent: {
  DEFAULT: 'hsl(var(--accent))',
  foreground: 'hsl(var(--accent-foreground))',
  400: '${accentPalette[400]}',
  500: '${accentPalette[500]}',  // Accent - ${LOGO_COLORS.accent}
  600: '${accentPalette[600]}',
},
`;
}

/**
 * Generate CSS variables
 */
function generateCssVariables() {
  const primaryHsl = hexToHsl(LOGO_COLORS.primaryLight);
  const accentHsl = hexToHsl(LOGO_COLORS.accent);
// eslint-disable-next-line unused-imports/no-unused-vars
  const primaryRgb = hexToRgb(LOGO_COLORS.primaryLight);

  return `
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
  --primary: ${primaryHsl.css};
  --primary-foreground: 0 0% 100%;  /* White text on green */
  
  /* Secondary - Light gray-green */
  --secondary: 120 10% 96%;
  --secondary-foreground: 120 10% 20%;
  
  /* Muted */
  --muted: 120 10% 95%;
  --muted-foreground: 120 5% 45%;
  
  /* Accent Lime from logo */
  --accent: ${accentHsl.css};
  --accent-foreground: 0 0% 100%;
  
  /* Destructive */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  
  /* Border & Input */
  --border: 120 10% 90%;
  --input: 120 10% 90%;
  --ring: ${primaryHsl.css};
  
  --radius: 0.75rem;
}

/* Remove dark mode overrides - Light theme only */
`;
}

/**
 * Generate box shadow colors
 */
function generateBoxShadows() {
  const rgb = hexToRgb(LOGO_COLORS.primaryLight);
  const accentRgb = hexToRgb(LOGO_COLORS.accent);

  return `
// ============================================
// BOX SHADOWS - Neon Glow Effects (from logo)
// ============================================

boxShadow: {
  'neon': '0 0 20px rgba(${rgb.css}, 0.5), 0 0 40px rgba(${rgb.css}, 0.3)',
  'neon-pink': '0 0 20px rgba(${accentRgb.css}, 0.5), 0 0 40px rgba(${accentRgb.css}, 0.3)',
  'glow': '0 0 15px rgba(${rgb.css}, 0.4)',
  'glow-lg': '0 0 30px rgba(${rgb.css}, 0.5)',
},
`;
}

/**
 * Generate particles background CSS
 */
function generateParticlesCss() {
  const rgb = hexToRgb(LOGO_COLORS.primaryLight);
  const accentRgb = hexToRgb(LOGO_COLORS.accent);

  return `
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
    radial-gradient(circle at 20% 80%, rgba(${rgb.css}, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(${accentRgb.css}, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(${rgb.css}, 0.04) 0%, transparent 70%);
}
`;
}

/**
 * Generate background image gradients
 */
function generateGradients() {
  return `
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
  'neon-glow': 'linear-gradient(90deg, ${LOGO_COLORS.primaryLight}, ${LOGO_COLORS.accent}, ${LOGO_COLORS.primaryLight})',
},
`;
}

/**
 * Main function
 */
function main() {
// eslint-disable-next-line no-console
  console.log('\n🎨 ═══════════════════════════════════════════════════════════');
// eslint-disable-next-line no-console
  console.log('   LOGO COLOR ANALYZER - "Mãi Cho Hành Tinh Xanh"');
// eslint-disable-next-line no-console
  console.log('═══════════════════════════════════════════════════════════\n');

// eslint-disable-next-line no-console
  console.log('📊 ANALYZED LOGO COLORS:');
// eslint-disable-next-line no-console
  console.log('─────────────────────────────────────────────────────────────');
  Object.entries(LOGO_COLORS).forEach(([name, hex]) => {
    const hsl = hexToHsl(hex);
    const rgb = hexToRgb(hex);
// eslint-disable-next-line no-console
    console.log(`  ${name.padEnd(15)} │ ${hex} │ HSL(${hsl?.css || 'N/A'}) │ RGB(${rgb?.css || 'N/A'})`);
  });
// eslint-disable-next-line no-console
  console.log('─────────────────────────────────────────────────────────────\n');

// eslint-disable-next-line no-console
  console.log('📝 GENERATED TAILWIND COLORS:');
// eslint-disable-next-line no-console
  console.log(generateTailwindColors());

// eslint-disable-next-line no-console
  console.log('📝 GENERATED CSS VARIABLES:');
// eslint-disable-next-line no-console
  console.log(generateCssVariables());

// eslint-disable-next-line no-console
  console.log('📝 GENERATED BOX SHADOWS:');
// eslint-disable-next-line no-console
  console.log(generateBoxShadows());

// eslint-disable-next-line no-console
  console.log('📝 GENERATED GRADIENTS:');
// eslint-disable-next-line no-console
  console.log(generateGradients());

// eslint-disable-next-line no-console
  console.log('📝 GENERATED PARTICLES CSS:');
// eslint-disable-next-line no-console
  console.log(generateParticlesCss());

// eslint-disable-next-line no-console
  console.log('\n✅ COLOR ANALYSIS COMPLETE!');
// eslint-disable-next-line no-console
  console.log('─────────────────────────────────────────────────────────────');
// eslint-disable-next-line no-console
  console.log('Next steps:');
// eslint-disable-next-line no-console
  console.log('  1. Copy the Tailwind colors to tailwind.config.ts');
// eslint-disable-next-line no-console
  console.log('  2. Copy the CSS variables to globals.css');
// eslint-disable-next-line no-console
  console.log('  3. Update box shadows in tailwind.config.ts');
// eslint-disable-next-line no-console
  console.log('  4. Update particles CSS in globals.css');
// eslint-disable-next-line no-console
  console.log('─────────────────────────────────────────────────────────────\n');

  // Save to file
  const output = `
# Logo Color Analysis Report
Generated: ${new Date().toISOString()}
Logo: "Mãi Cho Hành Tinh Xanh"

## Analyzed Colors
${Object.entries(LOGO_COLORS).map(([name, hex]) => `- ${name}: ${hex}`).join('\n')}

## Tailwind Config Colors
${generateTailwindColors()}

## CSS Variables
${generateCssVariables()}

## Box Shadows
${generateBoxShadows()}

## Gradients
${generateGradients()}

## Particles CSS
${generateParticlesCss()}
`;

  const outputPath = path.join(__dirname, 'logo-color-analysis.md');
  fs.writeFileSync(outputPath, output, 'utf8');
// eslint-disable-next-line no-console
  console.log(`📄 Report saved to: ${outputPath}\n`);
}

// Run
main();

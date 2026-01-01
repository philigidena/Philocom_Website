# Hero Background Image - Nano Banana Pro Prompt

## 🎨 Custom Hero Background for Philocom

**Recommended Dimensions:** 3840x2160 (4K Ultra HD)
**Aspect Ratio:** 16:9
**Format:** PNG or JPG

---

## 📝 Nano Banana Pro Prompt

```
Create a premium abstract tech background for a technology company hero section.
Ultra-wide 16:9 format, 4K resolution.

Visual Style:
- Pure black (#000000) base background
- Animated glowing grid lines in cyan (#22D3EE) and blue (#3B82F6)
- Subtle gradient accents transitioning from cyan to blue to purple
- Minimalist geometric patterns with depth
- Futuristic tech aesthetic inspired by AWWWARDS designs
- Professional, clean, and modern

Technical Elements:
- Glowing circuit-like grid patterns
- Hexagonal or triangular mesh overlays
- Particle effects suggesting data flow
- Subtle light rays or beams
- Depth of field with bokeh effects in cyan/blue
- Very subtle lens flares

Lighting:
- Low-key lighting with strategic highlights
- Cyan and blue glows emanating from grid intersections
- Soft gradient vignette from edges
- Minimal purple accent in far background

Mood:
- High-tech and professional
- Clean and premium
- Futuristic but not sci-fi
- Corporate yet innovative
- Sophisticated and elegant

Color Palette (strictly limited to):
- Black: #000000 (dominant - 70%)
- Cyan: #22D3EE (accent - 20%)
- Blue: #3B82F6 (accent - 8%)
- Purple: #A855F7 (subtle - 2%)

Composition:
- Central focus area where text will overlay
- Darker in center, glowing elements on edges
- Asymmetrical balance
- Rule of thirds applied
- Space for large title text in center

DO NOT include:
- Any text or typography
- Recognizable objects or icons
- Bright white highlights
- Rainbow colors
- Busy or cluttered patterns
- Stock photo elements
```

---

## Alternative Prompt (Cleaner Version)

```
Ultra-wide 4K abstract technology background, pure black base with glowing cyan and blue grid lines,
minimalist geometric patterns, futuristic corporate aesthetic, low-key lighting with strategic cyan glows,
hexagonal mesh overlay, particle data flow effects, subtle purple gradient in background,
professional AWWWARDS-inspired design, clean center area for text overlay,
color palette: black 70%, cyan #22D3EE 20%, blue #3B82F6 8%, purple #A855F7 2%,
no text, no icons, sophisticated and premium
```

---

## Alternative Prompt (Grid Focus)

```
Create a premium black background with animated glowing grid overlay for tech company hero section.
4K ultra-wide 16:9 format.

Style: Minimalist futuristic grid with glowing intersections, pure black (#000000) background,
cyan (#22D3EE) and blue (#3B82F6) glowing grid lines forming perspective depth,
subtle purple (#A855F7) gradient in far background, clean geometric patterns,
hexagonal or square grid with varying opacity, brightest glows at grid intersections,
particle effects suggesting data transmission along grid lines,
professional corporate aesthetic inspired by top AWWWARDS websites,
center area darker for text overlay, edges with more glow intensity,
depth of field effect, subtle lens flares at grid nodes,
high-tech but clean and not busy, sophisticated and premium look.

NO text, NO icons, NO bright white, NO rainbow colors.
```

---

## 🎯 Key Requirements

1. **Resolution:** 3840x2160 (4K) or higher
2. **Format:** PNG (preferred for transparency) or high-quality JPG
3. **Color Profile:** sRGB for web
4. **File Size:** Optimize to under 500KB for web performance
5. **Focal Point:** Center should be slightly darker for text overlay
6. **Grid Lines:** Should have subtle animation potential (varying opacity)

---

## 📐 Usage Instructions

Once generated, place the image in:
```
c:\Users\ASUS\Desktop\Philocom\public\hero-background.png
```

Then update `Hero.jsx` (line 78-88) to use this image:

```jsx
{/* Hero Background Image */}
<div className="absolute inset-0 opacity-30">
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: 'url(/hero-background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  />
</div>
```

Adjust opacity (currently 30%) as needed:
- 20% = Very subtle
- 30% = Subtle (recommended)
- 40% = Medium visibility
- 50% = High visibility

---

## 🔄 Alternative Design Ideas

If you want to try different styles, here are variations:

### Option 1: Circuit Board Style
```
Futuristic circuit board pattern on pure black, glowing cyan and blue circuit traces,
minimal purple accents, 4K ultra-wide, AWWWARDS premium aesthetic, clean center area
```

### Option 2: Particle Field
```
Black background with floating cyan and blue particles forming a grid-like constellation,
depth of field, glowing connections between particles, minimal purple in distance, 4K 16:9
```

### Option 3: Abstract Waves
```
Black background with abstract glowing wave patterns in cyan and blue,
minimal geometric overlays, premium tech aesthetic, clean composition, 4K ultra-wide
```

---

## 💡 Tips for Best Results

1. **Generate Multiple Versions:** Create 3-4 variations and choose the best
2. **Test Readability:** Make sure white text remains readable over the image
3. **Optimize File Size:** Use TinyPNG or similar to reduce file size without quality loss
4. **Check Responsive:** Image should look good on mobile (vertical crop)
5. **Animation Ready:** Choose design with elements that could animate (grid lines, particles)

---

**Created:** 2024-12-31
**For:** Philocom Portfolio Website
**Section:** Hero Background
**Tool:** Nano Banana Pro

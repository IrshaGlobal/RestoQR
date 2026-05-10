# 🎨 Premium Design System - Quick Reference

## Color Palette

### Backgrounds
```css
Light Mode:  #F5F1EB (warm cream)
Dark Mode:   #141210 (deep charcoal)
Surface:     #FFFFFF (pure white cards)
Secondary:   #F0EDE8 (slightly darker cream)
```

### Text Colors
```css
Primary:     #0A0A0A (deep black)
Secondary:   #5A554B (warm gray)
Muted:       #8A857B (subtle hints)
```

### Semantic Colors
```css
Accent:      #C47A3D (warm amber/gold) - Primary actions
Success:     #2D6A4F (forest green) - Completed states
Warning:     #F59E0B (amber) - In-progress, attention
Info:        #64748B (blue-gray) - Informational
Error:       #DC2626 (refined red) - Errors, destructive
```

### Borders
```css
Light Mode:  #E2DDD5 (warm neutral)
Dark Mode:   #332F2C (subtle separation)
Hover:       Use semantic colors at 30-50% opacity
```

---

## Typography

### Font Families
```css
Headings:    'Space Grotesk', sans-serif
Body:        'Inter', sans-serif
Numbers:     'Space Grotesk' (for prominence)
```

### Font Weights
```css
Bold:        700 (headings, important numbers)
Semibold:    600 (buttons, labels)
Medium:      500 (secondary text)
Regular:     400 (body text)
```

### Text Sizes
```css
Display:     text-3xl to text-4xl (order numbers)
Heading:     text-2xl (section titles)
Subheading:  text-xl (card titles)
Body:        text-sm to text-base (main content)
Small:       text-xs (metadata, labels)
```

---

## Components

### Buttons
```tsx
// Primary Action
<Button variant="default" size="icon">
  Accent background, white text
</Button>

// Secondary Action
<Button variant="outline" size="sm">
  Transparent with border, hover fills
</Button>

// Destructive
<Button variant="destructive" size="icon">
  Error red background
</Button>

// Ghost (minimal)
<Button variant="ghost" size="icon">
  No background, hover shows bg-secondary
</Button>
```

**Key Properties:**
- Sharp corners (no rounded classes)
- Minimum height: 44px (accessibility)
- Font weight: semibold (600)
- Transition: duration-200

### Cards
```tsx
<Card className="border shadow-sm rounded-none">
  // Light: bg-white border-[#E2DDD5]
  // Dark: bg-card border-[#332F2C]
</Card>
```

**Key Properties:**
- No border radius (rounded-none)
- Subtle shadow (shadow-sm)
- Clean borders (no double borders)
- White/cream backgrounds

### Badges
```tsx
<Badge variant="default">  // Primary color
<Badge variant="success">  // Green
<Badge variant="warning">  // Amber
<Badge variant="info">     // Blue-gray
```

**Note:** Badges keep rounded-full (appropriate for pills)

---

## Spacing Scale

Use Tailwind's standard spacing:
```
p-2 = 8px   (tight)
p-4 = 16px  (standard)
p-6 = 24px  (generous)
p-8 = 32px  (spacious)

gap-2 = 8px
gap-3 = 12px
gap-4 = 16px
```

---

## Shadows

```css
shadow-xs   // Very subtle (inputs)
shadow-sm   // Standard (cards)
shadow-md   // Elevated (dropdowns)
shadow-lg   // Modal/overlay
```

**Avoid:** Large colored shadows, glows, multiple shadows

---

## Borders

### Width
```css
border      // 1px (standard)
border-2    // 2px (only for emphasis)
```

### Style
```css
// Standard
border border-[#E2DDD5]         // Light mode
border border-[#332F2C]         // Dark mode

// Semantic (with opacity)
border-success/30               // 30% opacity
border-accent/50                // 50% opacity
```

**Never use:** Double borders, neon colors, thick borders (>2px)

---

## Common Patterns

### Status Indicators
```tsx
// Top bar on cards
<div className="h-1 bg-info" />        // New
<div className="h-1 bg-warning" />     // Preparing
<div className="h-1 bg-success" />     // Ready
```

### Icon Containers
```tsx
<div className="h-10 w-10 flex items-center justify-center bg-accent/10">
  <Icon className="w-5 h-5 text-accent" />
</div>
```

### Section Dividers
```tsx
<div className="border-t border-[#E2DDD5]" />  // Light
<div className="border-t border-[#332F2C]" />  // Dark
```

### Empty States
```tsx
<Card className="p-16 text-center">
  <div className="h-20 w-20 mx-auto mb-6 bg-bg-secondary">
    <Icon className="w-10 h-10 text-text-muted" />
  </div>
  <h3 className="text-xl font-bold mb-3">Title</h3>
  <p className="text-sm text-text-secondary">Description</p>
</Card>
```

---

## Dark Mode Classes

Use conditional classes based on `isDark` state:

```tsx
// Backgrounds
${isDark ? 'bg-[#141210]' : 'bg-[#F5F1EB]'}
${isDark ? 'bg-card' : 'bg-white'}

// Text
${isDark ? 'text-text-primary' : 'text-text-primary'}
${isDark ? 'text-text-secondary' : 'text-text-secondary'}
${isDark ? 'text-text-muted' : 'text-text-muted'}

// Borders
${isDark ? 'border-[#332F2C]' : 'border-[#E2DDD5]'}

// Hover states
${isDark ? 'hover:bg-bg-secondary' : 'hover:bg-bg-secondary'}
```

---

## What to Avoid ❌

### Colors
- ❌ Neon colors (#00F0FF, #FF006E, #00FF88)
- ❌ Pure black (#000000) or pure white (#FFFFFF) backgrounds
- ❌ Low contrast text (white/40, black/30)
- ❌ Multiple competing accent colors

### Effects
- ❌ Backdrop blur / glassmorphism
- ❌ Gradient backgrounds
- ❌ Glowing shadows
- ❌ Scanlines, noise textures, grid overlays

### Typography
- ❌ Monospace fonts for body text
- ❌ All uppercase (except short labels)
- ❌ Excessive letter-spacing
- ❌ Everything bold/black weight

### Shapes
- ❌ Rounded corners (use sharp/none)
- ❌ Mixed border radius in same component
- ❌ Thick borders (>2px)
- ❌ Double borders

---

## Accessibility Checklist ✅

- [ ] Text contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Touch targets minimum 44px height
- [ ] Focus indicators visible
- [ ] Color not sole indicator (add icons/text)
- [ ] Font sizes readable (minimum 12px)
- [ ] Interactive elements clearly identifiable

---

## Quick Wins for New Pages

When creating new pages/components:

1. **Start with Card wrapper**
   ```tsx
   <Card className="border shadow-sm rounded-none">
   ```

2. **Use semantic colors**
   ```tsx
   bg-accent, text-success, border-warning
   ```

3. **Apply typography hierarchy**
   ```tsx
   <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
   <p className="text-sm text-text-secondary">
   ```

4. **Sharp corners everywhere**
   ```tsx
   rounded-none (default)
   ```

5. **Consistent spacing**
   ```tsx
   p-4 or p-6 for padding
   gap-3 or gap-4 for gaps
   ```

---

## Testing Your Implementation

### Visual Check
1. Does it look clean and uncluttered?
2. Are colors from the approved palette?
3. Is typography consistent (Space Grotesk + Inter)?
4. Are all corners sharp (no rounded-xl, rounded-2xl)?

### Accessibility Check
1. Can you read all text easily?
2. Do buttons have enough contrast?
3. Are interactive elements obvious?
4. Does it work in both light and dark mode?

### Consistency Check
1. Does it match CustomerMenu aesthetic?
2. Does it match StaffDashboard styling?
3. Would it look out of place next to other pages?

---

## Need Help?

Reference these files:
- `src/styles/unified-design-system.css` - All design tokens
- `src/pages/CustomerMenu.tsx` - Gold standard example
- `src/pages/StaffDashboard.tsx` - Updated implementation
- `IMPLEMENTATION-COMPLETE.md` - Full documentation

---

**Remember:** When in doubt, ask "Would this look appropriate in a high-end restaurant?" If yes, you're on the right track! 🍽️✨

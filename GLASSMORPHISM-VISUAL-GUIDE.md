# Glassmorphism Admin Dashboard - Visual Guide

## 🎨 Color Palette

### Primary Colors (Light Mode)
```
Primary Blue:    #2563EB  (hsl(221 83% 53%))
Accent Purple:   #7C3AED  (hsl(262 83% 58%))
Info Sky:        #0EA5E9  (hsl(199 89% 48%))
Success Green:   #059669  (hsl(142 76% 36%))
Warning Amber:   #F59E0B  (hsl(38 92% 50%))
Destructive Red: #DC2626  (hsl(0 84% 60%))
```

### Background Colors
```
Background:      #F8FAFC  (hsl(210 40% 98%))
Card Surface:    rgba(255, 255, 255, 0.7) with blur
Muted:           #F1F5F9  (hsl(210 40% 96%))
```

### Text Colors
```
Foreground:      #0F172A  (hsl(222 47% 11%))
Muted:           #64748B  (hsl(215 16% 47%))
```

---

## ✨ Glass Effects

### Glass Card
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 8px 32px rgba(37, 99, 235, 0.15);
border-radius: 12px;
```

### Glass Premium (Enhanced)
```css
background: linear-gradient(
  135deg, 
  rgba(255, 255, 255, 0.8), 
  rgba(255, 255, 255, 0.4)
);
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 
  0 8px 32px rgba(37, 99, 235, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.4);
border-radius: 12px;
```

---

## 🌈 Gradients

### Primary Gradient (Buttons, Active States)
```css
background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
```

### Gradient Text (Headings)
```css
background: linear-gradient(
  135deg, 
  #2563EB 0%, 
  #7C3AED 50%, 
  #0EA5E9 100%
);
background-size: 200% auto;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
animation: gradient-shift 3s ease infinite;
```

### Icon Background Gradients
```css
/* Info Icon */
background: linear-gradient(135deg, 
  rgba(14, 165, 233, 0.2), 
  rgba(14, 165, 233, 0.1)
);

/* Success Icon */
background: linear-gradient(135deg, 
  rgba(5, 150, 105, 0.2), 
  rgba(5, 150, 105, 0.1)
);

/* Warning Icon */
background: linear-gradient(135deg, 
  rgba(245, 158, 11, 0.2), 
  rgba(245, 158, 11, 0.1)
);
```

### Mesh Background
```css
background-image: 
  radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.15) 0px, transparent 50%),
  radial-gradient(at 100% 0%, rgba(124, 58, 237, 0.15) 0px, transparent 50%),
  radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.15) 0px, transparent 50%),
  radial-gradient(at 0% 100%, rgba(5, 150, 105, 0.15) 0px, transparent 50%);
background-attachment: fixed;
```

---

## 🎭 Shadow System

### Elevation Levels
```css
/* Small - Subtle lift */
box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);

/* Medium - Card default */
box-shadow: 
  0 4px 6px -1px rgba(15, 23, 42, 0.1),
  0 2px 4px -2px rgba(15, 23, 42, 0.1);

/* Large - Hover state */
box-shadow: 
  0 10px 15px -3px rgba(15, 23, 42, 0.1),
  0 4px 6px -4px rgba(15, 23, 42, 0.1);

/* XL - Prominent elements */
box-shadow: 
  0 20px 25px -5px rgba(15, 23, 42, 0.1),
  0 8px 10px -6px rgba(15, 23, 42, 0.1);

/* Glass - Colored glow */
box-shadow: 0 8px 32px rgba(37, 99, 235, 0.15);
```

---

## 🎬 Animations

### Transition Timing Functions
```css
/* Smooth - Most UI elements */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Bounce - Playful interactions */
transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Spring - Button presses */
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Keyframe Animations

#### Fade In
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Slide Up
```css
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

#### Gradient Shift
```css
@keyframes gradient-shift {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}
```

---

## 📐 Border Radius System

```
rounded-lg:   0.5rem  (8px)   - Small elements
rounded-xl:   0.75rem (12px)  - Default (buttons, inputs, cards)
rounded-2xl:  1rem    (16px)  - Dialogs, modals
rounded-3xl:  1.5rem  (24px)  - Large containers
```

---

## 🔤 Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Weights
```
Regular:    400
Medium:     500
Semibold:   600
Bold:       700
```

### Heading Styles
```css
/* Section Title */
font-size: 1.875rem (30px) / 2.25rem (36px)
font-weight: 700
background: linear-gradient(...)
-webkit-background-clip: text
-webkit-text-fill-color: transparent

/* Card Title */
font-size: 1.125rem (18px)
font-weight: 600
color: hsl(222 47% 11%)
```

---

## 🎯 Component Examples

### Metric Card
```tsx
<Card className="glass-premium group">
  <CardContent>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Orders Today</p>
        <p className="text-3xl font-bold gradient-text-premium">42</p>
      </div>
      <div className="metric-card-icon bg-gradient-to-br from-info/20 to-info/10 group-hover:scale-110 transition-transform">
        <ShoppingCart className="w-6 h-6 text-info" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Action Button
```tsx
<Button className="bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] rounded-xl">
  Add Menu Item
</Button>
```

### Input Field
```tsx
<Input 
  className="rounded-xl border border-input bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
  placeholder="Enter item name..."
/>
```

### Sidebar Item
```tsx
<button className="sidebar-item sidebar-item-active">
  <LayoutDashboard className="w-5 h-5" />
  <span>Dashboard</span>
</button>

/* CSS */
.sidebar-item-active {
  background: linear-gradient(to right, 
    rgba(37, 99, 235, 0.2), 
    rgba(124, 58, 237, 0.2)
  );
  color: #2563EB;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(37, 99, 235, 0.2);
}
```

---

## 🌓 Dark Mode Adjustments

### Background
```css
.dark {
  --background: 222 47% 8%;  /* #0F172A */
  --card: 222 47% 11%;       /* #1E293B */
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

### Enhanced Shadows
```css
.dark {
  --shadow-glass: 0 8px 32px rgba(59, 130, 246, 0.2);
}
```

### Brighter Accents
```css
.dark {
  --primary: 217 91% 60%;    /* #3B82F6 */
  --accent: 263 70% 65%;     /* #8B5CF6 */
}
```

---

## 📱 Responsive Breakpoints

```
Mobile:   < 640px   (sm)
Tablet:   640px+    (md)
Desktop:  1024px+   (lg)
Large:    1280px+   (xl)
XLarge:   1536px+   (2xl)
```

### Mobile Optimizations
- Bottom navigation with glass effect
- Larger touch targets (min 44px)
- Stacked layouts
- Simplified shadows for performance

---

## 🎨 Status Indicators

### Badge Variants
```css
/* Success */
background: rgba(5, 150, 105, 0.1);
color: #059669;
border: 1px solid rgba(5, 150, 105, 0.2);

/* Warning */
background: rgba(245, 158, 11, 0.1);
color: #F59E0B;
border: 1px solid rgba(245, 158, 11, 0.2);

/* Destructive */
background: rgba(220, 38, 38, 0.1);
color: #DC2626;
border: 1px solid rgba(220, 38, 38, 0.2);

/* Info */
background: rgba(14, 165, 233, 0.1);
color: #0EA5E9;
border: 1px solid rgba(14, 165, 233, 0.2);
```

---

## 🔍 Hover State Patterns

### Cards
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1);
}
```

### Buttons
```css
.button:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1);
}

.button:active {
  transform: scale(0.98);
}
```

### Icons
```css
.icon-container:hover {
  transform: scale(1.1);
}
```

---

## 🎪 Special Effects

### Pulse Animation (Notifications)
```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Shimmer Loading
```css
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(241, 245, 249, 0.25) 25%,
    rgba(226, 232, 240, 0.5) 50%,
    rgba(241, 245, 249, 0.25) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

---

## 🎯 Accessibility Features

### Focus States
```css
*:focus-visible {
  outline: none;
  ring: 2px solid rgba(37, 99, 235, 0.5);
  ring-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 2px solid rgba(0, 0, 0, 0.3);
  }
}
```

---

This visual guide provides all the design tokens, patterns, and examples needed to maintain consistency across the glassmorphism admin dashboard.

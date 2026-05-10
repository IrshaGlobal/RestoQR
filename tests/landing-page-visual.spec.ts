import { test, expect } from '@playwright/test';

test('Landing Page Visual Analysis', async ({ page }) => {
  // Navigate to landing page
  await page.goto('http://localhost:5174/');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Allow animations to settle
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'visual-analysis/landing-page-full.png',
    fullPage: true 
  });
  
  // Check hero section visibility
  const heroSection = await page.locator('section').first();
  await heroSection.screenshot({ 
    path: 'visual-analysis/landing-hero-section.png' 
  });
  
  // Check bento grid cards
  const bentoCards = await page.locator('.glass-premium, .glass-card');
  const cardCount = await bentoCards.count();
  console.log(`Found ${cardCount} glass cards`);
  
  // Screenshot first few cards individually
  for (let i = 0; i < Math.min(3, cardCount); i++) {
    await bentoCards.nth(i).screenshot({ 
      path: `visual-analysis/landing-card-${i + 1}.png` 
    });
  }
  
  // Check pricing section
  const pricingSection = await page.locator('#pricing');
  if (await pricingSection.isVisible()) {
    await pricingSection.screenshot({ 
      path: 'visual-analysis/landing-pricing-section.png' 
    });
  }
  
  // Check text contrast - sample some key text elements
  const headings = await page.locator('h1, h2, h3');
  const headingCount = await headings.count();
  
  console.log('\n=== VISUAL ANALYSIS REPORT ===\n');
  console.log(`Total headings found: ${headingCount}`);
  console.log(`Total glass cards: ${cardCount}`);
  
  // Check for potential contrast issues
  const mutedTextElements = await page.locator('.text-muted-foreground');
  const mutedCount = await mutedTextElements.count();
  console.log(`Muted foreground elements: ${mutedCount}`);
  
  // Get computed styles for key elements
  const heroTitle = await page.locator('h1').first();
  const titleStyle = await heroTitle.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      backgroundColor: style.backgroundColor
    };
  });
  
  console.log('\nHero Title Styles:', titleStyle);
  
  // Check badge visibility
  const badges = await page.locator('[class*="Badge"]');
  const badgeCount = await badges.count();
  console.log(`Badges found: ${badgeCount}`);
  
  // Analyze button visibility
  const buttons = await page.locator('button, [role="button"]');
  const buttonCount = await buttons.count();
  console.log(`Buttons found: ${buttonCount}`);
  
  // Check navigation
  const navLinks = await page.locator('nav a');
  const navCount = await navLinks.count();
  console.log(`Navigation links: ${navCount}`);
  
  console.log('\n=== END REPORT ===\n');
  
  // Verify key sections are visible
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#features')).toBeVisible();
  await expect(page.locator('#pricing')).toBeVisible();
  await expect(page.locator('#testimonials')).toBeVisible();
});

test('Landing Page Color Contrast Check', async ({ page }) => {
  await page.goto('http://localhost:5174/');
  await page.waitForLoadState('networkidle');
  
  // Function to check contrast ratio
  const checkContrast = async (selector: string) => {
    const element = await page.locator(selector).first();
    if (await element.isVisible()) {
      const contrastInfo = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const parent = el.parentElement;
        const parentStyle = parent ? window.getComputedStyle(parent) : null;
        
        return {
          selector: el.tagName.toLowerCase(),
          textColor: style.color,
          bgColor: parentStyle ? parentStyle.backgroundColor : 'unknown',
          fontSize: style.fontSize,
          fontWeight: style.fontWeight
        };
      });
      return contrastInfo;
    }
    return null;
  };
  
  console.log('\n=== COLOR CONTRAST ANALYSIS ===\n');
  
  // Check critical text elements
  const elements = [
    'h1',
    '.text-muted-foreground',
    '.gradient-text',
    'nav a',
    '.glass-card h3',
    '.glass-premium h3',
    'button span',
    '.text-success',
    '.text-primary'
  ];
  
  for (const selector of elements) {
    const info = await checkContrast(selector);
    if (info) {
      console.log(`${selector}:`, info);
    }
  }
  
  console.log('\n=== END CONTRAST ANALYSIS ===\n');
});

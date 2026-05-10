import { test, expect } from '@playwright/test';

test('Visual Design Analysis - Admin Dashboard', async ({ page }) => {
  // Start the dev server URL (adjust if needed)
  await page.goto('http://localhost:5174/login');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of login page
  await page.screenshot({ 
    path: 'visual-analysis/01-login-page.png',
    fullPage: true 
  });
  
  console.log('✓ Login page screenshot captured');
  
  // Note: You'll need to manually login or use test credentials
  // For now, we'll analyze what we can see
  
  // Check color contrast ratios by examining computed styles
  const bodyBackground = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  
  console.log('Body background color:', bodyBackground);
  
  // Capture viewport screenshot
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ 
    path: 'visual-analysis/02-viewport-desktop.png',
    fullPage: false 
  });
  
  console.log('✓ Desktop viewport captured');
  
  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ 
    path: 'visual-analysis/03-viewport-mobile.png',
    fullPage: false 
  });
  
  console.log('✓ Mobile viewport captured');
  
  // Analyze CSS variables
  const cssVariables = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue('--primary').trim(),
      accent: styles.getPropertyValue('--accent').trim(),
      background: styles.getPropertyValue('--background').trim(),
      card: styles.getPropertyValue('--card').trim(),
      radius: styles.getPropertyValue('--radius').trim(),
    };
  });
  
  console.log('\n🎨 CSS Variables Analysis:');
  console.log(cssVariables);
  
  // Check for gradient usage
  const gradientElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const gradients = [];
    
    elements.forEach(el => {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg.includes('gradient')) {
        gradients.push({
          tag: el.tagName,
          class: el.className,
          gradient: bg.substring(0, 100)
        });
      }
    });
    
    return gradients.slice(0, 20); // Limit to first 20
  });
  
  console.log('\n🌈 Gradient Elements Found:', gradientElements.length);
  console.log('Sample gradients:', gradientElements.slice(0, 5));
  
  // Check border radius consistency
  const borderRadiusData = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cards = Array.from(document.querySelectorAll('[class*="card"]'));
    
    const buttonRadii = buttons.map(btn => ({
      class: btn.className.split(' ').find(c => c.includes('rounded')),
      radius: window.getComputedStyle(btn).borderRadius
    }));
    
    const cardRadii = cards.map(card => ({
      class: card.className.split(' ').find(c => c.includes('rounded')),
      radius: window.getComputedStyle(card).borderRadius
    }));
    
    return { buttons: buttonRadii.slice(0, 10), cards: cardRadii.slice(0, 10) };
  });
  
  console.log('\n📐 Border Radius Analysis:');
  console.log('Buttons:', borderRadiusData.buttons);
  console.log('Cards:', borderRadiusData.cards);
  
  // Check spacing/padding
  const spacingData = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[class*="card"]'));
    return cards.slice(0, 5).map(card => ({
      class: card.className.substring(0, 50),
      padding: window.getComputedStyle(card).padding,
      gap: window.getComputedStyle(card).gap
    }));
  });
  
  console.log('\n📏 Spacing Analysis:');
  console.log(spacingData);
  
  // Typography analysis
  const typographyData = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
    return headings.slice(0, 5).map(h => ({
      tag: h.tagName,
      text: h.textContent?.substring(0, 30),
      fontFamily: window.getComputedStyle(h).fontFamily,
      fontSize: window.getComputedStyle(h).fontSize,
      fontWeight: window.getComputedStyle(h).fontWeight,
      color: window.getComputedStyle(h).color
    }));
  });
  
  console.log('\n🔤 Typography Analysis:');
  console.log(typographyData);
  
  // Shadow analysis
  const shadowData = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[class*="card"]'));
    return cards.slice(0, 5).map(card => ({
      boxShadow: window.getComputedStyle(card).boxShadow.substring(0, 150)
    }));
  });
  
  console.log('\n💫 Shadow Analysis:');
  console.log(shadowData);
  
  console.log('\n✅ Visual analysis complete! Check visual-analysis/ folder for screenshots.');
});

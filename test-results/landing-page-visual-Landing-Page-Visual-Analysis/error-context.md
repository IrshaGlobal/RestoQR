# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing-page-visual.spec.ts >> Landing Page Visual Analysis
- Location: tests\landing-page-visual.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications alt+T"
  - link "Skip to main content" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - navigation [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - img [ref=e9]
          - generic [ref=e15]: RestoQR
        - generic [ref=e16]:
          - link "Features" [ref=e17] [cursor=pointer]:
            - /url: "#features"
          - link "How It Works" [ref=e18] [cursor=pointer]:
            - /url: "#how-it-works"
          - link "Pricing" [ref=e19] [cursor=pointer]:
            - /url: "#pricing"
          - link "Testimonials" [ref=e20] [cursor=pointer]:
            - /url: "#testimonials"
        - generic [ref=e21]:
          - link "Sign In" [ref=e22] [cursor=pointer]:
            - /url: /login
            - button "Sign In" [ref=e23]
          - link "Get Started" [ref=e24] [cursor=pointer]:
            - /url: /admin
            - button "Get Started" [ref=e25]
    - generic [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]:
          - img [ref=e31]
          - text: Modern Restaurant Management Platform
        - heading "Transform Your Restaurant with Intelligent QR Ordering" [level=1] [ref=e33]
        - paragraph [ref=e34]: Streamline operations, delight customers, and boost revenue with our all-in-one QR-based ordering system. From table scan to kitchen delivery — seamless.
        - generic [ref=e35]:
          - link "Try Live Demo" [ref=e36] [cursor=pointer]:
            - /url: /menu?table=1&restaurant=demo
            - button "Try Live Demo" [ref=e37]:
              - text: Try Live Demo
              - img [ref=e38]
          - link "Start Free Trial" [ref=e40] [cursor=pointer]:
            - /url: /admin
            - button "Start Free Trial" [ref=e41]
        - generic [ref=e42]:
          - generic [ref=e43]:
            - img [ref=e44]
            - generic [ref=e46]: No credit card required
          - generic [ref=e47]:
            - img [ref=e48]
            - generic [ref=e50]: 14-day free trial
          - generic [ref=e51]:
            - img [ref=e52]
            - generic [ref=e54]: Cancel anytime
      - generic [ref=e55]:
        - generic [ref=e56]:
          - generic [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]: Most Popular
              - heading "Real-Time Order Management" [level=3] [ref=e60]
              - paragraph [ref=e61]: Live order tracking from customer to kitchen with instant notifications
            - img [ref=e63]
          - generic [ref=e68]:
            - generic [ref=e69]:
              - generic [ref=e70]: Table 5 - New Order
              - generic [ref=e71]: Just now
            - generic [ref=e72]:
              - generic [ref=e73]: Table 12 - Preparing
              - generic [ref=e74]: 5 min ago
            - generic [ref=e75]:
              - generic [ref=e76]: Table 8 - Ready
              - generic [ref=e77]: 12 min ago
        - generic [ref=e78]:
          - img [ref=e80]
          - heading "+47%" [level=3] [ref=e83]
          - paragraph [ref=e84]: Average revenue increase
          - generic [ref=e85]:
            - generic [ref=e86]:
              - generic [ref=e87]: Faster turnover
              - generic [ref=e88]: 32%
            - generic [ref=e89]:
              - generic [ref=e90]: Order accuracy
              - generic [ref=e91]: 99.8%
        - generic [ref=e92]:
          - img [ref=e94]
          - heading "Mobile-First Design" [level=3] [ref=e96]
          - paragraph [ref=e97]: Beautiful, responsive interface optimized for all devices
          - generic [ref=e98]:
            - generic [ref=e99]: iOS
            - generic [ref=e100]: Android
            - generic [ref=e101]: Web
        - generic [ref=e102]:
          - generic [ref=e103]:
            - generic [ref=e104]:
              - heading "Powerful Analytics Dashboard" [level=3] [ref=e105]
              - paragraph [ref=e106]: Track performance, optimize menu, and make data-driven decisions
            - img [ref=e108]
          - generic [ref=e110]:
            - generic [ref=e111]:
              - paragraph [ref=e112]: "284"
              - paragraph [ref=e113]: Orders Today
            - generic [ref=e114]:
              - paragraph [ref=e115]: $4.2k
              - paragraph [ref=e116]: Revenue
            - generic [ref=e117]:
              - paragraph [ref=e118]: 4.8★
              - paragraph [ref=e119]: Rating
    - generic [ref=e121]:
      - generic [ref=e122]:
        - generic [ref=e123]: Features
        - heading "Everything You Need to Succeed" [level=2] [ref=e124]
        - paragraph [ref=e125]: A complete suite of tools designed specifically for modern restaurants
      - generic [ref=e126]:
        - generic [ref=e127]:
          - generic [ref=e128]:
            - img [ref=e130]
            - generic [ref=e136]: Core
          - heading "Instant QR Ordering" [level=3] [ref=e137]
          - paragraph [ref=e138]: Customers scan table QR codes to access menus and place orders instantly without waiting for staff.
        - generic [ref=e139]:
          - generic [ref=e140]:
            - img [ref=e142]
            - generic [ref=e144]: Popular
          - heading "Real-Time Updates" [level=3] [ref=e145]
          - paragraph [ref=e146]: Live order tracking with instant status updates from kitchen to table with push notifications.
        - generic [ref=e147]:
          - img [ref=e150]
          - heading "Smart Notifications" [level=3] [ref=e153]
          - paragraph [ref=e154]: Sound alerts and visual indicators for new orders, help requests, and status changes.
        - generic [ref=e155]:
          - img [ref=e158]
          - heading "Kitchen Display System" [level=3] [ref=e160]
          - paragraph [ref=e161]: Optimized kitchen dashboard with order queue management and preparation timers.
        - generic [ref=e162]:
          - img [ref=e165]
          - heading "Menu Management" [level=3] [ref=e170]
          - paragraph [ref=e171]: Easy admin panel to manage items, categories, prices, availability, and special offers.
        - generic [ref=e172]:
          - img [ref=e175]
          - heading "Staff Management" [level=3] [ref=e180]
          - paragraph [ref=e181]: Role-based access control with staff accounts, permissions, and performance tracking.
        - generic [ref=e182]:
          - img [ref=e185]
          - heading "Multi-Device Support" [level=3] [ref=e188]
          - paragraph [ref=e189]: Works seamlessly on smartphones, tablets, and desktops with responsive design.
        - generic [ref=e190]:
          - img [ref=e193]
          - heading "Digital Receipts" [level=3] [ref=e196]
          - paragraph [ref=e197]: Automatic receipt generation with order details, pricing, and customization options.
        - generic [ref=e198]:
          - generic [ref=e199]:
            - img [ref=e201]
            - generic [ref=e203]: Pro
          - heading "Enterprise Security" [level=3] [ref=e204]
          - paragraph [ref=e205]: Bank-level encryption, secure authentication, and role-based access control.
    - generic [ref=e207]:
      - generic [ref=e208]:
        - generic [ref=e209]: Simple Process
        - heading "How RestoQR Works" [level=2] [ref=e210]
        - paragraph [ref=e211]: Three simple steps to revolutionize your restaurant operations
      - generic [ref=e212]:
        - generic [ref=e213]:
          - img [ref=e215]
          - generic [ref=e221]: STEP 01
          - heading "Customer Scans QR Code" [level=3] [ref=e222]
          - paragraph [ref=e223]: Diners scan the unique QR code at their table using their smartphone camera
        - generic [ref=e224]:
          - img [ref=e226]
          - generic [ref=e231]: STEP 02
          - heading "Browse & Place Order" [level=3] [ref=e232]
          - paragraph [ref=e233]: View digital menu, customize items, add to cart, and submit order instantly
        - generic [ref=e234]:
          - img [ref=e236]
          - generic [ref=e239]: STEP 03
          - heading "Track & Enjoy" [level=3] [ref=e240]
          - paragraph [ref=e241]: Watch order progress in real-time from preparation to table delivery
    - generic [ref=e243]:
      - generic [ref=e244]:
        - generic [ref=e245]: Pricing
        - heading "Simple, Transparent Pricing" [level=2] [ref=e246]
        - paragraph [ref=e247]: Choose the perfect plan for your restaurant. No hidden fees, cancel anytime.
      - generic [ref=e248]:
        - generic [ref=e249]:
          - generic [ref=e250]:
            - heading "Starter" [level=3] [ref=e251]
            - paragraph [ref=e252]: Perfect for small cafes
            - generic [ref=e253]: $29/month
          - generic [ref=e254]:
            - list [ref=e255]:
              - listitem [ref=e256]:
                - img [ref=e258]
                - generic [ref=e260]: Up to 20 tables
              - listitem [ref=e261]:
                - img [ref=e263]
                - generic [ref=e265]: Basic QR ordering
              - listitem [ref=e266]:
                - img [ref=e268]
                - generic [ref=e270]: Email support
              - listitem [ref=e271]:
                - img [ref=e273]
                - generic [ref=e275]: Standard analytics
              - listitem [ref=e276]:
                - img [ref=e278]
                - generic [ref=e280]: Mobile app access
            - button "Get Started" [ref=e281] [cursor=pointer]
        - generic [ref=e282]:
          - generic [ref=e284]: Most Popular
          - generic [ref=e285]:
            - heading "Professional" [level=3] [ref=e286]
            - paragraph [ref=e287]: Ideal for growing restaurants
            - generic [ref=e288]: $79/month
          - generic [ref=e289]:
            - list [ref=e290]:
              - listitem [ref=e291]:
                - img [ref=e293]
                - generic [ref=e295]: Unlimited tables
              - listitem [ref=e296]:
                - img [ref=e298]
                - generic [ref=e300]: Advanced QR features
              - listitem [ref=e301]:
                - img [ref=e303]
                - generic [ref=e305]: Priority support 24/7
              - listitem [ref=e306]:
                - img [ref=e308]
                - generic [ref=e310]: Full analytics suite
              - listitem [ref=e311]:
                - img [ref=e313]
                - generic [ref=e315]: Kitchen display system
              - listitem [ref=e316]:
                - img [ref=e318]
                - generic [ref=e320]: Staff management
              - listitem [ref=e321]:
                - img [ref=e323]
                - generic [ref=e325]: Custom branding
            - button "Start Free Trial" [ref=e326] [cursor=pointer]
        - generic [ref=e327]:
          - generic [ref=e328]:
            - heading "Enterprise" [level=3] [ref=e329]
            - paragraph [ref=e330]: For restaurant chains
            - generic [ref=e331]: Custom
          - generic [ref=e332]:
            - list [ref=e333]:
              - listitem [ref=e334]:
                - img [ref=e336]
                - generic [ref=e338]: Everything in Pro
              - listitem [ref=e339]:
                - img [ref=e341]
                - generic [ref=e343]: Multi-location support
              - listitem [ref=e344]:
                - img [ref=e346]
                - generic [ref=e348]: Dedicated account manager
              - listitem [ref=e349]:
                - img [ref=e351]
                - generic [ref=e353]: Custom integrations
              - listitem [ref=e354]:
                - img [ref=e356]
                - generic [ref=e358]: White-label solution
              - listitem [ref=e359]:
                - img [ref=e361]
                - generic [ref=e363]: SLA guarantee
              - listitem [ref=e364]:
                - img [ref=e366]
                - generic [ref=e368]: API access
            - button "Contact Sales" [ref=e369] [cursor=pointer]
      - generic [ref=e370]:
        - paragraph [ref=e371]: All plans include a 14-day free trial
        - generic [ref=e372]:
          - generic [ref=e373]:
            - img [ref=e374]
            - generic [ref=e376]: No credit card required
          - generic [ref=e377]:
            - img [ref=e378]
            - generic [ref=e380]: Cancel anytime
    - generic [ref=e382]:
      - generic [ref=e383]:
        - generic [ref=e384]: Testimonials
        - heading "Loved by Restaurants Worldwide" [level=2] [ref=e385]
        - paragraph [ref=e386]: See what restaurant owners are saying about RestoQR
      - generic [ref=e387]:
        - generic [ref=e388]:
          - generic [ref=e389]:
            - img [ref=e390]
            - img [ref=e392]
            - img [ref=e394]
            - img [ref=e396]
            - img [ref=e398]
          - paragraph [ref=e400]: "\"RestoQR transformed our operations. We've seen a 40% increase in table turnover and customers love the convenience.\""
          - generic [ref=e401]:
            - paragraph [ref=e402]: Sarah Chen
            - paragraph [ref=e403]: Owner, Golden Dragon Bistro
        - generic [ref=e404]:
          - generic [ref=e405]:
            - img [ref=e406]
            - img [ref=e408]
            - img [ref=e410]
            - img [ref=e412]
            - img [ref=e414]
          - paragraph [ref=e416]: "\"The real-time order tracking is incredible. Our kitchen staff can now prioritize orders efficiently without any confusion.\""
          - generic [ref=e417]:
            - paragraph [ref=e418]: Michael Rodriguez
            - paragraph [ref=e419]: Manager, Bella Italia
        - generic [ref=e420]:
          - generic [ref=e421]:
            - img [ref=e422]
            - img [ref=e424]
            - img [ref=e426]
            - img [ref=e428]
            - img [ref=e430]
          - paragraph [ref=e432]: "\"Setup was incredibly easy. Within 2 hours we were fully operational. The support team is outstanding!\""
          - generic [ref=e433]:
            - paragraph [ref=e434]: Emma Thompson
            - paragraph [ref=e435]: Founder, Cafe Noir
    - generic [ref=e438]:
      - generic [ref=e439]:
        - generic [ref=e440]:
          - img [ref=e441]
          - text: Join 2,000+ Restaurants
        - heading "Ready to Transform Your Restaurant?" [level=2] [ref=e444]
        - paragraph [ref=e445]: Start your 14-day free trial today. No credit card required. Cancel anytime.
      - generic [ref=e446]:
        - link "Start Free Trial" [ref=e447] [cursor=pointer]:
          - /url: /admin
          - button "Start Free Trial" [ref=e448]:
            - text: Start Free Trial
            - img [ref=e449]
        - link "View Live Demo" [ref=e451] [cursor=pointer]:
          - /url: /menu?table=1&restaurant=demo
          - button "View Live Demo" [ref=e452]
    - contentinfo [ref=e453]:
      - generic [ref=e454]:
        - generic [ref=e455]:
          - generic [ref=e456]:
            - generic [ref=e457]:
              - img [ref=e459]
              - generic [ref=e465]: RestoQR
            - paragraph [ref=e466]: Modern QR-based ordering system for restaurants worldwide.
          - generic [ref=e467]:
            - heading "Product" [level=4] [ref=e468]
            - list [ref=e469]:
              - listitem [ref=e470]:
                - link "Features" [ref=e471] [cursor=pointer]:
                  - /url: "#features"
              - listitem [ref=e472]:
                - link "Pricing" [ref=e473] [cursor=pointer]:
                  - /url: "#pricing"
              - listitem [ref=e474]:
                - link "Demo" [ref=e475] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e476]:
                - link "Updates" [ref=e477] [cursor=pointer]:
                  - /url: "#"
          - generic [ref=e478]:
            - heading "Company" [level=4] [ref=e479]
            - list [ref=e480]:
              - listitem [ref=e481]:
                - link "About" [ref=e482] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e483]:
                - link "Blog" [ref=e484] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e485]:
                - link "Careers" [ref=e486] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e487]:
                - link "Contact" [ref=e488] [cursor=pointer]:
                  - /url: "#"
          - generic [ref=e489]:
            - heading "Support" [level=4] [ref=e490]
            - list [ref=e491]:
              - listitem [ref=e492]:
                - link "Help Center" [ref=e493] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e494]:
                - link "Documentation" [ref=e495] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e496]:
                - link "Status" [ref=e497] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e498]:
                - link "Privacy" [ref=e499] [cursor=pointer]:
                  - /url: "#"
        - generic [ref=e500]:
          - paragraph [ref=e501]: © 2026 RestoQR. All rights reserved.
          - generic [ref=e502]:
            - link "Terms" [ref=e503] [cursor=pointer]:
              - /url: "#"
            - link "Privacy" [ref=e504] [cursor=pointer]:
              - /url: "#"
            - link "Cookies" [ref=e505] [cursor=pointer]:
              - /url: "#"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test('Landing Page Visual Analysis', async ({ page }) => {
  4   |   // Navigate to landing page
  5   |   await page.goto('http://localhost:5174/');
  6   |   
  7   |   // Wait for page to fully load
> 8   |   await page.waitForLoadState('networkidle');
      |              ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  9   |   await page.waitForTimeout(2000); // Allow animations to settle
  10  |   
  11  |   // Take full page screenshot
  12  |   await page.screenshot({ 
  13  |     path: 'visual-analysis/landing-page-full.png',
  14  |     fullPage: true 
  15  |   });
  16  |   
  17  |   // Check hero section visibility
  18  |   const heroSection = await page.locator('section').first();
  19  |   await heroSection.screenshot({ 
  20  |     path: 'visual-analysis/landing-hero-section.png' 
  21  |   });
  22  |   
  23  |   // Check bento grid cards
  24  |   const bentoCards = await page.locator('.glass-premium, .glass-card');
  25  |   const cardCount = await bentoCards.count();
  26  |   console.log(`Found ${cardCount} glass cards`);
  27  |   
  28  |   // Screenshot first few cards individually
  29  |   for (let i = 0; i < Math.min(3, cardCount); i++) {
  30  |     await bentoCards.nth(i).screenshot({ 
  31  |       path: `visual-analysis/landing-card-${i + 1}.png` 
  32  |     });
  33  |   }
  34  |   
  35  |   // Check pricing section
  36  |   const pricingSection = await page.locator('#pricing');
  37  |   if (await pricingSection.isVisible()) {
  38  |     await pricingSection.screenshot({ 
  39  |       path: 'visual-analysis/landing-pricing-section.png' 
  40  |     });
  41  |   }
  42  |   
  43  |   // Check text contrast - sample some key text elements
  44  |   const headings = await page.locator('h1, h2, h3');
  45  |   const headingCount = await headings.count();
  46  |   
  47  |   console.log('\n=== VISUAL ANALYSIS REPORT ===\n');
  48  |   console.log(`Total headings found: ${headingCount}`);
  49  |   console.log(`Total glass cards: ${cardCount}`);
  50  |   
  51  |   // Check for potential contrast issues
  52  |   const mutedTextElements = await page.locator('.text-muted-foreground');
  53  |   const mutedCount = await mutedTextElements.count();
  54  |   console.log(`Muted foreground elements: ${mutedCount}`);
  55  |   
  56  |   // Get computed styles for key elements
  57  |   const heroTitle = await page.locator('h1').first();
  58  |   const titleStyle = await heroTitle.evaluate((el) => {
  59  |     const style = window.getComputedStyle(el);
  60  |     return {
  61  |       color: style.color,
  62  |       fontSize: style.fontSize,
  63  |       fontWeight: style.fontWeight,
  64  |       backgroundColor: style.backgroundColor
  65  |     };
  66  |   });
  67  |   
  68  |   console.log('\nHero Title Styles:', titleStyle);
  69  |   
  70  |   // Check badge visibility
  71  |   const badges = await page.locator('[class*="Badge"]');
  72  |   const badgeCount = await badges.count();
  73  |   console.log(`Badges found: ${badgeCount}`);
  74  |   
  75  |   // Analyze button visibility
  76  |   const buttons = await page.locator('button, [role="button"]');
  77  |   const buttonCount = await buttons.count();
  78  |   console.log(`Buttons found: ${buttonCount}`);
  79  |   
  80  |   // Check navigation
  81  |   const navLinks = await page.locator('nav a');
  82  |   const navCount = await navLinks.count();
  83  |   console.log(`Navigation links: ${navCount}`);
  84  |   
  85  |   console.log('\n=== END REPORT ===\n');
  86  |   
  87  |   // Verify key sections are visible
  88  |   await expect(page.locator('h1')).toBeVisible();
  89  |   await expect(page.locator('#features')).toBeVisible();
  90  |   await expect(page.locator('#pricing')).toBeVisible();
  91  |   await expect(page.locator('#testimonials')).toBeVisible();
  92  | });
  93  | 
  94  | test('Landing Page Color Contrast Check', async ({ page }) => {
  95  |   await page.goto('http://localhost:5174/');
  96  |   await page.waitForLoadState('networkidle');
  97  |   
  98  |   // Function to check contrast ratio
  99  |   const checkContrast = async (selector: string) => {
  100 |     const element = await page.locator(selector).first();
  101 |     if (await element.isVisible()) {
  102 |       const contrastInfo = await element.evaluate((el) => {
  103 |         const style = window.getComputedStyle(el);
  104 |         const parent = el.parentElement;
  105 |         const parentStyle = parent ? window.getComputedStyle(parent) : null;
  106 |         
  107 |         return {
  108 |           selector: el.tagName.toLowerCase(),
```
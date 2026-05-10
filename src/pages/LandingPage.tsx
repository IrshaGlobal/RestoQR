import { Link } from 'react-router-dom'
import { 
  QrCode, 
  UtensilsCrossed, 
  Zap, 
  LayoutDashboard, 
  Bell, 
  Smartphone,
  Check,
  ArrowRight,
  Star,
  TrendingUp,
  Users,
  Shield,
  Clock,
  BarChart3,
  Globe,
  Sparkles,
  ChefHat,
  TabletSmartphone,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text-premium">RestoQR</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/admin">
              <Button size="sm" className="btn-premium">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Bento Grid Style */}
      <section className="relative overflow-hidden pt-20 pb-32 bg-gradient-subtle">
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto mb-16 animate-enter">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Modern Restaurant Management Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight text-foreground">
              Transform Your Restaurant with{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">Intelligent QR Ordering</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Streamline operations, delight customers, and boost revenue with our all-in-one 
              QR-based ordering system. From table scan to kitchen delivery — seamless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/menu?table=1&restaurant=demo">
                <Button size="xl" className="btn-premium w-full sm:w-auto">
                  Try Live Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Bento Grid - Feature Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Large Feature Card */}
            <Card className="md:col-span-2 glass-premium p-8 hover-lift group">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Badge variant="default" className="mb-3">Most Popular</Badge>
                  <h3 className="text-2xl font-bold mb-2">Real-Time Order Management</h3>
                  <p className="text-foreground/70">Live order tracking from customer to kitchen with instant notifications</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
              </div>
              <div className="bg-background/50 border border-border/30 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Table 5 - New Order</span>
                  <Badge variant="success" className="text-xs">Just now</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Table 12 - Preparing</span>
                  <Badge variant="warning" className="text-xs">5 min ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Table 8 - Ready</span>
                  <Badge variant="info" className="text-xs">12 min ago</Badge>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="glass-premium p-8 hover-lift">
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center text-success mb-4">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-bold mb-2">+47%</h3>
              <p className="text-foreground/70 mb-4">Average revenue increase</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Faster turnover</span>
                  <span className="font-semibold text-foreground">32%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Order accuracy</span>
                  <span className="font-semibold text-foreground">99.8%</span>
                </div>
              </div>
            </Card>

            {/* Mobile Experience Card */}
            <Card className="glass-premium p-8 hover-lift group">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mobile-First Design</h3>
              <p className="text-foreground/70 mb-4">Beautiful, responsive interface optimized for all devices</p>
              <div className="flex gap-2">
                <Badge variant="secondary">iOS</Badge>
                <Badge variant="secondary">Android</Badge>
                <Badge variant="secondary">Web</Badge>
              </div>
            </Card>

            {/* Analytics Card */}
            <Card className="md:col-span-2 glass-premium p-8 hover-lift group">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Powerful Analytics Dashboard</h3>
                  <p className="text-foreground/70">Track performance, optimize menu, and make data-driven decisions</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-info/10 flex items-center justify-center text-info group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background/50 border border-border/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">284</p>
                  <p className="text-xs text-foreground/60 mt-1">Orders Today</p>
                </div>
                <div className="bg-background/50 border border-border/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-success">$4.2k</p>
                  <p className="text-xs text-foreground/60 mt-1">Revenue</p>
                </div>
                <div className="bg-background/50 border border-border/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-accent">4.8★</p>
                  <p className="text-xs text-foreground/60 mt-1">Rating</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid - Comprehensive */}
      <section id="features" className="py-24 bg-card/50 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              A complete suite of tools designed specifically for modern restaurants
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<QrCode className="w-6 h-6" />}
              title="Instant QR Ordering"
              description="Customers scan table QR codes to access menus and place orders instantly without waiting for staff."
              badge="Core"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Real-Time Updates"
              description="Live order tracking with instant status updates from kitchen to table with push notifications."
              badge="Popular"
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6" />}
              title="Smart Notifications"
              description="Sound alerts and visual indicators for new orders, help requests, and status changes."
            />
            <FeatureCard
              icon={<ChefHat className="w-6 h-6" />}
              title="Kitchen Display System"
              description="Optimized kitchen dashboard with order queue management and preparation timers."
            />
            <FeatureCard
              icon={<UtensilsCrossed className="w-6 h-6" />}
              title="Menu Management"
              description="Easy admin panel to manage items, categories, prices, availability, and special offers."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Staff Management"
              description="Role-based access control with staff accounts, permissions, and performance tracking."
            />
            <FeatureCard
              icon={<TabletSmartphone className="w-6 h-6" />}
              title="Multi-Device Support"
              description="Works seamlessly on smartphones, tablets, and desktops with responsive design."
            />
            <FeatureCard
              icon={<Receipt className="w-6 h-6" />}
              title="Digital Receipts"
              description="Automatic receipt generation with order details, pricing, and customization options."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Enterprise Security"
              description="Bank-level encryption, secure authentication, and role-based access control."
              badge="Pro"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Simple Process</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How RestoQR Works</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Three simple steps to revolutionize your restaurant operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              step="01"
              icon={<QrCode className="w-8 h-8" />}
              title="Customer Scans QR Code"
              description="Diners scan the unique QR code at their table using their smartphone camera"
              color="primary"
            />
            <StepCard
              step="02"
              icon={<UtensilsCrossed className="w-8 h-8" />}
              title="Browse & Place Order"
              description="View digital menu, customize items, add to cart, and submit order instantly"
              color="accent"
            />
            <StepCard
              step="03"
              icon={<Clock className="w-8 h-8" />}
              title="Track & Enjoy"
              description="Watch order progress in real-time from preparation to table delivery"
              color="success"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-card/50 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Choose the perfect plan for your restaurant. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="glass-card hover-lift">
              <CardHeader>
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription className="text-foreground/60">Perfect for small cafes</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-foreground/60">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <PricingFeature text="Up to 20 tables" />
                  <PricingFeature text="Basic QR ordering" />
                  <PricingFeature text="Email support" />
                  <PricingFeature text="Standard analytics" />
                  <PricingFeature text="Mobile app access" />
                </ul>
                <Button variant="outline" className="w-full">Get Started</Button>
              </CardContent>
            </Card>

            {/* Professional Plan - Featured */}
            <Card className="glass-premium hover-lift border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="btn-premium px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription className="text-foreground/60">Ideal for growing restaurants</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold gradient-text">$79</span>
                  <span className="text-foreground/60">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <PricingFeature text="Unlimited tables" highlighted />
                  <PricingFeature text="Advanced QR features" highlighted />
                  <PricingFeature text="Priority support 24/7" highlighted />
                  <PricingFeature text="Full analytics suite" highlighted />
                  <PricingFeature text="Kitchen display system" highlighted />
                  <PricingFeature text="Staff management" highlighted />
                  <PricingFeature text="Custom branding" />
                </ul>
                <Button className="w-full btn-premium">Start Free Trial</Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="glass-card hover-lift">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription className="text-foreground/60">For restaurant chains</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <PricingFeature text="Everything in Pro" />
                  <PricingFeature text="Multi-location support" />
                  <PricingFeature text="Dedicated account manager" />
                  <PricingFeature text="Custom integrations" />
                  <PricingFeature text="White-label solution" />
                  <PricingFeature text="SLA guarantee" />
                  <PricingFeature text="API access" />
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-foreground/60 mb-4">All plans include a 14-day free trial</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Restaurants Worldwide</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              See what restaurant owners are saying about RestoQR
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              quote="RestoQR transformed our operations. We've seen a 40% increase in table turnover and customers love the convenience."
              author="Sarah Chen"
              role="Owner, Golden Dragon Bistro"
              rating={5}
            />
            <TestimonialCard
              quote="The real-time order tracking is incredible. Our kitchen staff can now prioritize orders efficiently without any confusion."
              author="Michael Rodriguez"
              role="Manager, Bella Italia"
              rating={5}
            />
            <TestimonialCard
              quote="Setup was incredibly easy. Within 2 hours we were fully operational. The support team is outstanding!"
              author="Emma Thompson"
              role="Founder, Cafe Noir"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <Card className="glass-premium p-12 md:p-16 text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                <Globe className="w-4 h-4 mr-2 inline" />
                Join 2,000+ Restaurants
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Transform Your Restaurant?</h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Start your 14-day free trial today. No credit card required. Cancel anytime.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admin">
                <Button size="xl" className="btn-premium w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/menu?table=1&restaurant=demo">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  View Live Demo
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">RestoQR</span>
              </div>
              <p className="text-sm text-foreground/70">
                Modern QR-based ordering system for restaurants worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/60">
              © 2026 RestoQR. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-foreground/60">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component Definitions

function FeatureCard({ 
  icon, 
  title, 
  description, 
  badge 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
}) {
  return (
    <Card className="glass-card p-6 hover-lift group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">{badge}</Badge>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-foreground/70">{description}</p>
    </Card>
  )
}

function StepCard({ 
  step, 
  icon, 
  title, 
  description, 
  color 
}: { 
  step: string
  icon: React.ReactNode
  title: string
  description: string
  color: 'primary' | 'accent' | 'success'
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success'
  }

  return (
    <Card className="glass-card p-8 text-center hover-lift">
      <div className={`w-16 h-16 rounded-2xl ${colorClasses[color]} flex items-center justify-center mx-auto mb-6`}>
        {icon}
      </div>
      <div className="text-sm font-bold text-foreground/60 mb-2">STEP {step}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </Card>
  )
}

function PricingFeature({ text, highlighted }: { text: string; highlighted?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        highlighted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        <Check className="w-3 h-3" />
      </div>
      <span className={`text-sm ${highlighted ? 'font-medium' : ''}`}>{text}</span>
    </li>
  )
}

function TestimonialCard({ 
  quote, 
  author, 
  role, 
  rating 
}: { 
  quote: string
  author: string
  role: string
  rating: number
}) {
  return (
    <Card className="glass-card p-8 hover-lift">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-warning text-warning" />
        ))}
      </div>
      <p className="text-foreground/70 mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-foreground/60">{role}</p>
      </div>
    </Card>
  )
}

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { IndustryMarquee } from './components/IndustryMarquee';
import { FeatureShowcase } from './components/FeatureShowcase';
import { FeatureGrid } from './components/FeatureGrid';
import { HowItWorks } from './components/HowItWorks';
import { AlsoBuiltInSection } from './components/AlsoBuiltInSection';
import { WhyVendoraSection } from './components/WhyVendoraSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { OnboardingModal } from './components/OnboardingModal';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { SubscriptionPlanCode } from './shared';

function PublicLandingPage() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanCode>(SubscriptionPlanCode.GROWTH);

  const handleOpenOnboarding = (planCode?: any) => {
    if (planCode && Object.values(SubscriptionPlanCode).includes(planCode)) {
      setSelectedPlan(planCode);
    } else {
      setSelectedPlan(SubscriptionPlanCode.FREE_TRIAL);
    }
    setIsOnboardingOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar onOpenOnboarding={handleOpenOnboarding} />

      {/* Hero Section */}
      <HeroSection onOpenOnboarding={handleOpenOnboarding} />

      {/* 14 Retail Industries Marquee */}
      <IndustryMarquee />

      {/* Feature Showcase with Realistic Receipt Mockup (Screenshot #4) */}
      <FeatureShowcase />

      {/* Feature Grid (Screenshot #5) */}
      <FeatureGrid />

      {/* How it Works with Sign-in Preview (Screenshot #3) */}
      <HowItWorks />

      {/* Also Built In 10 Cards (Screenshot #2) */}
      <AlsoBuiltInSection />

      {/* Why Vendora & Full Comparison Matrix */}
      <WhyVendoraSection />

      {/* Simple Plans for Every Retail Business (Screenshot #1) */}
      <PricingSection onOpenOnboarding={handleOpenOnboarding} />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Footer with Unipro Tech Solutions Details */}
      <Footer />

      {/* Self-Service Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialPlan={selectedPlan}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/admin" element={<SuperAdminDashboard />} />
      </Routes>
    </Router>
  );
}


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WhyVendoraSection } from './components/WhyVendoraSection';
import { FeatureShowcase } from './components/FeatureShowcase';
import { FeatureGrid } from './components/FeatureGrid';
import { HowItWorks } from './components/HowItWorks';
import { AlsoBuiltInSection } from './components/AlsoBuiltInSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { RegisterPage } from './pages/RegisterPage';

function PublicLandingPage() {
  const handleScrollToPlans = () => {
    const el = document.getElementById('plans');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans w-full overflow-x-hidden pt-18">
      {/* Top Fixed Navigation Bar with RetailPOS Powered by Vendora Logo (Shop Sign In removed) */}
      <Navbar onScrollToPlans={handleScrollToPlans} />

      {/* Hero Section with Open Laptop Mockup & Live Ticker */}
      <HeroSection onScrollToPlans={handleScrollToPlans} />

      {/* Why Vendora RetailPOS & Elevated Centerpiece Comparison Table */}
      <WhyVendoraSection />

      {/* Feature Showcase with Realistic Thermal Receipt Mockup */}
      <FeatureShowcase />

      {/* Feature Grid: 5 Core Modules */}
      <FeatureGrid />

      {/* How it Works with Store Sign-in Preview */}
      <HowItWorks />

      {/* Also Built In 10 Cards */}
      <AlsoBuiltInSection />

      {/* Simple Plans for Every Retail Business (Action Buttons open /register in new tab) */}
      <PricingSection />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<SuperAdminDashboard />} />
      </Routes>
    </Router>
  );
}

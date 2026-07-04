import {
  Header,
  HeroSection,
  StatsBar,
  ImpactSection,
  FeaturesSection,
  ProcessSection,
  CTASection,
  FAQSection,
  Footer
} from '@/components/home';

export default function HomePage() {
  return (
    <div className="min-h-screen surface-page">
      <Header />
      <HeroSection />
      <StatsBar />
      <ImpactSection />
      <FeaturesSection />
      <ProcessSection />
      <CTASection />
      <FAQSection />
      <Footer />
    </div>
  );
}
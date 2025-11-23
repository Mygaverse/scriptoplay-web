import Layout from '../components/Layout';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';
import AboutSection from '../components/AboutSection';
import CTAUpdates from '../components/CTAUpdates';
import FAQSection from '../components/FAQSection';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <FeatureSection />
      <AboutSection />
      <FAQSection />
      <CTAUpdates />
    </Layout>
  );
}

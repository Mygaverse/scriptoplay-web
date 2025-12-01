import { Metadata } from 'next';
import { Fragment } from 'react/jsx-runtime';

import NavbarLanding from '@/components/shared/header/NavbarLanding';
import FooterLanding from '@/components/shared/footer/FooterLanding';
import Hero from '@/components/landing/Hero';
import FeaturesGeneration from '@/components/landing/FeaturesGeneration';
import FeaturesEvaluation from '@/components/landing/FeaturesEvaluation';
import About from '@/components/landing/About';
import FAQ from '@/components/landing/FAQ';

export const metadata: Metadata = {
  title: 'Scriptoplay | AI Script to Film',
  description: 'Transforming script-to-film through the power of AI.',
};

export default function Home() {
  return (
    <Fragment>
      <NavbarLanding />
      <main className="relative min-h-screen bg-gray-50 p-0 m-0">
        <Hero />
        {/* THE NEXT SECTION */}
        {/* 
            Since the dashboard image is ~492px tall, half of it (246px) is hanging out.
            We need at least pt-[300px] here so the text doesn't get hidden behind the image.
        */}
        <section className="pt-[250px] pb-20 container mx-auto">
        </section>
        <FeaturesGeneration />
        <FeaturesEvaluation />
        <About />
        <FAQ />
        
      </main>
      <FooterLanding />
    </Fragment>
    
  );
}
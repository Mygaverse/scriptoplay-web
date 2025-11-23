import { HeroWrapper, Headline, Subtitle, CTAButtons, PrimaryButton, SecondaryButton } from './styles/HeroSection.styles';
import Button from './Button';
import { motion } from "framer-motion";


export default function HeroSection() {
  return (
    <motion.section
      className="bg-dark text-white text-center py-20 px-4"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <HeroWrapper>
        <Headline>Transforming script-to-film through the power of AI</Headline>
        <Subtitle>Scriptoplay helps writers generate, structure, and evaluate scripts with AI assistance.</Subtitle>
        <CTAButtons>
          <PrimaryButton href="/signup">Get Started</PrimaryButton>
          <SecondaryButton href="/updates">See Updates</SecondaryButton>
          <Button variant='primary' href='/contact'>Contact Us</Button>
        </CTAButtons>
      </HeroWrapper>
    </motion.section>
  );
}

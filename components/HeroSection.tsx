import { HeroWrapper, Headline, Subtitle, CTAButtons, PrimaryButton, SecondaryButton } from './styles/HeroSection.styles';
import Button from './Button';

export default function HeroSection() {
  return (
    <HeroWrapper>
      <Headline>Transforming script-to-film through the power of AI</Headline>
      <Subtitle>Scriptoplay helps writers generate, structure, and evaluate scripts with AI assistance.</Subtitle>
      <CTAButtons>
        <PrimaryButton href="/signup">Get Started</PrimaryButton>
        <SecondaryButton href="/updates">See Updates</SecondaryButton>
        <Button variant='primary' href='/contact'>Contact Us</Button>
      </CTAButtons>
    </HeroWrapper>
  );
}

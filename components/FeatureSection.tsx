import styled from 'styled-components';

const Section = styled.section`
  padding: 4rem 2rem;
  background: #fff;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background: #f1f1f1;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

export default function FeatureSection() {
  return (
    <Section>
      <SectionTitle>Generate with AI</SectionTitle>
      <CardGrid>
        <FeatureCard>
          <h3>Idea & Scene Generator</h3>
          <p>Start with a logline and let our AI expand it into full scenes and character arcs.</p>
        </FeatureCard>
        <FeatureCard>
          <h3>Genre-Aware Copilot</h3>
          <p>Adapts tone, pacing, and structure to match your chosen genre, from rom-com to thriller.</p>
        </FeatureCard>
        <FeatureCard>
          <h3>AI-assisted Formatting</h3>
          <p>Automatically formats your script to industry standards while you write.</p>
        </FeatureCard>
      </CardGrid>

      <SectionTitle style={{ marginTop: '4rem' }}>Evaluate Your Script</SectionTitle>
      <CardGrid>
        <FeatureCard>
          <h3>Feedback Scoring</h3>
          <p>Get actionable scores on character development, pacing, and dialogue strength.</p>
        </FeatureCard>
        <FeatureCard>
          <h3>Script Insight Dashboard</h3>
          <p>Visualize structure and act balance to improve story impact.</p>
        </FeatureCard>
      </CardGrid>
    </Section>
  );
}

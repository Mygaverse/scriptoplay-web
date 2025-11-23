import styled from 'styled-components';

const Section = styled.section`
  padding: 4rem 2rem;
  background: #f5f5f5;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
`;

const Card = styled.div`
  flex: 1 1 250px;
  max-width: 300px;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
`;

export default function AboutSection() {
  return (
    <Section>
      <Title>Why Scriptoplay?</Title>
      <Grid>
        <Card>
          <h3>AI-Powered Assistance</h3>
          <p>Our intelligent tools help turn raw ideas into structured scripts with ease.</p>
        </Card>
        <Card>
          <h3>Designed for Writers</h3>
          <p>Built with screenwriters in mind — not developers or engineers.</p>
        </Card>
        <Card>
          <h3>Feedback-Driven Design</h3>
          <p>Get real, structured feedback and improve your work version by version.</p>
        </Card>
      </Grid>
    </Section>
  );
}

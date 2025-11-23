import styled from 'styled-components';

export const HeroWrapper = styled.section`
  padding: 4rem;
  text-align: center;
  background: #111;
  color: #fff;
`;

export const Headline = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

export const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

export const CTAButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

export const PrimaryButton = styled.a`
  background: #0070f3;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
`;

export const SecondaryButton = styled.a`
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
`;

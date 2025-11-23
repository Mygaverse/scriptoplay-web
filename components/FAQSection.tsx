import { useState } from 'react';
import styled from 'styled-components';

const Section = styled.section`
  padding: 4rem 2rem;
  background: #fff;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const FAQItem = styled.div`
  border-bottom: 1px solid #ddd;
  padding: 1rem 0;
  cursor: pointer;
`;

const Question = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
`;

const Answer = styled.div<{ isOpen: boolean }>`
  max-height: \${props => (props.isOpen ? '500px' : '0')};
  opacity: \${props => (props.isOpen ? '1' : '0')};
  overflow: hidden;
  transition: all 0.3s ease;
  font-size: 1rem;
  margin-top: \${props => (props.isOpen ? '0.5rem' : '0')};
  color: #444;
`;

const faqs = [
  {
    q: "What is Scriptoplay?",
    a: "An AI-powered platform for scriptwriters to generate and evaluate screenplays."
  },
  {
    q: "Is it free to use?",
    a: "There will be a free trial. Subscription plans will be offered with additional features."
  },
  {
    q: "Do I need to know screenwriting format?",
    a: "No. Scriptoplay helps format your script to industry standards automatically."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section>
      <Title>Frequently Asked Questions</Title>
      {faqs.map((item, index) => (
        <FAQItem key={index} onClick={() => toggle(index)}>
          <Question>{item.q}</Question>
          <Answer isOpen={openIndex === index}>{item.a}</Answer>
        </FAQItem>
      ))}
    </Section>
  );
}

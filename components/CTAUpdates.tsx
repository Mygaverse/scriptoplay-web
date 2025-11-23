import styled from 'styled-components';
import { motion } from "framer-motion";

const Section = styled.section`
  padding: 3rem 2rem;
  background: #111;
  text-align: center;
  color: #fff;
`;

const Button = styled.a`
  margin-top: 1rem;
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 2px solid #fff;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  transition: 0.3s;

  &:hover {
    background: #fff;
    color: #111;
  }
`;

export default function CTAUpdates() {
  return (
    <motion.section
      className="bg-dark text-white text-center py-20 px-4"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Section>
        <h2>Want to know what’s new?</h2>
        <p>Check out our changelog and upcoming features.</p>
        <Button href="/updates">See Updates</Button>
      </Section>
    </motion.section>
  );
}

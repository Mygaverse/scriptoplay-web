import styled from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
}

const Button = styled.a<ButtonProps>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  background-color: \${props => props.variant === 'secondary' ? 'transparent' : props.theme.colors.primary};
  color: \${props => props.variant === 'secondary' ? props.theme.colors.text : '#fff'};
  border: \${props => props.variant === 'secondary' ? '2px solid #111' : 'none'};

  &:hover {
    opacity: 0.85;
  }
`;

export default Button;

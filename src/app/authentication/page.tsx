// src/app/authentication/page.tsx
import { Metadata } from 'next';
import AuthPageContent from '@/components/authentication/AuthPageContent';

export const metadata: Metadata = {
  title: 'Sign In | Scriptoplay',
  description: 'Login to access your dashboard.',
};

export default function AuthenticationPage() {
  return <AuthPageContent />;
}
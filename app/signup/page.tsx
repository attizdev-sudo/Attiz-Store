import AuthPage from '@/app/components/AuthPage';

export const metadata = { title: 'Sign Up — ATTIZ' };

export default function SignupRoute() {
  return <AuthPage defaultMode="signup" />;
}

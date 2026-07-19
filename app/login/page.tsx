import AuthPage from '@/app/components/AuthPage';

export const metadata = { title: 'Sign In — ATTIZ' };

export default function LoginRoute() {
  return <AuthPage defaultMode="login" />;
}

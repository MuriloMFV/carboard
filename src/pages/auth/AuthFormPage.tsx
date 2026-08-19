import { IonContent, IonPage } from '@ionic/react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logotexto.png';
import { FormField } from '../../components/forms';
import { Card, PrimaryButton } from '../../components/ui';
import { useAuth } from '../../features/auth/AuthContext';
import '../../features/auth/auth.css';

interface AuthFormPageProps {
  mode: 'login' | 'signup';
}

const friendlyAuthError = (error: unknown): string => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('invalid login credentials')) return 'Email ou senha incorretos.';
  if (message.includes('already registered')) return 'Este email já possui uma conta.';
  if (message.includes('password')) return 'Use uma senha com pelo menos 8 caracteres.';
  if (message.includes('fetch') || message.includes('network')) return 'Sem conexão. Verifique sua internet e tente novamente.';
  return 'Não foi possível concluir. Tente novamente.';
};

export const AuthFormPage = ({ mode }: AuthFormPageProps) => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isLogin = mode === 'login';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const result = await signUp(email, password);
        if (result.requiresEmailConfirmation) {
          setMessage('Conta criada. Confirme seu email antes de entrar.');
        }
      }
    } catch (submitError) {
      setError(friendlyAuthError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="cb-auth-content">
        <main className="cb-auth-layout">
          <img className="cb-auth-logo" src={logo} alt="CarBoard" />
          <Card className="cb-auth-card">
            <header className="cb-auth-copy">
              <h1>{isLogin ? 'Entrar' : 'Criar conta'}</h1>
              <p>{isLogin ? 'Acesse seus veículos salvos.' : 'Comece a organizar a vida do seu carro.'}</p>
            </header>

            <form className="cb-auth-form" onSubmit={submit}>
              <FormField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <FormField
                label="Senha"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {error && <p className="cb-auth-error" role="alert">{error}</p>}
              {message && <p className="cb-auth-success" role="status">{message}</p>}
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar conta')}
              </PrimaryButton>
            </form>

            <p className="cb-auth-switch">
              {isLogin ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}
              <Link to={isLogin ? '/auth/signup' : '/auth/login'}>
                {isLogin ? 'Cadastre-se' : 'Entrar'}
              </Link>
            </p>
          </Card>
        </main>
      </IonContent>
    </IonPage>
  );
};

export const LoginPage = () => <AuthFormPage mode="login" />;
export const SignUpPage = () => <AuthFormPage mode="signup" />;

import LoginForm from '../LoginForm';

export default function LoginFormExample() {
  return (
    <LoginForm onLogin={(username) => console.log('Login triggered for:', username)} />
  );
}
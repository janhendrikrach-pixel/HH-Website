import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate('/app');
    } catch {
      setError(language === 'de' ? 'Ungültige Anmeldedaten' : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-page" className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo-200.png" alt="Logo" className="w-20 h-20 object-contain mx-auto mb-4" />
          </Link>
          <h1 className="font-teko text-3xl text-white uppercase">
            {language === 'de' ? 'Mitglieder-Login' : 'Member Login'}
          </h1>
          <p className="font-rajdhani text-gray-400 text-sm mt-2">
            {language === 'de' ? 'Für Schüler und Trainer' : 'For students and trainers'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-charcoal border border-white/5 p-8 space-y-6">
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">E-Mail</Label>
            <Input
              type="email"
              data-testid="login-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-obsidian border-white/10 focus:border-gold text-white rounded-none"
              required
            />
          </div>
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">
              {language === 'de' ? 'Passwort' : 'Password'}
            </Label>
            <Input
              type="password"
              data-testid="login-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-obsidian border-white/10 focus:border-gold text-white rounded-none"
              required
            />
          </div>
          {error && <p className="text-red-400 font-rajdhani text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            data-testid="login-submit-btn"
            className="w-full bg-gold hover:bg-gold-glow text-black font-teko uppercase tracking-wider py-6"
          >
            {loading ? '...' : 'Login'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="font-rajdhani text-gray-500 hover:text-gold text-sm transition-colors">
            {language === 'de' ? 'Zurück zur Website' : 'Back to website'}
          </Link>
        </div>
      </div>
    </div>
  );
}

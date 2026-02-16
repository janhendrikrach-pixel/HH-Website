import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Link } from 'react-router-dom';

export function AdminLogin({ language, credentials, setCredentials, onLogin, authError }) {
  return (
    <div data-testid="admin-login" className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gold rounded flex items-center justify-center">
              <span className="font-teko text-2xl text-black font-bold">HH</span>
            </div>
          </Link>
          <h1 className="font-teko text-3xl text-white uppercase">Admin Login</h1>
        </div>

        <form onSubmit={onLogin} className="bg-charcoal border border-white/5 p-8 space-y-6">
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">
              {language === 'de' ? 'Benutzername' : 'Username'}
            </Label>
            <Input
              data-testid="admin-username-input"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="bg-obsidian border-white/10 focus:border-gold text-white rounded-none"
            />
          </div>
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">
              {language === 'de' ? 'Passwort' : 'Password'}
            </Label>
            <Input
              type="password"
              data-testid="admin-password-input"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="bg-obsidian border-white/10 focus:border-gold text-white rounded-none"
            />
          </div>
          {authError && (
            <p className="text-red-400 font-rajdhani text-sm">{authError}</p>
          )}
          <Button
            type="submit"
            data-testid="admin-login-btn"
            className="w-full bg-gold hover:bg-gold-glow text-black font-teko uppercase tracking-wider py-6"
          >
            Login
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

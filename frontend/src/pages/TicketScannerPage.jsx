import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { Camera, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function TicketScannerPage() {
  const { user, loading: authLoading, getAuthHeaders } = useAuth();
  const { language } = useLanguage();
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);
  const de = language === 'de';

  useEffect(() => {
    if (!scanning || authLoading || !user) return;
    const timer = setTimeout(() => {
      const el = document.getElementById('qr-reader');
      if (!el) return;
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10, qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      }, false);
      scanner.render(
        (decodedText) => {
          scanner.clear().catch(() => {});
          validateTicket(decodedText);
        },
        () => {}
      );
      scannerInstance.current = scanner;
    }, 300);
    return () => {
      clearTimeout(timer);
      if (scannerInstance.current) {
        scannerInstance.current.clear().catch(() => {});
        scannerInstance.current = null;
      }
    };
  }, [scanning, authLoading, user]);

  const validateTicket = async (code) => {
    setScanning(false);
    try {
      const res = await axios.post(`${API}/api/tickets/validate/${code}`, {}, { headers: getAuthHeaders() });
      setResult(res.data);
    } catch (err) {
      setResult({ valid: false, message: err.response?.data?.detail || 'Fehler bei der Validierung' });
    }
  };

  const reset = () => {
    setResult(null);
    setScanning(true);
    setManualCode('');
  };

  if (authLoading) return <div className="min-h-screen bg-obsidian flex items-center justify-center"><div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  if (!user || (user.role !== 'admin' && user.role !== 'ticket_scanner')) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="font-teko text-2xl text-white">{de ? 'Kein Zugriff' : 'Access Denied'}</p>
          <p className="font-rajdhani text-gray-400 mt-2">{de ? 'Du hast keine Berechtigung für den Ticket-Scanner.' : 'You do not have permission to access the ticket scanner.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="ticket-scanner" className="min-h-screen bg-obsidian">
      <header className="sticky top-0 z-40 bg-obsidian/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo-200.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-teko text-base text-white uppercase">Ticket Scanner</span>
        </div>
        <span className="font-rajdhani text-gray-500 text-xs">{user.name}</span>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {result ? (
          <div data-testid="scan-result" className="space-y-6">
            <div className={`p-8 rounded-2xl border-2 text-center ${result.valid ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
              {result.valid ? (
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
              ) : (
                <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
              )}
              <h2 className={`font-teko text-3xl ${result.valid ? 'text-green-400' : 'text-red-400'}`}>{result.message}</h2>
            </div>

            {result.ticket && (
              <div className="bg-charcoal border border-white/5 rounded-xl p-5 space-y-3">
                <div className="flex justify-between"><span className="font-rajdhani text-gray-500 text-sm">Code:</span><span className="font-teko text-gold">{result.ticket.ticket_code}</span></div>
                <div className="flex justify-between"><span className="font-rajdhani text-gray-500 text-sm">Name:</span><span className="font-rajdhani text-white">{result.ticket.customer_name}</span></div>
                <div className="flex justify-between"><span className="font-rajdhani text-gray-500 text-sm">Zahlung:</span><span className="font-rajdhani text-white">{result.ticket.payment_method === 'transfer' ? 'Überweisung' : 'Abendkasse'}</span></div>
                {result.event && <div className="flex justify-between"><span className="font-rajdhani text-gray-500 text-sm">Event:</span><span className="font-rajdhani text-white">{result.event.title_de}</span></div>}
              </div>
            )}

            <button data-testid="scan-again-btn" onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gold text-obsidian font-teko text-lg uppercase tracking-wider rounded-xl">
              <RotateCcw className="w-5 h-5" />{de ? 'Nächstes Ticket scannen' : 'Scan Next Ticket'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="font-teko text-2xl text-white text-center">{de ? 'Ticket scannen' : 'Scan Ticket'}</h2>

            {scanning && (
              <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden" style={{ width: '100%' }} />
            )}

            <div className="relative">
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="font-rajdhani text-gray-500 text-xs uppercase">{de ? 'oder manuell eingeben' : 'or enter manually'}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="flex gap-2">
                <input data-testid="manual-code-input" value={manualCode} onChange={e => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && manualCode && validateTicket(manualCode)}
                  placeholder="HQ-XXXXXXXX"
                  className="flex-1 bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-teko text-xl text-white text-center tracking-wider focus:outline-none focus:border-gold/50" />
                <button data-testid="manual-validate-btn" onClick={() => manualCode && validateTicket(manualCode)} disabled={!manualCode}
                  className="px-6 py-3 bg-gold text-obsidian font-teko uppercase rounded-xl disabled:opacity-40">
                  {de ? 'Prüfen' : 'Check'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { CheckCircle, XCircle, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DashboardTab() {
  const { user, getAuthHeaders } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const de = language === 'de';

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const sessRes = await axios.get(`${API}/sessions`, { headers });
      setUpcoming(sessRes.data.slice(0, 3));
      // Calculate stats from sessions
      const total = sessRes.data.length;
      const confirmed = sessRes.data.filter(s => s.my_status === 'confirmed').length;
      const declined = sessRes.data.filter(s => s.my_status === 'declined').length;
      setStats({ total, confirmed, declined, pending: total - confirmed - declined });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRSVP = async (sessionId, status) => {
    try {
      await axios.put(`${API}/attendance/${sessionId}`, { status }, { headers: getAuthHeaders() });
      setUpcoming(prev => prev.map(s => s.id === sessionId ? { ...s, my_status: status } : s));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;

  return (
    <div data-testid="app-dashboard" className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-gold/10 to-transparent border border-gold/20 rounded-xl p-5">
        <h2 className="font-teko text-2xl text-white">{de ? 'Hallo' : 'Hello'}, {user?.name?.split(' ')[0]}!</h2>
        <p className="font-rajdhani text-gray-400 text-sm mt-1">
          {de ? 'Willkommen zurück bei Headlock Headquarter' : 'Welcome back to Headlock Headquarter'}
        </p>
      </div>

      {/* Stats */}
      {user?.role === 'student' && stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-charcoal border border-white/5 rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-gold mx-auto mb-1" />
            <p className="font-teko text-2xl text-white">{stats.total}</p>
            <p className="font-rajdhani text-xs text-gray-500">{de ? 'Trainings' : 'Sessions'}</p>
          </div>
          <div className="bg-charcoal border border-white/5 rounded-xl p-4 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="font-teko text-2xl text-white">{stats.confirmed}</p>
            <p className="font-rajdhani text-xs text-gray-500">{de ? 'Zugesagt' : 'Confirmed'}</p>
          </div>
          <div className="bg-charcoal border border-white/5 rounded-xl p-4 text-center">
            <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="font-teko text-2xl text-white">{stats.declined}</p>
            <p className="font-rajdhani text-xs text-gray-500">{de ? 'Abgesagt' : 'Declined'}</p>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <h3 className="font-teko text-lg text-gold uppercase mb-3">{de ? 'Nächste Trainings' : 'Upcoming Sessions'}</h3>
        {upcoming.length === 0 ? (
          <p className="text-center text-gray-500 font-rajdhani py-8 bg-charcoal rounded-xl border border-white/5">
            {de ? 'Keine kommenden Trainings' : 'No upcoming sessions'}
          </p>
        ) : upcoming.map(session => (
          <div key={session.id} className={`bg-charcoal border rounded-xl p-4 mb-3 ${session.is_cancelled ? 'border-red-500/30 opacity-60' : 'border-white/5'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="font-teko text-lg text-white">{session.date}</span>
              {session.is_cancelled && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-rajdhani rounded">{de ? 'ABGESAGT' : 'CANCELLED'}</span>}
            </div>
            {session.coach_name && <p className="font-rajdhani text-gray-400 text-sm ml-7">Coach: <span className="text-gold">{session.coach_name}</span></p>}
            {!session.is_cancelled && user?.role === 'student' && (
              <div className="flex gap-2 mt-3 ml-7">
                {session.my_status === 'confirmed' ? (
                  <button onClick={() => handleRSVP(session.id, 'declined')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg font-rajdhani text-sm">
                    <CheckCircle className="w-3.5 h-3.5" />{de ? 'Zugesagt' : 'Confirmed'}
                  </button>
                ) : session.my_status === 'declined' ? (
                  <button onClick={() => handleRSVP(session.id, 'confirmed')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg font-rajdhani text-sm">
                    <XCircle className="w-3.5 h-3.5" />{de ? 'Abgesagt' : 'Declined'}
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleRSVP(session.id, 'confirmed')} data-testid="rsvp-confirm" className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg font-rajdhani text-sm">
                      <CheckCircle className="w-3.5 h-3.5" />{de ? 'Zusagen' : 'Confirm'}
                    </button>
                    <button onClick={() => handleRSVP(session.id, 'declined')} data-testid="rsvp-decline" className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white rounded-lg font-rajdhani text-sm">
                      <XCircle className="w-3.5 h-3.5" />{de ? 'Absagen' : 'Decline'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { Navigate } from 'react-router-dom';
import { Home, Calendar, MessageCircle, StickyNote, Dumbbell, User, Users, Eye } from 'lucide-react';
import DashboardTab from './DashboardTab';
import MessagesTab from './MessagesTab';
import NotesTab from './NotesTab';
import TrainingPlanTab from './TrainingPlanTab';
import ProfileTab from './ProfileTab';
import TrainerSessionsTab from './TrainerSessionsTab';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MemberApp() {
  const { user, loading, getAuthHeaders } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const de = language === 'de';

  useEffect(() => {
    if (!user) return;
    const headers = getAuthHeaders();
    axios.get(`${API}/messages/conversations`, { headers })
      .then(res => {
        const total = res.data.reduce((sum, c) => sum + (c.unread || 0), 0);
        setUnreadMessages(total);
      }).catch(() => {});
  }, [user, getAuthHeaders, activeTab]);

  if (loading) return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;

  const isTrainer = user.role === 'trainer';

  const tabs = isTrainer ? [
    { id: 'dashboard', icon: Home, label: de ? 'Start' : 'Home' },
    { id: 'sessions', icon: Calendar, label: de ? 'Trainings' : 'Sessions' },
    { id: 'plans', icon: Dumbbell, label: de ? 'Pläne' : 'Plans' },
    { id: 'messages', icon: MessageCircle, label: de ? 'Chat' : 'Chat', badge: unreadMessages },
    { id: 'profile', icon: User, label: de ? 'Profil' : 'Profile' },
  ] : [
    { id: 'dashboard', icon: Home, label: de ? 'Start' : 'Home' },
    { id: 'plans', icon: Dumbbell, label: de ? 'Pläne' : 'Plans' },
    { id: 'messages', icon: MessageCircle, label: de ? 'Chat' : 'Chat', badge: unreadMessages },
    { id: 'notes', icon: StickyNote, label: de ? 'Notizen' : 'Notes' },
    { id: 'profile', icon: User, label: de ? 'Profil' : 'Profile' },
  ];

  return (
    <div data-testid="member-app" className="min-h-screen bg-obsidian flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-obsidian/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-2.5">
          <img src="/logo-200.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div>
            <span className="font-teko text-base text-white uppercase leading-none">Headlock</span>
            <span className="font-teko text-base text-gold uppercase ml-1 leading-none">HQ</span>
          </div>
        </div>
        <span className="font-rajdhani text-gray-500 text-xs capitalize">{user.role === 'trainer' ? 'Trainer' : (de ? 'Schüler' : 'Student')}</span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-24">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'sessions' && isTrainer && <TrainerSessionsTab />}
        {activeTab === 'plans' && <TrainingPlanTab />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* Bottom Navigation */}
      <nav data-testid="bottom-nav" className="fixed bottom-0 inset-x-0 z-50 bg-charcoal/95 backdrop-blur-sm border-t border-white/10 safe-area-bottom">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              data-testid={`nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 relative transition-colors ${
                activeTab === tab.id ? 'text-gold' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <tab.icon className="w-5 h-5" />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-gold text-obsidian text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="font-rajdhani text-[10px] leading-tight">{tab.label}</span>
              {activeTab === tab.id && <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

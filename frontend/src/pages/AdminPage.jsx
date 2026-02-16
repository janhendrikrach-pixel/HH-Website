import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ImageUpload } from '../components/ImageUpload';
import { 
  Users, Calendar, Image, Mail, Settings, LogOut, Plus, Trash2, Edit, Eye, 
  CheckCircle, XCircle, Clock, LayoutDashboard, Menu, X, Instagram, Code
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [trainers, setTrainers] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [instagram, setInstagram] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  // Form states
  const [editingItem, setEditingItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getAuthHeader = () => {
    const auth = btoa(`${credentials.username}:${credentials.password}`);
    return { Authorization: `Basic ${auth}` };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await axios.get(`${API}/admin/verify`, { headers: getAuthHeader() });
      setIsAuthenticated(true);
      fetchAllData();
    } catch (error) {
      setAuthError(language === 'de' ? 'Ungültige Anmeldedaten' : 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCredentials({ username: '', password: '' });
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const [trainersRes, scheduleRes, galleryRes, bookingsRes, contactsRes, instagramRes, settingsRes] = await Promise.all([
        axios.get(`${API}/admin/trainers`, { headers }),
        axios.get(`${API}/admin/schedule`, { headers }),
        axios.get(`${API}/admin/gallery`, { headers }),
        axios.get(`${API}/admin/bookings`, { headers }),
        axios.get(`${API}/admin/contacts`, { headers }),
        axios.get(`${API}/admin/instagram`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/settings`)
      ]);
      setTrainers(trainersRes.data);
      setSchedule(scheduleRes.data);
      setGallery(galleryRes.data);
      setBookings(bookingsRes.data);
      setContacts(contactsRes.data);
      setInstagram(instagramRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      await axios.post(`${API}/admin/seed`, {}, { headers: getAuthHeader() });
      fetchAllData();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  // CRUD Operations
  const handleDelete = async (type, id) => {
    if (!window.confirm(language === 'de' ? 'Wirklich löschen?' : 'Really delete?')) return;
    try {
      await axios.delete(`${API}/admin/${type}/${id}`, { headers: getAuthHeader() });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await axios.put(`${API}/admin/bookings/${id}/status?status=${status}`, {}, { headers: getAuthHeader() });
      fetchAllData();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleMarkContactRead = async (id) => {
    try {
      await axios.put(`${API}/admin/contacts/${id}/read`, {}, { headers: getAuthHeader() });
      fetchAllData();
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
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

          <form onSubmit={handleLogin} className="bg-charcoal border border-white/5 p-8 space-y-6">
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

  // Admin Dashboard
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'trainers', icon: Users, label: language === 'de' ? 'Trainer' : 'Trainers' },
    { id: 'schedule', icon: Calendar, label: language === 'de' ? 'Trainingszeiten' : 'Schedule' },
    { id: 'gallery', icon: Image, label: language === 'de' ? 'Galerie' : 'Gallery' },
    { id: 'instagram', icon: Instagram, label: 'Instagram' },
    { id: 'bookings', icon: Clock, label: language === 'de' ? 'Buchungen' : 'Bookings' },
    { id: 'contacts', icon: Mail, label: language === 'de' ? 'Nachrichten' : 'Messages' },
    { id: 'settings', icon: Settings, label: language === 'de' ? 'Einstellungen' : 'Settings' },
  ];

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-obsidian flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-charcoal border-r border-white/5 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded flex items-center justify-center">
              <span className="font-teko text-xl text-black font-bold">HH</span>
            </div>
            <span className="font-teko text-xl text-white uppercase">Admin</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              data-testid={`admin-nav-${item.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 font-rajdhani text-sm transition-colors duration-300 ${
                activeTab === item.id 
                  ? 'bg-gold/10 text-gold border-l-2 border-gold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="w-full flex items-center gap-3 px-4 py-3 font-rajdhani text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-300"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-charcoal border-b border-white/5 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="font-teko text-2xl text-white uppercase">
            {navItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-rajdhani text-gray-400 text-sm hidden sm:block">
              {credentials.username}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-charcoal border border-white/5 p-6">
                      <Users className="w-8 h-8 text-gold mb-4" />
                      <p className="font-teko text-3xl text-white">{trainers.length}</p>
                      <p className="font-rajdhani text-gray-400 text-sm">Trainer</p>
                    </div>
                    <div className="bg-charcoal border border-white/5 p-6">
                      <Clock className="w-8 h-8 text-gold mb-4" />
                      <p className="font-teko text-3xl text-white">{bookings.filter(b => b.status === 'pending').length}</p>
                      <p className="font-rajdhani text-gray-400 text-sm">{language === 'de' ? 'Offene Buchungen' : 'Pending Bookings'}</p>
                    </div>
                    <div className="bg-charcoal border border-white/5 p-6">
                      <Mail className="w-8 h-8 text-gold mb-4" />
                      <p className="font-teko text-3xl text-white">{contacts.filter(c => !c.is_read).length}</p>
                      <p className="font-rajdhani text-gray-400 text-sm">{language === 'de' ? 'Ungelesene Nachrichten' : 'Unread Messages'}</p>
                    </div>
                    <div className="bg-charcoal border border-white/5 p-6">
                      <Image className="w-8 h-8 text-gold mb-4" />
                      <p className="font-teko text-3xl text-white">{gallery.length}</p>
                      <p className="font-rajdhani text-gray-400 text-sm">{language === 'de' ? 'Galerie Bilder' : 'Gallery Images'}</p>
                    </div>
                  </div>

                  {trainers.length === 0 && (
                    <div className="bg-charcoal border border-white/5 p-8 text-center">
                      <p className="font-rajdhani text-gray-400 mb-4">
                        {language === 'de' ? 'Keine Daten vorhanden. Möchten Sie Beispieldaten laden?' : 'No data available. Would you like to load sample data?'}
                      </p>
                      <Button
                        onClick={seedData}
                        data-testid="seed-data-btn"
                        className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
                      >
                        {language === 'de' ? 'Beispieldaten laden' : 'Load Sample Data'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Gallery Management */}
              {activeTab === 'gallery' && (
                <GalleryManager
                  gallery={gallery}
                  onDelete={(id) => handleDelete('gallery', id)}
                  onRefresh={fetchAllData}
                  getAuthHeader={getAuthHeader}
                  language={language}
                />
              )}

              {/* Bookings */}
              {activeTab === 'bookings' && (
                <div className="bg-charcoal border border-white/5 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Name' : 'Name'}</TableHead>
                        <TableHead className="text-gold font-teko uppercase">Email</TableHead>
                        <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Datum' : 'Date'}</TableHead>
                        <TableHead className="text-gold font-teko uppercase">Status</TableHead>
                        <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Aktionen' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id} className="border-white/5">
                          <TableCell className="font-rajdhani text-white">
                            {booking.first_name} {booking.last_name}
                          </TableCell>
                          <TableCell className="font-rajdhani text-gray-400">{booking.email}</TableCell>
                          <TableCell className="font-rajdhani text-gray-400">{booking.preferred_date}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs font-rajdhani ${
                              booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                              booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {booking.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                className="p-1 text-green-400 hover:text-green-300"
                                title="Confirm"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                className="p-1 text-red-400 hover:text-red-300"
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete('bookings', booking.id)}
                                className="p-1 text-gray-400 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {bookings.length === 0 && (
                    <p className="text-center text-gray-500 font-rajdhani py-8">
                      {language === 'de' ? 'Keine Buchungen vorhanden' : 'No bookings yet'}
                    </p>
                  )}
                </div>
              )}

              {/* Contacts */}
              {activeTab === 'contacts' && (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`bg-charcoal border p-6 ${contact.is_read ? 'border-white/5' : 'border-gold/30'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-teko text-xl text-white">{contact.name}</h4>
                          <p className="font-rajdhani text-gold text-sm">{contact.email}</p>
                        </div>
                        <div className="flex gap-2">
                          {!contact.is_read && (
                            <button
                              onClick={() => handleMarkContactRead(contact.id)}
                              className="p-2 text-green-400 hover:text-green-300"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete('contacts', contact.id)}
                            className="p-2 text-gray-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="font-rajdhani text-gray-300">{contact.message}</p>
                      <p className="font-rajdhani text-gray-500 text-sm mt-4">
                        {new Date(contact.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-center text-gray-500 font-rajdhani py-8">
                      {language === 'de' ? 'Keine Nachrichten vorhanden' : 'No messages yet'}
                    </p>
                  )}
                </div>
              )}

              {/* Trainers */}
              {activeTab === 'trainers' && (
                <TrainersManager
                  trainers={trainers}
                  onDelete={(id) => handleDelete('trainers', id)}
                  onRefresh={fetchAllData}
                  getAuthHeader={getAuthHeader}
                  language={language}
                />
              )}

              {/* Schedule */}
              {activeTab === 'schedule' && (
                <ScheduleManager
                  schedule={schedule}
                  onDelete={(id) => handleDelete('schedule', id)}
                  onRefresh={fetchAllData}
                  getAuthHeader={getAuthHeader}
                  language={language}
                />
              )}

              {/* Instagram */}
              {activeTab === 'instagram' && (
                <InstagramManager
                  posts={instagram}
                  onDelete={(id) => handleDelete('instagram', id)}
                  onRefresh={fetchAllData}
                  getAuthHeader={getAuthHeader}
                  language={language}
                />
              )}

              {/* Settings */}
              {activeTab === 'settings' && (
                <SettingsManager
                  settings={settings}
                  onRefresh={fetchAllData}
                  getAuthHeader={getAuthHeader}
                  language={language}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Gallery Manager Component
function GalleryManager({ gallery, onDelete, onRefresh, getAuthHeader, language }) {
  const [newImage, setNewImage] = useState({ url: '', title: '', category: 'training', order: 0 });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    try {
      await axios.post(`${API}/admin/gallery`, newImage, { headers: getAuthHeader() });
      setNewImage({ url: '', title: '', category: 'training', order: 0 });
      setIsAdding(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding image:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-teko text-2xl text-white uppercase">
          {language === 'de' ? 'Galerie verwalten' : 'Manage Gallery'}
        </h2>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            data-testid="add-gallery-btn"
            className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'de' ? 'Bild hinzufügen' : 'Add Image'}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-charcoal border border-white/5 p-6 space-y-4">
          <ImageUpload
            value={newImage.url}
            onChange={(url) => setNewImage(prev => ({ ...prev, url }))}
            category="gallery"
            getAuthHeader={getAuthHeader}
            label={language === 'de' ? 'Bild hochladen oder URL eingeben' : 'Upload image or enter URL'}
          />
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">
              {language === 'de' ? 'Titel' : 'Title'}
            </Label>
            <Input
              placeholder={language === 'de' ? 'Bildtitel' : 'Image title'}
              value={newImage.title}
              onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
              className="bg-obsidian border-white/10 text-white rounded-none"
            />
          </div>
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">
              {language === 'de' ? 'Kategorie' : 'Category'}
            </Label>
            <Select
              value={newImage.category}
              onValueChange={(value) => setNewImage(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="bg-obsidian border-white/10 text-white rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-charcoal border-white/10">
                <SelectItem value="training" className="text-white">Training</SelectItem>
                <SelectItem value="facility" className="text-white">Facility</SelectItem>
                <SelectItem value="event" className="text-white">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={handleAdd} 
              disabled={!newImage.url}
              className="bg-gold text-black font-teko uppercase"
            >
              {language === 'de' ? 'Speichern' : 'Save'}
            </Button>
            <Button 
              onClick={() => { setIsAdding(false); setNewImage({ url: '', title: '', category: 'training', order: 0 }); }} 
              variant="outline" 
              className="border-white/20 text-white font-teko uppercase hover:bg-white/5"
            >
              {language === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((image) => (
          <div key={image.id} className="relative group">
            <img src={image.url} alt={image.title} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => onDelete(image.id)}
                className="p-2 bg-red-500 text-white rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="font-rajdhani text-white text-sm mt-2">{image.title}</p>
            <span className="font-rajdhani text-gray-500 text-xs">{image.category}</span>
          </div>
        ))}
      </div>
      {gallery.length === 0 && (
        <p className="text-center text-gray-500 font-rajdhani py-8">
          {language === 'de' ? 'Keine Bilder vorhanden' : 'No images yet'}
        </p>
      )}
    </div>
  );
}

// Trainers Manager Component
function TrainersManager({ trainers, onDelete, onRefresh, getAuthHeader, language }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio_de: '',
    bio_en: '',
    image_url: '',
    years_experience: 0,
    achievements: []
  });
  const [achievementInput, setAchievementInput] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      bio_de: '',
      bio_en: '',
      image_url: '',
      years_experience: 0,
      achievements: []
    });
    setAchievementInput('');
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      title: trainer.title,
      bio_de: trainer.bio_de,
      bio_en: trainer.bio_en,
      image_url: trainer.image_url,
      years_experience: trainer.years_experience,
      achievements: trainer.achievements || []
    });
    setIsAdding(true);
  };

  const handleAddAchievement = () => {
    if (achievementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()]
      }));
      setAchievementInput('');
    }
  };

  const handleRemoveAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      if (editingTrainer) {
        await axios.put(`${API}/admin/trainers/${editingTrainer.id}`, formData, { headers: getAuthHeader() });
      } else {
        await axios.post(`${API}/admin/trainers`, formData, { headers: getAuthHeader() });
      }
      resetForm();
      setIsAdding(false);
      setEditingTrainer(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving trainer:', error);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsAdding(false);
    setEditingTrainer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-teko text-2xl text-white uppercase">
          {language === 'de' ? 'Trainer verwalten' : 'Manage Trainers'}
        </h2>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            data-testid="add-trainer-btn"
            className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'de' ? 'Trainer hinzufügen' : 'Add Trainer'}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-charcoal border border-white/5 p-6 space-y-4">
          <h3 className="font-teko text-xl text-gold">
            {editingTrainer 
              ? (language === 'de' ? 'Trainer bearbeiten' : 'Edit Trainer')
              : (language === 'de' ? 'Neuer Trainer' : 'New Trainer')
            }
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Leon van Gasteren"
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Titel *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. Head Coach"
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              category="trainers"
              getAuthHeader={getAuthHeader}
              label={language === 'de' ? 'Trainer-Foto *' : 'Trainer Photo *'}
            />
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                {language === 'de' ? 'Jahre Erfahrung' : 'Years Experience'} *
              </Label>
              <Input
                type="number"
                value={formData.years_experience}
                onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
          </div>

          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">Bio (Deutsch) *</Label>
            <Textarea
              value={formData.bio_de}
              onChange={(e) => setFormData(prev => ({ ...prev, bio_de: e.target.value }))}
              rows={3}
              placeholder="Biografie auf Deutsch..."
              className="bg-obsidian border-white/10 text-white rounded-none resize-none"
            />
          </div>

          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">Bio (English) *</Label>
            <Textarea
              value={formData.bio_en}
              onChange={(e) => setFormData(prev => ({ ...prev, bio_en: e.target.value }))}
              rows={3}
              placeholder="Biography in English..."
              className="bg-obsidian border-white/10 text-white rounded-none resize-none"
            />
          </div>

          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">
              {language === 'de' ? 'Erfolge/Auszeichnungen' : 'Achievements'}
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
                placeholder={language === 'de' ? 'z.B. Newcomer des Jahres 1999' : 'e.g. Newcomer of the Year 1999'}
                className="bg-obsidian border-white/10 text-white rounded-none flex-1"
              />
              <Button 
                type="button"
                onClick={handleAddAchievement}
                className="bg-gold/20 text-gold hover:bg-gold/30"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.achievements.map((achievement, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-obsidian border border-gold/20 text-sm font-rajdhani text-gray-300"
                >
                  {achievement}
                  <button 
                    onClick={() => handleRemoveAchievement(index)}
                    className="ml-1 text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={!formData.name || !formData.title || !formData.image_url}
              className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
            >
              {language === 'de' ? 'Speichern' : 'Save'}
            </Button>
            <Button 
              onClick={handleCancel} 
              variant="outline" 
              className="border-white/20 text-white font-teko uppercase hover:bg-white/5"
            >
              {language === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}

      {!isAdding && (
        <div className="bg-charcoal border border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-gold font-teko uppercase">
                  {language === 'de' ? 'Bild' : 'Image'}
                </TableHead>
                <TableHead className="text-gold font-teko uppercase">Name</TableHead>
                <TableHead className="text-gold font-teko uppercase">
                  {language === 'de' ? 'Titel' : 'Title'}
                </TableHead>
                <TableHead className="text-gold font-teko uppercase">
                  {language === 'de' ? 'Erfahrung' : 'Experience'}
                </TableHead>
                <TableHead className="text-gold font-teko uppercase">
                  {language === 'de' ? 'Aktionen' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer) => (
                <TableRow key={trainer.id} className="border-white/5">
                  <TableCell>
                    <img src={trainer.image_url} alt={trainer.name} className="w-12 h-12 object-cover" />
                  </TableCell>
                  <TableCell className="font-rajdhani text-white">{trainer.name}</TableCell>
                  <TableCell className="font-rajdhani text-gray-400">{trainer.title}</TableCell>
                  <TableCell className="font-rajdhani text-gray-400">
                    {trainer.years_experience} {language === 'de' ? 'Jahre' : 'years'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(trainer)}
                        className="p-1 text-gold hover:text-gold-glow"
                        title={language === 'de' ? 'Bearbeiten' : 'Edit'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(trainer.id)}
                        className="p-1 text-gray-400 hover:text-red-400"
                        title={language === 'de' ? 'Löschen' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {trainers.length === 0 && (
            <p className="text-center text-gray-500 font-rajdhani py-8">
              {language === 'de' ? 'Keine Trainer vorhanden' : 'No trainers yet'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Schedule Manager Component
function ScheduleManager({ schedule, onDelete, onRefresh, getAuthHeader, language }) {
  return (
    <div className="bg-charcoal border border-white/5 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Tag' : 'Day'}</TableHead>
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Zeit' : 'Time'}</TableHead>
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Titel' : 'Title'}</TableHead>
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Aktionen' : 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((item) => (
            <TableRow key={item.id} className="border-white/5">
              <TableCell className="font-rajdhani text-white">{language === 'de' ? item.day_de : item.day_en}</TableCell>
              <TableCell className="font-rajdhani text-gray-400">{item.time_start} - {item.time_end}</TableCell>
              <TableCell className="font-rajdhani text-gray-400">{language === 'de' ? item.title_de : item.title_en}</TableCell>
              <TableCell>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Settings Manager Component
function SettingsManager({ settings, onRefresh, getAuthHeader, language }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings`, form, { headers: getAuthHeader() });
      onRefresh();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-charcoal border border-white/5 p-6 space-y-6 max-w-2xl">
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Adresse' : 'Address'}</Label>
        <Input
          value={form.address || ''}
          onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Telefon' : 'Phone'}</Label>
        <Input
          value={form.phone || ''}
          onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">Email</Label>
        <Input
          value={form.email || ''}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Öffnungszeiten (DE)' : 'Opening Hours (DE)'}</Label>
        <Input
          value={form.opening_hours_de || ''}
          onChange={(e) => setForm(prev => ({ ...prev, opening_hours_de: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Öffnungszeiten (EN)' : 'Opening Hours (EN)'}</Label>
        <Input
          value={form.opening_hours_en || ''}
          onChange={(e) => setForm(prev => ({ ...prev, opening_hours_en: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
      >
        {saving ? 'Saving...' : (language === 'de' ? 'Speichern' : 'Save')}
      </Button>
    </div>
  );
}

// Instagram Manager Component
function InstagramManager({ posts, onDelete, onRefresh, getAuthHeader, language }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    post_url: '',
    thumbnail_url: '',
    caption: '',
    post_type: 'image',
    is_story: false,
    story_expires_at: '',
    is_active: true,
    order: 0
  });

  const resetForm = () => {
    setFormData({
      post_url: '',
      thumbnail_url: '',
      caption: '',
      post_type: 'image',
      is_story: false,
      story_expires_at: '',
      is_active: true,
      order: 0
    });
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      post_url: post.post_url,
      thumbnail_url: post.thumbnail_url || '',
      caption: post.caption || '',
      post_type: post.post_type || 'image',
      is_story: post.is_story || false,
      story_expires_at: post.story_expires_at || '',
      is_active: post.is_active !== false,
      order: post.order || 0
    });
    setIsAdding(true);
  };

  const handleSave = async () => {
    try {
      if (editingPost) {
        await axios.put(`${API}/admin/instagram/${editingPost.id}`, formData, { headers: getAuthHeader() });
      } else {
        await axios.post(`${API}/admin/instagram`, formData, { headers: getAuthHeader() });
      }
      resetForm();
      setIsAdding(false);
      setEditingPost(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving Instagram post:', error);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsAdding(false);
    setEditingPost(null);
  };

  const stories = posts.filter(p => p.is_story);
  const regularPosts = posts.filter(p => !p.is_story);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-teko text-2xl text-white uppercase">
            Instagram Feed
          </h2>
          <p className="font-rajdhani text-gray-400 text-sm">
            {language === 'de' 
              ? 'Füge Instagram-Posts und Stories hinzu, die auf der Website angezeigt werden.'
              : 'Add Instagram posts and stories to display on the website.'
            }
          </p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            data-testid="add-instagram-btn"
            className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'de' ? 'Post hinzufügen' : 'Add Post'}
          </Button>
        )}
      </div>

      {/* Story Alert */}
      {stories.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-4 rounded">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-teko text-lg text-white">
                {stories.length} {language === 'de' ? 'aktive Story(s)' : 'active story/stories'}
              </p>
              <p className="font-rajdhani text-gray-400 text-sm">
                {language === 'de' ? 'Stories werden mit einem Ring auf der Website angezeigt' : 'Stories are shown with a ring on the website'}
              </p>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-charcoal border border-white/5 p-6 space-y-4">
          <h3 className="font-teko text-xl text-gold">
            {editingPost 
              ? (language === 'de' ? 'Post bearbeiten' : 'Edit Post')
              : (language === 'de' ? 'Neuer Post' : 'New Post')
            }
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                Instagram Post URL *
              </Label>
              <Input
                value={formData.post_url}
                onChange={(e) => setFormData(prev => ({ ...prev, post_url: e.target.value }))}
                placeholder="https://www.instagram.com/p/..."
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                {language === 'de' ? 'Thumbnail URL (optional)' : 'Thumbnail URL (optional)'}
              </Label>
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                placeholder="https://..."
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
          </div>

          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">
              {language === 'de' ? 'Beschreibung (optional)' : 'Caption (optional)'}
            </Label>
            <Textarea
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              rows={2}
              placeholder={language === 'de' ? 'Kurze Beschreibung...' : 'Short description...'}
              className="bg-obsidian border-white/10 text-white rounded-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                {language === 'de' ? 'Post-Typ' : 'Post Type'}
              </Label>
              <Select
                value={formData.post_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, post_type: value }))}
              >
                <SelectTrigger className="bg-obsidian border-white/10 text-white rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-white/10">
                  <SelectItem value="image" className="text-white">Image</SelectItem>
                  <SelectItem value="video" className="text-white">Video</SelectItem>
                  <SelectItem value="reel" className="text-white">Reel</SelectItem>
                  <SelectItem value="carousel" className="text-white">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                {language === 'de' ? 'Reihenfolge' : 'Order'}
              </Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label className="font-rajdhani text-gray-400">
                {language === 'de' ? 'Aktiv' : 'Active'}
              </Label>
            </div>
          </div>

          {/* Story Toggle */}
          <div className="border border-purple-500/30 bg-purple-500/10 p-4 rounded">
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_story}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_story: checked }))}
              />
              <div>
                <Label className="font-rajdhani text-white">
                  {language === 'de' ? 'Als Story markieren' : 'Mark as Story'}
                </Label>
                <p className="font-rajdhani text-gray-400 text-sm">
                  {language === 'de' 
                    ? 'Stories werden mit einem farbigen Ring angezeigt'
                    : 'Stories are displayed with a colored ring'
                  }
                </p>
              </div>
            </div>
            
            {formData.is_story && (
              <div className="mt-4">
                <Label className="font-rajdhani text-gray-400 mb-2 block">
                  {language === 'de' ? 'Story läuft ab am (optional)' : 'Story expires at (optional)'}
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.story_expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, story_expires_at: e.target.value }))}
                  className="bg-obsidian border-white/10 text-white rounded-none max-w-xs"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={!formData.post_url}
              className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
            >
              {language === 'de' ? 'Speichern' : 'Save'}
            </Button>
            <Button 
              onClick={handleCancel} 
              variant="outline" 
              className="border-white/20 text-white font-teko uppercase hover:bg-white/5"
            >
              {language === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      {!isAdding && (
        <div className="space-y-6">
          {/* Stories Section */}
          {stories.length > 0 && (
            <div>
              <h3 className="font-teko text-xl text-purple-400 mb-4">Stories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {stories.map((post) => (
                  <div key={post.id} className="relative group">
                    <div className="aspect-square rounded-full p-1 bg-gradient-to-r from-purple-500 to-pink-500">
                      <div className="w-full h-full rounded-full bg-charcoal p-1">
                        <img 
                          src={post.thumbnail_url || 'https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=200'} 
                          alt={post.caption || 'Story'} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 bg-gold text-black rounded-full"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(post.id)}
                        className="p-2 bg-red-500 text-white rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {!post.is_active && (
                      <span className="absolute top-0 right-0 px-2 py-1 bg-red-500 text-white text-xs font-rajdhani rounded">
                        {language === 'de' ? 'Inaktiv' : 'Inactive'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          <div>
            <h3 className="font-teko text-xl text-gold mb-4">
              {language === 'de' ? 'Posts' : 'Posts'} ({regularPosts.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {regularPosts.map((post) => (
                <div key={post.id} className="relative group">
                  <div className="aspect-square bg-charcoal border border-white/5 overflow-hidden">
                    <img 
                      src={post.thumbnail_url || 'https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=400'} 
                      alt={post.caption || 'Instagram post'} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-black/70 text-white text-xs font-rajdhani uppercase">
                        {post.post_type}
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 text-white rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 bg-gold text-black rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(post.id)}
                      className="p-2 bg-red-500 text-white rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {!post.is_active && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-rajdhani">
                        {language === 'de' ? 'Inaktiv' : 'Inactive'}
                      </span>
                    </div>
                  )}
                  {post.caption && (
                    <p className="font-rajdhani text-gray-400 text-sm mt-2 line-clamp-2">{post.caption}</p>
                  )}
                </div>
              ))}
            </div>
            {regularPosts.length === 0 && (
              <p className="text-center text-gray-500 font-rajdhani py-8">
                {language === 'de' ? 'Keine Posts vorhanden' : 'No posts yet'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


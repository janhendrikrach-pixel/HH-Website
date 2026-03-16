import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Trash2, Edit, User, Eye, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function UserDetailView({ userId, getAuthHeader, language, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/users/${userId}/stats`, { headers: getAuthHeader() })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, getAuthHeader]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-red-400 font-rajdhani">{language === 'de' ? 'Benutzer nicht gefunden' : 'User not found'}</p>;

  const { stats, recent_sessions } = data;
  const rate = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" className="border-white/20 text-white font-rajdhani hover:bg-white/5">
        <ArrowLeft className="w-4 h-4 mr-2" />{language === 'de' ? 'Zurück' : 'Back'}
      </Button>

      <div className="bg-charcoal border border-white/5 p-6 flex items-center gap-6">
        <div className="w-20 h-20 bg-obsidian border-2 border-gold/30 rounded-full overflow-hidden shrink-0">
          {data.image_url ? <img src={data.image_url} alt={data.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-gold/50" /></div>}
        </div>
        <div className="flex-1">
          <h3 className="font-teko text-2xl text-white">{data.name}</h3>
          <p className="font-rajdhani text-gold text-sm">{data.email}</p>
          <div className="flex gap-4 mt-2">
            {data.phone && <span className="font-rajdhani text-gray-400 text-sm">{data.phone}</span>}
            <span className={`px-2 py-0.5 text-xs font-rajdhani ${data.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {data.is_active ? (language === 'de' ? 'Aktiv' : 'Active') : (language === 'de' ? 'Inaktiv' : 'Inactive')}
            </span>
            <span className="px-2 py-0.5 text-xs font-rajdhani bg-gold/20 text-gold uppercase">{data.role}</span>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.bio && (
          <div className="bg-charcoal border border-white/5 p-4">
            <p className="font-rajdhani text-gray-500 text-xs uppercase mb-1">{language === 'de' ? 'Über mich' : 'Bio'}</p>
            <p className="font-rajdhani text-white text-sm">{data.bio}</p>
          </div>
        )}
        {data.experience_level && (
          <div className="bg-charcoal border border-white/5 p-4">
            <p className="font-rajdhani text-gray-500 text-xs uppercase mb-1">{language === 'de' ? 'Erfahrungslevel' : 'Experience'}</p>
            <p className="font-rajdhani text-white text-sm">{data.experience_level}</p>
          </div>
        )}
        {data.emergency_contact && (
          <div className="bg-charcoal border border-white/5 p-4">
            <p className="font-rajdhani text-gray-500 text-xs uppercase mb-1">{language === 'de' ? 'Notfallkontakt' : 'Emergency Contact'}</p>
            <p className="font-rajdhani text-white text-sm">{data.emergency_contact}</p>
          </div>
        )}
        {data.weight_class && (
          <div className="bg-charcoal border border-white/5 p-4">
            <p className="font-rajdhani text-gray-500 text-xs uppercase mb-1">{language === 'de' ? 'Gewichtsklasse' : 'Weight Class'}</p>
            <p className="font-rajdhani text-white text-sm">{data.weight_class}</p>
          </div>
        )}
      </div>

      {/* Attendance Stats */}
      <div>
        <h4 className="font-teko text-xl text-gold mb-4">{language === 'de' ? 'Anwesenheitsstatistik' : 'Attendance Statistics'}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-charcoal border border-white/5 p-4 text-center">
            <p className="font-teko text-3xl text-white">{stats.total}</p>
            <p className="font-rajdhani text-gray-500 text-xs">{language === 'de' ? 'Gesamt' : 'Total'}</p>
          </div>
          <div className="bg-charcoal border border-green-500/20 p-4 text-center">
            <p className="font-teko text-3xl text-green-400">{stats.confirmed}</p>
            <p className="font-rajdhani text-gray-500 text-xs">{language === 'de' ? 'Zugesagt' : 'Confirmed'}</p>
          </div>
          <div className="bg-charcoal border border-red-500/20 p-4 text-center">
            <p className="font-teko text-3xl text-red-400">{stats.declined}</p>
            <p className="font-rajdhani text-gray-500 text-xs">{language === 'de' ? 'Abgesagt' : 'Declined'}</p>
          </div>
          <div className="bg-charcoal border border-gold/20 p-4 text-center">
            <p className="font-teko text-3xl text-gold">{rate}%</p>
            <p className="font-rajdhani text-gray-500 text-xs">{language === 'de' ? 'Teilnahmequote' : 'Attendance Rate'}</p>
          </div>
        </div>
        {stats.total > 0 && (
          <div className="mt-3 h-3 bg-obsidian border border-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-gold transition-all duration-500" style={{ width: `${rate}%` }} />
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      {recent_sessions.length > 0 && (
        <div>
          <h4 className="font-teko text-xl text-gold mb-4">{language === 'de' ? 'Letzte Trainings' : 'Recent Sessions'}</h4>
          <div className="bg-charcoal border border-white/5 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Datum' : 'Date'}</TableHead>
                  <TableHead className="text-gold font-teko uppercase">Coach</TableHead>
                  <TableHead className="text-gold font-teko uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_sessions.map((s, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="font-rajdhani text-white">{s.date}</TableCell>
                    <TableCell className="font-rajdhani text-gray-400">{s.coach_name || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-rajdhani ${
                        s.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : s.status === 'declined' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {s.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                        {s.status === 'declined' && <XCircle className="w-3 h-3" />}
                        {s.status === 'pending' && <Clock className="w-3 h-3" />}
                        {s.status === 'confirmed' ? (language === 'de' ? 'Zugesagt' : 'Confirmed') : s.status === 'declined' ? (language === 'de' ? 'Abgesagt' : 'Declined') : (language === 'de' ? 'Offen' : 'Pending')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

export function UsersManager({ getAuthHeader, language }) {
  const [users, setUsers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '' });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/users`, { headers: getAuthHeader() });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  }, [getAuthHeader]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSave = async () => {
    try {
      if (editingUser) {
        const updateData = { name: form.name, email: form.email, role: form.role, phone: form.phone };
        if (form.password) updateData.password = form.password;
        await axios.put(`${API}/admin/users/${editingUser.id}`, updateData, { headers: getAuthHeader() });
      } else {
        await axios.post(`${API}/admin/users`, form, { headers: getAuthHeader() });
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Fehler');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, phone: user.phone || '' });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'de' ? 'Benutzer wirklich löschen?' : 'Really delete user?')) return;
    await axios.delete(`${API}/admin/users/${id}`, { headers: getAuthHeader() });
    fetchUsers();
  };

  const handleToggleActive = async (user) => {
    await axios.put(`${API}/admin/users/${user.id}`, { is_active: !user.is_active }, { headers: getAuthHeader() });
    fetchUsers();
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'student', phone: '' });
    setIsAdding(false);
    setEditingUser(null);
  };

  // Detail View
  if (viewingUserId) {
    return <UserDetailView userId={viewingUserId} getAuthHeader={getAuthHeader} language={language} onBack={() => setViewingUserId(null)} />;
  }

  const students = users.filter(u => u.role === 'student');
  const trainers = users.filter(u => u.role === 'trainer');

  const UserTable = ({ userList, title }) => (
    <div>
      <h3 className="font-teko text-xl text-gold mb-3">{title} ({userList.length})</h3>
      <div className="bg-charcoal border border-white/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-gold font-teko uppercase">Name</TableHead>
              <TableHead className="text-gold font-teko uppercase">E-Mail</TableHead>
              <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Telefon' : 'Phone'}</TableHead>
              <TableHead className="text-gold font-teko uppercase">Status</TableHead>
              <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Aktionen' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.map(u => (
              <TableRow key={u.id} className="border-white/5">
                <TableCell className="font-rajdhani text-white flex items-center gap-2"><User className="w-4 h-4 text-gold" />{u.name}</TableCell>
                <TableCell className="font-rajdhani text-gray-400">{u.email}</TableCell>
                <TableCell className="font-rajdhani text-gray-400">{u.phone || '-'}</TableCell>
                <TableCell>
                  <button onClick={() => handleToggleActive(u)} className={`px-2 py-1 text-xs font-rajdhani cursor-pointer ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {u.is_active ? (language === 'de' ? 'Aktiv' : 'Active') : (language === 'de' ? 'Inaktiv' : 'Inactive')}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <button onClick={() => setViewingUserId(u.id)} className="p-1 text-gold hover:text-gold-glow" title={language === 'de' ? 'Details' : 'Details'}><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleEdit(u)} className="p-1 text-gray-400 hover:text-white" title={language === 'de' ? 'Bearbeiten' : 'Edit'}><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-1 text-gray-400 hover:text-red-400" title={language === 'de' ? 'Löschen' : 'Delete'}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {userList.length === 0 && <p className="text-center text-gray-500 font-rajdhani py-4">{language === 'de' ? 'Keine Einträge' : 'No entries'}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-teko text-2xl text-white uppercase">{language === 'de' ? 'Benutzer verwalten' : 'Manage Users'}</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} data-testid="add-user-btn" className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">
            <Plus className="w-4 h-4 mr-2" />{language === 'de' ? 'Benutzer anlegen' : 'Add User'}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-charcoal border border-white/5 p-6 space-y-4">
          <h3 className="font-teko text-xl text-gold">
            {editingUser ? (language === 'de' ? 'Benutzer bearbeiten' : 'Edit User') : (language === 'de' ? 'Neuer Benutzer' : 'New User')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm(p => ({...p, name: e.target.value}))} className="bg-obsidian border-white/10 text-white rounded-none" />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">E-Mail *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm(p => ({...p, email: e.target.value}))} className="bg-obsidian border-white/10 text-white rounded-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                {editingUser ? (language === 'de' ? 'Neues Passwort (optional)' : 'New Password (optional)') : `${language === 'de' ? 'Passwort' : 'Password'} *`}
              </Label>
              <Input type="password" value={form.password} onChange={(e) => setForm(p => ({...p, password: e.target.value}))} className="bg-obsidian border-white/10 text-white rounded-none" />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Rolle' : 'Role'} *</Label>
              <Select value={form.role} onValueChange={(v) => setForm(p => ({...p, role: v}))}>
                <SelectTrigger className="bg-obsidian border-white/10 text-white rounded-none"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-charcoal border-white/10">
                  <SelectItem value="student" className="text-white">{language === 'de' ? 'Schüler' : 'Student'}</SelectItem>
                  <SelectItem value="trainer" className="text-white">Trainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Telefon' : 'Phone'}</Label>
              <Input value={form.phone} onChange={(e) => setForm(p => ({...p, phone: e.target.value}))} className="bg-obsidian border-white/10 text-white rounded-none" />
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={!form.name || !form.email || (!editingUser && !form.password)} className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">{language === 'de' ? 'Speichern' : 'Save'}</Button>
            <Button onClick={resetForm} variant="outline" className="border-white/20 text-white font-teko uppercase hover:bg-white/5">{language === 'de' ? 'Abbrechen' : 'Cancel'}</Button>
          </div>
        </div>
      )}

      {!isAdding && (
        <>
          <UserTable userList={trainers} title="Trainer" />
          <UserTable userList={students} title={language === 'de' ? 'Schüler' : 'Students'} />
        </>
      )}
    </div>
  );
}

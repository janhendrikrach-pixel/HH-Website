import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Trash2, Edit, X, User } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function UsersManager({ getAuthHeader, language }) {
  const [users, setUsers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`, { headers: getAuthHeader() });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

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

  const students = users.filter(u => u.role === 'student');
  const trainers = users.filter(u => u.role === 'trainer');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-teko text-2xl text-white uppercase">
          {language === 'de' ? 'Benutzer verwalten' : 'Manage Users'}
        </h2>
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
                {editingUser ? (language === 'de' ? 'Neues Passwort (optional)' : 'New Password (optional)') : (language === 'de' ? 'Passwort' : 'Password')} *
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
          {/* Trainers */}
          <div>
            <h3 className="font-teko text-xl text-gold mb-3">Trainer ({trainers.length})</h3>
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
                  {trainers.map(u => (
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
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(u)} className="p-1 text-gold hover:text-gold-glow"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {trainers.length === 0 && <p className="text-center text-gray-500 font-rajdhani py-4">{language === 'de' ? 'Keine Trainer' : 'No trainers'}</p>}
            </div>
          </div>

          {/* Students */}
          <div>
            <h3 className="font-teko text-xl text-gold mb-3">{language === 'de' ? 'Schüler' : 'Students'} ({students.length})</h3>
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
                  {students.map(u => (
                    <TableRow key={u.id} className="border-white/5">
                      <TableCell className="font-rajdhani text-white">{u.name}</TableCell>
                      <TableCell className="font-rajdhani text-gray-400">{u.email}</TableCell>
                      <TableCell className="font-rajdhani text-gray-400">{u.phone || '-'}</TableCell>
                      <TableCell>
                        <button onClick={() => handleToggleActive(u)} className={`px-2 py-1 text-xs font-rajdhani cursor-pointer ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {u.is_active ? (language === 'de' ? 'Aktiv' : 'Active') : (language === 'de' ? 'Inaktiv' : 'Inactive')}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(u)} className="p-1 text-gold hover:text-gold-glow"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {students.length === 0 && <p className="text-center text-gray-500 font-rajdhani py-4">{language === 'de' ? 'Keine Schüler' : 'No students'}</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

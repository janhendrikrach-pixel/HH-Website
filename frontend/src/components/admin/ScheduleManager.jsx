import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DAYS = [
  { de: 'Montag', en: 'Monday' },
  { de: 'Dienstag', en: 'Tuesday' },
  { de: 'Mittwoch', en: 'Wednesday' },
  { de: 'Donnerstag', en: 'Thursday' },
  { de: 'Freitag', en: 'Friday' },
  { de: 'Samstag', en: 'Saturday' },
  { de: 'Sonntag', en: 'Sunday' },
];

const emptyForm = {
  day_de: 'Samstag', day_en: 'Saturday',
  time_start: '12:00', time_end: '16:00',
  title_de: '', title_en: '',
  description_de: '', description_en: '',
  is_active: true
};

export function ScheduleManager({ schedule, onDelete, onRefresh, getAuthHeader, language }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const handleDayChange = (dayDe) => {
    const match = DAYS.find(d => d.de === dayDe);
    setFormData(prev => ({ ...prev, day_de: dayDe, day_en: match?.en || dayDe }));
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      day_de: item.day_de, day_en: item.day_en,
      time_start: item.time_start, time_end: item.time_end,
      title_de: item.title_de, title_en: item.title_en,
      description_de: item.description_de || '', description_en: item.description_en || '',
      is_active: item.is_active !== false
    });
    setIsAdding(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await axios.put(`${API}/admin/schedule/${editingItem.id}`, formData, { headers: getAuthHeader() });
      } else {
        await axios.post(`${API}/admin/schedule`, formData, { headers: getAuthHeader() });
      }
      setFormData({ ...emptyForm });
      setIsAdding(false);
      setEditingItem(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving schedule item:', error);
    }
  };

  const handleCancel = () => {
    setFormData({ ...emptyForm });
    setIsAdding(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-teko text-2xl text-white uppercase">
          {language === 'de' ? 'Trainingszeiten verwalten' : 'Manage Schedule'}
        </h2>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            data-testid="add-schedule-btn"
            className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'de' ? 'Trainingszeit hinzufügen' : 'Add Schedule'}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-charcoal border border-white/5 p-6 space-y-4">
          <h3 className="font-teko text-xl text-gold">
            {editingItem
              ? (language === 'de' ? 'Trainingszeit bearbeiten' : 'Edit Schedule Entry')
              : (language === 'de' ? 'Neue Trainingszeit' : 'New Schedule Entry')
            }
          </h3>

          {/* Tag & Zeit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                {language === 'de' ? 'Tag' : 'Day'} *
              </Label>
              <Select value={formData.day_de} onValueChange={handleDayChange}>
                <SelectTrigger className="bg-obsidian border-white/10 text-white rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-white/10">
                  {DAYS.map(d => (
                    <SelectItem key={d.de} value={d.de} className="text-white">{d.de} / {d.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                {language === 'de' ? 'Startzeit' : 'Start Time'} *
              </Label>
              <Input
                type="time"
                value={formData.time_start}
                onChange={(e) => setFormData(prev => ({ ...prev, time_start: e.target.value }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                {language === 'de' ? 'Endzeit' : 'End Time'} *
              </Label>
              <Input
                type="time"
                value={formData.time_end}
                onChange={(e) => setFormData(prev => ({ ...prev, time_end: e.target.value }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
          </div>

          {/* Titel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Titel (Deutsch) *</Label>
              <Input
                value={formData.title_de}
                onChange={(e) => setFormData(prev => ({ ...prev, title_de: e.target.value }))}
                placeholder="z.B. Wöchentliches Training"
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Title (English) *</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                placeholder="e.g. Weekly Training"
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
          </div>

          {/* Beschreibung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">
                {language === 'de' ? 'Beschreibung (Deutsch)' : 'Description (German)'}
              </Label>
              <Textarea
                value={formData.description_de}
                onChange={(e) => setFormData(prev => ({ ...prev, description_de: e.target.value }))}
                rows={3}
                placeholder="Beschreibung des Trainings..."
                className="bg-obsidian border-white/10 text-white rounded-none resize-none"
              />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Description (English)</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                rows={3}
                placeholder="Training description..."
                className="bg-obsidian border-white/10 text-white rounded-none resize-none"
              />
            </div>
          </div>

          {/* Aktiv-Switch */}
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label className="font-rajdhani text-gray-400">
              {language === 'de' ? 'Aktiv (auf Website sichtbar)' : 'Active (visible on website)'}
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={!formData.title_de || !formData.title_en}
              data-testid="save-schedule-btn"
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

      {/* Tabelle */}
      {!isAdding && (
        <div className="bg-charcoal border border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Tag' : 'Day'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Zeit' : 'Time'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Titel' : 'Title'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Beschreibung' : 'Description'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">Status</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((item) => (
                <TableRow key={item.id} className="border-white/5">
                  <TableCell className="font-rajdhani text-white">{language === 'de' ? item.day_de : item.day_en}</TableCell>
                  <TableCell className="font-rajdhani text-gray-400">{item.time_start} - {item.time_end}</TableCell>
                  <TableCell className="font-rajdhani text-gray-400">{language === 'de' ? item.title_de : item.title_en}</TableCell>
                  <TableCell className="font-rajdhani text-gray-500 text-sm max-w-xs truncate">
                    {language === 'de' ? item.description_de : item.description_en}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-rajdhani ${
                      item.is_active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.is_active !== false
                        ? (language === 'de' ? 'Aktiv' : 'Active')
                        : (language === 'de' ? 'Inaktiv' : 'Inactive')
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-gold hover:text-gold-glow"
                        title={language === 'de' ? 'Bearbeiten' : 'Edit'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
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
          {schedule.length === 0 && (
            <p className="text-center text-gray-500 font-rajdhani py-8">
              {language === 'de' ? 'Keine Trainingszeiten vorhanden' : 'No schedule entries yet'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ImageUpload } from '../ImageUpload';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function TrainersManager({ trainers, onDelete, onRefresh, getAuthHeader, language }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', title: '', bio_de: '', bio_en: '',
    image_url: '', years_experience: 0, achievements: []
  });
  const [achievementInput, setAchievementInput] = useState('');

  const resetForm = () => {
    setFormData({ name: '', title: '', bio_de: '', bio_en: '', image_url: '', years_experience: 0, achievements: [] });
    setAchievementInput('');
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name, title: trainer.title, bio_de: trainer.bio_de, bio_en: trainer.bio_en,
      image_url: trainer.image_url, years_experience: trainer.years_experience, achievements: trainer.achievements || []
    });
    setIsAdding(true);
  };

  const handleAddAchievement = () => {
    if (achievementInput.trim()) {
      setFormData(prev => ({ ...prev, achievements: [...prev.achievements, achievementInput.trim()] }));
      setAchievementInput('');
    }
  };

  const handleRemoveAchievement = (index) => {
    setFormData(prev => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== index) }));
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
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Bild' : 'Image'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">Name</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Titel' : 'Title'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Erfahrung' : 'Experience'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Aktionen' : 'Actions'}</TableHead>
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

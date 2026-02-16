import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageUpload } from '../ImageUpload';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function GalleryManager({ gallery, onDelete, onRefresh, getAuthHeader, language }) {
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

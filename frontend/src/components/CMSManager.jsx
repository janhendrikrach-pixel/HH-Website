import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ImageUpload } from './ImageUpload';
import { 
  Plus, Trash2, Edit, GripVertical, FileText, Layout, Eye, EyeOff,
  ChevronUp, ChevronDown, Save, X, ExternalLink
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ==================== PAGES MANAGER ====================
export function PagesManager({ getAuthHeader, language }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    title_de: '',
    title_en: '',
    meta_description_de: '',
    meta_description_en: '',
    is_published: true,
    show_in_nav: true,
    nav_order: 0,
    template: 'default'
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API}/admin/pages`, { headers: getAuthHeader() });
      setPages(res.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '', title_de: '', title_en: '', meta_description_de: '', meta_description_en: '',
      is_published: true, show_in_nav: true, nav_order: 0, template: 'default'
    });
    setEditingPage(null);
    setIsAdding(false);
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title_de: page.title_de,
      title_en: page.title_en,
      meta_description_de: page.meta_description_de || '',
      meta_description_en: page.meta_description_en || '',
      is_published: page.is_published,
      show_in_nav: page.show_in_nav,
      nav_order: page.nav_order || 0,
      template: page.template || 'default'
    });
    setIsAdding(true);
  };

  const handleSave = async () => {
    try {
      if (editingPage) {
        await axios.put(`${API}/admin/pages/${editingPage.id}`, formData, { headers: getAuthHeader() });
      } else {
        await axios.post(`${API}/admin/pages`, formData, { headers: getAuthHeader() });
      }
      resetForm();
      fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      alert(error.response?.data?.detail || 'Error saving page');
    }
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm(language === 'de' ? 'Seite und alle Sektionen löschen?' : 'Delete page and all sections?')) return;
    try {
      await axios.delete(`${API}/admin/pages/${pageId}`, { headers: getAuthHeader() });
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-teko text-2xl text-white uppercase">
            {language === 'de' ? 'Seiten verwalten' : 'Manage Pages'}
          </h2>
          <p className="font-rajdhani text-gray-400 text-sm">
            {language === 'de' ? 'Erstelle und bearbeite Seiten für deine Website' : 'Create and edit pages for your website'}
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">
            <Plus className="w-4 h-4 mr-2" />
            {language === 'de' ? 'Neue Seite' : 'New Page'}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-charcoal border border-white/5 p-6 space-y-4">
          <h3 className="font-teko text-xl text-gold">
            {editingPage ? (language === 'de' ? 'Seite bearbeiten' : 'Edit Page') : (language === 'de' ? 'Neue Seite' : 'New Page')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Slug (URL) *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                placeholder="z.B. impressum, datenschutz"
                className="bg-obsidian border-white/10 text-white rounded-none"
                disabled={!!editingPage}
              />
              <p className="font-rajdhani text-gray-500 text-xs mt-1">
                URL: /page/{formData.slug || 'slug'}
              </p>
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Template</Label>
              <Select value={formData.template} onValueChange={(v) => setFormData(prev => ({ ...prev, template: v }))}>
                <SelectTrigger className="bg-obsidian border-white/10 text-white rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-white/10">
                  <SelectItem value="default" className="text-white">Default</SelectItem>
                  <SelectItem value="landing" className="text-white">Landing Page</SelectItem>
                  <SelectItem value="simple" className="text-white">Simple (nur Text)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Titel (Deutsch) *</Label>
              <Input
                value={formData.title_de}
                onChange={(e) => setFormData(prev => ({ ...prev, title_de: e.target.value }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Title (English) *</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Meta-Beschreibung (DE)</Label>
              <Textarea
                value={formData.meta_description_de}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description_de: e.target.value }))}
                rows={2}
                className="bg-obsidian border-white/10 text-white rounded-none resize-none"
              />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Meta Description (EN)</Label>
              <Textarea
                value={formData.meta_description_en}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description_en: e.target.value }))}
                rows={2}
                className="bg-obsidian border-white/10 text-white rounded-none resize-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch checked={formData.is_published} onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_published: c }))} />
              <Label className="font-rajdhani text-gray-400">{language === 'de' ? 'Veröffentlicht' : 'Published'}</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formData.show_in_nav} onCheckedChange={(c) => setFormData(prev => ({ ...prev, show_in_nav: c }))} />
              <Label className="font-rajdhani text-gray-400">{language === 'de' ? 'In Navigation' : 'Show in Nav'}</Label>
            </div>
            <div className="flex items-center gap-3">
              <Label className="font-rajdhani text-gray-400">{language === 'de' ? 'Nav-Reihenfolge' : 'Nav Order'}</Label>
              <Input
                type="number"
                value={formData.nav_order}
                onChange={(e) => setFormData(prev => ({ ...prev, nav_order: parseInt(e.target.value) || 0 }))}
                className="bg-obsidian border-white/10 text-white rounded-none w-20"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} disabled={!formData.slug || !formData.title_de} className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">
              <Save className="w-4 h-4 mr-2" />
              {language === 'de' ? 'Speichern' : 'Save'}
            </Button>
            <Button onClick={resetForm} variant="outline" className="border-white/20 text-white font-teko uppercase hover:bg-white/5">
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
                <TableHead className="text-gold font-teko uppercase">Slug</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Titel' : 'Title'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">Template</TableHead>
                <TableHead className="text-gold font-teko uppercase">Status</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id} className="border-white/5">
                  <TableCell className="font-rajdhani text-white">/{page.slug}</TableCell>
                  <TableCell className="font-rajdhani text-gray-400">{language === 'de' ? page.title_de : page.title_en}</TableCell>
                  <TableCell className="font-rajdhani text-gray-500">{page.template}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {page.is_published ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs">
                          {language === 'de' ? 'Aktiv' : 'Active'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs">
                          {language === 'de' ? 'Entwurf' : 'Draft'}
                        </span>
                      )}
                      {page.show_in_nav && (
                        <span className="px-2 py-1 bg-gold/20 text-gold text-xs">Nav</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleEdit(page)} className="p-1 text-gold hover:text-gold-glow">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(page.id)} className="p-1 text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pages.length === 0 && (
            <p className="text-center text-gray-500 font-rajdhani py-8">
              {language === 'de' ? 'Keine Seiten vorhanden' : 'No pages yet'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== SECTIONS MANAGER ====================
export function SectionsManager({ getAuthHeader, language, pageId = 'home' }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    section_type: 'custom',
    title_de: '',
    title_en: '',
    subtitle_de: '',
    subtitle_en: '',
    content_de: '',
    content_en: '',
    background_image: '',
    background_color: '',
    is_active: true,
    order: 0,
    settings: {}
  });

  const sectionTypes = [
    { value: 'hero', label: 'Hero Banner' },
    { value: 'about', label: 'Über uns / About' },
    { value: 'trainers', label: 'Trainer' },
    { value: 'schedule', label: 'Trainingszeiten' },
    { value: 'gallery', label: 'Galerie' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'reviews', label: 'Bewertungen' },
    { value: 'contact', label: 'Kontakt' },
    { value: 'text', label: 'Text-Block' },
    { value: 'cta', label: 'Call-to-Action' },
    { value: 'custom', label: 'Custom HTML' }
  ];

  useEffect(() => {
    fetchSections();
  }, [pageId]);

  const fetchSections = async () => {
    try {
      const res = await axios.get(`${API}/admin/sections/page/${pageId}`, { headers: getAuthHeader() });
      setSections(res.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const initHomepage = async () => {
    try {
      await axios.post(`${API}/admin/init-homepage`, {}, { headers: getAuthHeader() });
      fetchSections();
    } catch (error) {
      console.error('Error initializing homepage:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      section_type: 'custom', title_de: '', title_en: '', subtitle_de: '', subtitle_en: '',
      content_de: '', content_en: '', background_image: '', background_color: '',
      is_active: true, order: sections.length, settings: {}
    });
    setEditingSection(null);
    setIsAdding(false);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      section_type: section.section_type,
      title_de: section.title_de || '',
      title_en: section.title_en || '',
      subtitle_de: section.subtitle_de || '',
      subtitle_en: section.subtitle_en || '',
      content_de: section.content_de || '',
      content_en: section.content_en || '',
      background_image: section.background_image || '',
      background_color: section.background_color || '',
      is_active: section.is_active,
      order: section.order,
      settings: section.settings || {}
    });
    setIsAdding(true);
  };

  const handleSave = async () => {
    try {
      if (editingSection) {
        await axios.put(`${API}/admin/sections/${editingSection.id}`, formData, { headers: getAuthHeader() });
      } else {
        await axios.post(`${API}/admin/sections?page_id=${pageId}`, formData, { headers: getAuthHeader() });
      }
      resetForm();
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
    }
  };

  const handleDelete = async (sectionId) => {
    if (!window.confirm(language === 'de' ? 'Sektion löschen?' : 'Delete section?')) return;
    try {
      await axios.delete(`${API}/admin/sections/${sectionId}`, { headers: getAuthHeader() });
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const moveSection = async (index, direction) => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    const orders = newSections.map((s, i) => ({ id: s.id, order: i }));
    try {
      await axios.put(`${API}/admin/sections/reorder/${pageId}`, orders, { headers: getAuthHeader() });
      fetchSections();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const toggleActive = async (section) => {
    try {
      await axios.put(`${API}/admin/sections/${section.id}`, { ...section, is_active: !section.is_active }, { headers: getAuthHeader() });
      fetchSections();
    } catch (error) {
      console.error('Error toggling section:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-teko text-2xl text-white uppercase">
            {pageId === 'home' ? (language === 'de' ? 'Homepage Sektionen' : 'Homepage Sections') : 'Page Sections'}
          </h2>
          <p className="font-rajdhani text-gray-400 text-sm">
            {language === 'de' ? 'Bearbeite die Inhalte und Reihenfolge der Sektionen' : 'Edit content and order of sections'}
          </p>
        </div>
        <div className="flex gap-2">
          {sections.length === 0 && pageId === 'home' && (
            <Button onClick={initHomepage} variant="outline" className="border-gold/50 text-gold font-teko uppercase hover:bg-gold/10">
              {language === 'de' ? 'Standard laden' : 'Load Defaults'}
            </Button>
          )}
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'de' ? 'Sektion hinzufügen' : 'Add Section'}
            </Button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="bg-charcoal border border-white/5 p-6 space-y-4">
          <h3 className="font-teko text-xl text-gold">
            {editingSection ? (language === 'de' ? 'Sektion bearbeiten' : 'Edit Section') : (language === 'de' ? 'Neue Sektion' : 'New Section')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Sektionstyp' : 'Section Type'}</Label>
              <Select value={formData.section_type} onValueChange={(v) => setFormData(prev => ({ ...prev, section_type: v }))}>
                <SelectTrigger className="bg-obsidian border-white/10 text-white rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-white/10 max-h-60">
                  {sectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6 pt-6">
              <div className="flex items-center gap-3">
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_active: c }))} />
                <Label className="font-rajdhani text-gray-400">{language === 'de' ? 'Aktiv' : 'Active'}</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Titel (Deutsch)</Label>
              <Input
                value={formData.title_de}
                onChange={(e) => setFormData(prev => ({ ...prev, title_de: e.target.value }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Title (English)</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Untertitel (Deutsch)</Label>
              <Input
                value={formData.subtitle_de}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle_de: e.target.value }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Subtitle (English)</Label>
              <Input
                value={formData.subtitle_en}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle_en: e.target.value }))}
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
            </div>
          </div>

          {['text', 'about', 'custom', 'cta'].includes(formData.section_type) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-rajdhani text-gray-400 mb-2 block">Inhalt (Deutsch)</Label>
                <Textarea
                  value={formData.content_de}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_de: e.target.value }))}
                  rows={4}
                  className="bg-obsidian border-white/10 text-white rounded-none resize-none"
                />
              </div>
              <div>
                <Label className="font-rajdhani text-gray-400 mb-2 block">Content (English)</Label>
                <Textarea
                  value={formData.content_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                  rows={4}
                  className="bg-obsidian border-white/10 text-white rounded-none resize-none"
                />
              </div>
            </div>
          )}

          {['hero', 'about', 'cta'].includes(formData.section_type) && (
            <ImageUpload
              value={formData.background_image}
              onChange={(url) => setFormData(prev => ({ ...prev, background_image: url }))}
              category="pages"
              getAuthHeader={getAuthHeader}
              label={language === 'de' ? 'Hintergrundbild' : 'Background Image'}
            />
          )}

          {formData.section_type === 'hero' && (
            <div className="border border-gold/20 bg-gold/5 p-4 rounded space-y-4">
              <h4 className="font-teko text-lg text-gold">Hero-Einstellungen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-rajdhani text-gray-400 mb-2 block">CTA Button Text (DE)</Label>
                  <Input
                    value={formData.settings.cta_text_de || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, settings: { ...prev.settings, cta_text_de: e.target.value } }))}
                    placeholder="z.B. Probetraining buchen"
                    className="bg-obsidian border-white/10 text-white rounded-none"
                  />
                </div>
                <div>
                  <Label className="font-rajdhani text-gray-400 mb-2 block">CTA Button Text (EN)</Label>
                  <Input
                    value={formData.settings.cta_text_en || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, settings: { ...prev.settings, cta_text_en: e.target.value } }))}
                    placeholder="e.g. Book Trial Training"
                    className="bg-obsidian border-white/10 text-white rounded-none"
                  />
                </div>
              </div>
              <div>
                <Label className="font-rajdhani text-gray-400 mb-2 block">CTA Link</Label>
                <Input
                  value={formData.settings.cta_link || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, settings: { ...prev.settings, cta_link: e.target.value } }))}
                  placeholder="/booking"
                  className="bg-obsidian border-white/10 text-white rounded-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">
              <Save className="w-4 h-4 mr-2" />
              {language === 'de' ? 'Speichern' : 'Save'}
            </Button>
            <Button onClick={resetForm} variant="outline" className="border-white/20 text-white font-teko uppercase hover:bg-white/5">
              {language === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}

      {!isAdding && (
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`bg-charcoal border p-4 flex items-center gap-4 ${section.is_active ? 'border-white/5' : 'border-red-500/30 opacity-60'}`}
            >
              <div className="flex flex-col gap-1">
                <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 text-gray-500 hover:text-gold disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-1 text-gray-500 hover:text-gold disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-teko text-lg text-white">{section.title_de || section.section_type}</span>
                  <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs font-rajdhani uppercase">{section.section_type}</span>
                </div>
                {section.subtitle_de && (
                  <p className="font-rajdhani text-gray-500 text-sm">{section.subtitle_de}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(section)} className={`p-2 ${section.is_active ? 'text-green-400' : 'text-gray-500'}`}>
                  {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => handleEdit(section)} className="p-2 text-gold hover:text-gold-glow">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(section.id)} className="p-2 text-gray-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-center text-gray-500 font-rajdhani py-8">
              {language === 'de' ? 'Keine Sektionen vorhanden' : 'No sections yet'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

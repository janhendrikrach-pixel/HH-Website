import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { ImageUpload } from '../ImageUpload';
import { Plus, Trash2, Edit, Eye, Instagram, Image, Code } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function InstagramManager({ posts, onDelete, onRefresh, getAuthHeader, language }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    post_url: '', thumbnail_url: '', caption: '', post_type: 'image',
    is_story: false, story_expires_at: '', is_active: true, order: 0
  });

  const resetForm = () => {
    setFormData({
      post_url: '', thumbnail_url: '', caption: '', post_type: 'image',
      is_story: false, story_expires_at: '', is_active: true, order: 0
    });
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      post_url: post.post_url, thumbnail_url: post.thumbnail_url || '',
      caption: post.caption || '', post_type: post.post_type || 'image',
      is_story: post.is_story || false, story_expires_at: post.story_expires_at || '',
      is_active: post.is_active !== false, order: post.order || 0
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
          <h2 className="font-teko text-2xl text-white uppercase">Instagram Feed</h2>
          <p className="font-rajdhani text-gray-400 text-sm">
            {language === 'de'
              ? 'Füge Instagram-Posts und Stories hinzu, die auf der Website angezeigt werden.'
              : 'Add Instagram posts and stories to display on the website.'}
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
              : (language === 'de' ? 'Neuer Post' : 'New Post')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Instagram Post URL *</Label>
              <Input
                value={formData.post_url}
                onChange={(e) => setFormData(prev => ({ ...prev, post_url: e.target.value }))}
                placeholder="https://www.instagram.com/p/..."
                className="bg-obsidian border-white/10 text-white rounded-none"
              />
              <p className="font-rajdhani text-gray-500 text-xs mt-1">
                {language === 'de' ? 'Link zum Instagram-Post, Reel oder Video' : 'Link to Instagram post, reel or video'}
              </p>
            </div>
            <ImageUpload
              value={formData.thumbnail_url}
              onChange={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
              category="instagram"
              getAuthHeader={getAuthHeader}
              label={language === 'de' ? 'Thumbnail (optional)' : 'Thumbnail (optional)'}
            />
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
                {language === 'de' ? 'Anzeige-Typ' : 'Display Type'}
              </Label>
              <Select
                value={formData.post_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, post_type: value }))}
              >
                <SelectTrigger className="bg-obsidian border-white/10 text-white rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-white/10">
                  <SelectItem value="image" className="text-white">
                    <span className="flex items-center gap-2">
                      <Image className="w-4 h-4" /> {language === 'de' ? 'Bild (Thumbnail)' : 'Image (Thumbnail)'}
                    </span>
                  </SelectItem>
                  <SelectItem value="video" className="text-white">Video (Thumbnail)</SelectItem>
                  <SelectItem value="reel" className="text-white">Reel (Thumbnail)</SelectItem>
                  <SelectItem value="embed" className="text-white">
                    <span className="flex items-center gap-2">
                      <Code className="w-4 h-4" /> Embed (iFrame)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="font-rajdhani text-gray-500 text-xs mt-1">
                {formData.post_type === 'embed'
                  ? (language === 'de' ? 'Post wird als interaktives Instagram-Embed angezeigt' : 'Post is shown as interactive Instagram embed')
                  : (language === 'de' ? 'Post wird als Thumbnail mit Link angezeigt' : 'Post is shown as thumbnail with link')}
              </p>
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
                    : 'Stories are displayed with a colored ring'}
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

      {!isAdding && (
        <div className="space-y-6">
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
                      <button onClick={() => handleEdit(post)} className="p-2 bg-gold text-black rounded-full">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(post.id)} className="p-2 bg-red-500 text-white rounded-full">
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
                    <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 text-white rounded">
                      <Eye className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleEdit(post)} className="p-2 bg-gold text-black rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(post.id)} className="p-2 bg-red-500 text-white rounded">
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

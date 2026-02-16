import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ImageUpload = ({ 
  value, 
  onChange, 
  category = 'gallery',
  getAuthHeader,
  label = 'Bild',
  placeholder = 'Bild-URL oder hochladen'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Nur JPG, PNG, GIF oder WebP erlaubt');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Datei zu groß (max. 10MB)');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${API}/admin/upload/${category}`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Construct full URL
      const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
      onChange(fullUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="font-rajdhani text-gray-400">{label}</Label>
      
      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-obsidian border-white/10 text-white rounded-none flex-1"
        />
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            className="border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400/50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded transition-colors duration-200 ${
          dragOver 
            ? 'border-gold bg-gold/10' 
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="p-4 text-center">
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-gold">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-rajdhani">Wird hochgeladen...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-gray-500" />
              <span className="font-rajdhani text-sm text-gray-500">
                Bild hierher ziehen oder klicken
              </span>
              <span className="font-rajdhani text-xs text-gray-600">
                JPG, PNG, GIF, WebP (max. 10MB)
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="font-rajdhani text-sm text-red-400">{error}</p>
      )}
      
      {/* Preview */}
      {value && (
        <div className="relative w-24 h-24 border border-white/10 overflow-hidden">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

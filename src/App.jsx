import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { firebaseConfig, COLLECTIONS, STORAGE_PATHS } from './firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Icons component (inline SVG icons)
const Icons = {
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
  Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>,
  Edit: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Folder: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  FolderOpen: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v1M2 10h20"/></svg>,
  Image: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  Video: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Play: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Pause: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>,
  Code: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>,
  Copy: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>,
  Sun: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Moon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Eye: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Link: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  GripVertical: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Target: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  Clock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
};

// ============================================
// Utility Functions
// ============================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (date) => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================
// Components
// ============================================

// Toast Notification
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in flex items-center gap-2 z-50`}>
      {type === 'success' && <Icons.Check />}
      {message}
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl ${sizeClasses[size]} w-full mx-4 animate-fade-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <Icons.X />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Dropzone Component
const Dropzone = ({ onDrop, accept, multiple = true, children }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    onDrop(files);
  }, [onDrop]);

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    onDrop(files);
  };

  return (
    <div
      className={`dropzone ${isDragActive ? 'active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      {children}
    </div>
  );
};

// Slide Editor Component
const SlideEditor = ({ slide, onUpdate, onDelete, onAddHotspot }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(slide.caption || '');
  const [duration, setDuration] = useState(slide.duration || 5);
  const imageRef = useRef(null);

  const handleSave = () => {
    onUpdate({ ...slide, caption, duration });
    setIsEditing(false);
  };

  const handleImageClick = (e) => {
    if (!onAddHotspot) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAddHotspot(slide.id, { x, y, text: '' });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
      <div className="relative group">
        <img 
          ref={imageRef}
          src={slide.imageUrl} 
          alt={slide.caption || 'Slide'} 
          className="w-full h-48 object-cover cursor-crosshair"
          onClick={handleImageClick}
        />
        {slide.hotspots?.map((hotspot, idx) => (
          <div 
            key={idx}
            className="hotspot"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            title={hotspot.text}
          />
        ))}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow"
          >
            <Icons.Edit />
          </button>
          <button 
            onClick={() => onDelete(slide.id)}
            className="p-2 bg-white/90 hover:bg-red-50 text-red-500 rounded-lg shadow"
          >
            <Icons.Trash />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Icons.Clock />
          {duration}s
        </div>
      </div>
      
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="คำอธิบายสไลด์..."
              className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg resize-none h-20 dark:bg-slate-700"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">เวลา (วินาที):</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="1"
                max="60"
                className="w-20 px-2 py-1 border dark:border-slate-600 rounded dark:bg-slate-700"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn btn-primary text-sm">
                <Icons.Check /> บันทึก
              </button>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary text-sm">
                ยกเลิก
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {slide.caption || <span className="italic text-slate-400">ไม่มีคำอธิบาย</span>}
          </p>
        )}
      </div>
    </div>
  );
};

// Embed Code Generator
const EmbedCodeModal = ({ tutorial, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('500');
  const [autoplay, setAutoplay] = useState(false);

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const embedUrl = `${baseUrl}#/view/${tutorial?.id}?autoplay=${autoplay}`;
  
  const embedCode = `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}px" 
  frameborder="0" 
  style="border-radius: 12px; max-width: 100%;"
  allowfullscreen>
</iframe>`;

  const responsiveCode = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">
  <iframe 
    src="${embedUrl}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;"
    allowfullscreen>
  </iframe>
</div>`;

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="สร้าง Embed Code" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ความกว้าง</label>
            <input 
              type="text" 
              value={width} 
              onChange={(e) => setWidth(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ความสูง (px)</label>
            <input 
              type="number" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoplay} 
                onChange={(e) => setAutoplay(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Auto Play</span>
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Fixed Size Code</label>
            <button 
              onClick={() => handleCopy(embedCode)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {copied ? <Icons.Check /> : <Icons.Copy />}
              {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
            </button>
          </div>
          <pre className="code-block text-xs overflow-x-auto">{embedCode}</pre>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Responsive Code (แนะนำ)</label>
            <button 
              onClick={() => handleCopy(responsiveCode)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {copied ? <Icons.Check /> : <Icons.Copy />}
              {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
            </button>
          </div>
          <pre className="code-block text-xs overflow-x-auto">{responsiveCode}</pre>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Direct Link</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={embedUrl} 
              readOnly
              className="flex-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 text-sm"
            />
            <button 
              onClick={() => handleCopy(embedUrl)}
              className="btn btn-secondary"
            >
              <Icons.Copy />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Folder Manager
const FolderManager = ({ folders, selectedFolder, onSelect, onCreate, onDelete, onRename }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreate(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">โฟลเดอร์</h3>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        >
          <Icons.Plus />
        </button>
      </div>

      {isCreating && (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="ชื่อโฟลเดอร์..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button onClick={handleCreate} className="btn btn-primary text-sm px-3">
            <Icons.Check />
          </button>
          <button onClick={() => setIsCreating(false)} className="btn btn-secondary text-sm px-3">
            <Icons.X />
          </button>
        </div>
      )}

      <button
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          selectedFolder === null 
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <Icons.Folder />
        <span>ทั้งหมด</span>
      </button>

      {folders.map((folder) => (
        <div key={folder.id} className="group">
          {editingId === folder.id ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleRename(folder.id)}
              />
              <button onClick={() => handleRename(folder.id)} className="p-2 hover:bg-slate-100 rounded">
                <Icons.Check />
              </button>
              <button onClick={() => setEditingId(null)} className="p-2 hover:bg-slate-100 rounded">
                <Icons.X />
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              selectedFolder === folder.id 
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => onSelect(folder.id)}
            >
              {selectedFolder === folder.id ? <Icons.FolderOpen /> : <Icons.Folder />}
              <span className="flex-1 truncate">{folder.name}</span>
              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingId(folder.id); setEditName(folder.name); }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                >
                  <Icons.Edit />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(folder.id); }}
                  className="p-1 hover:bg-red-100 text-red-500 rounded"
                >
                  <Icons.Trash />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Tutorial Viewer (for embed)
const TutorialViewer = ({ tutorial, autoplay = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const timerRef = useRef(null);

  const slides = tutorial?.slides || [];
  const currentSlideData = slides[currentSlide];

  useEffect(() => {
    if (isPlaying && currentSlideData) {
      timerRef.current = setTimeout(() => {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, (currentSlideData.duration || 5) * 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentSlide, currentSlideData, slides.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setCurrentSlide(prev => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(prev => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  if (!tutorial) return <div className="p-8 text-center">ไม่พบคู่มือ</div>;

  return (
    <div className="embed-viewer">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 text-white">
        <h2 className="font-semibold">{tutorial.title}</h2>
      </div>

      {/* Image */}
      <div className="relative bg-slate-100">
        {currentSlideData && (
          <>
            <img 
              src={currentSlideData.imageUrl} 
              alt={`Slide ${currentSlide + 1}`}
              className="slide-image"
            />
            {currentSlideData.hotspots?.map((hotspot, idx) => (
              <div 
                key={idx}
                className="hotspot"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                title={hotspot.text}
              />
            ))}
          </>
        )}
      </div>

      {/* Caption */}
      {currentSlideData?.caption && (
        <div className="slide-caption">
          <p>{currentSlideData.caption}</p>
        </div>
      )}

      {/* Progress */}
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="controls">
        <button 
          onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
          disabled={currentSlide === 0}
          className="p-2 hover:bg-white/10 rounded disabled:opacity-30"
        >
          <Icons.ChevronLeft />
        </button>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 hover:bg-white/10 rounded"
          >
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>
          <span className="text-sm">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>

        <button 
          onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlide === slides.length - 1}
          className="p-2 hover:bg-white/10 rounded disabled:opacity-30"
        >
          <Icons.ChevronRight />
        </button>
      </div>
    </div>
  );
};

// Video Frame Extractor
const VideoFrameExtractor = ({ onExtract }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [frames, setFrames] = useState([]);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [frameCount, setFrameCount] = useState(10);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleVideoSelect = (files) => {
    const file = files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setFrames([]);
      setSelectedFrames([]);
    }
  };

  const extractFrames = async () => {
    if (!videoFile) return;
    setIsExtracting(true);
    setFrames([]);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    video.src = URL.createObjectURL(videoFile);
    
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });

    const duration = video.duration;
    const interval = duration / frameCount;
    const extractedFrames = [];

    for (let i = 0; i < frameCount; i++) {
      video.currentTime = i * interval;
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      extractedFrames.push({
        id: generateId(),
        dataUrl,
        time: i * interval
      });
    }

    setFrames(extractedFrames);
    setIsExtracting(false);
    URL.revokeObjectURL(video.src);
  };

  const toggleFrame = (frameId) => {
    setSelectedFrames(prev => 
      prev.includes(frameId) 
        ? prev.filter(id => id !== frameId)
        : [...prev, frameId]
    );
  };

  const handleConfirm = () => {
    const selected = frames.filter(f => selectedFrames.includes(f.id));
    onExtract(selected);
  };

  return (
    <div className="space-y-6">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {!videoFile ? (
        <Dropzone onDrop={handleVideoSelect} accept="video/*" multiple={false}>
          <div className="py-8">
            <Icons.Video />
            <p className="mt-2 font-medium">อัพโหลดวิดีโอ</p>
            <p className="text-sm text-slate-500">รองรับ MP4, WebM, MOV</p>
          </div>
        </Dropzone>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Icons.Video />
              <span className="font-medium">{videoFile.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                จำนวนเฟรม:
                <input 
                  type="number" 
                  value={frameCount} 
                  onChange={(e) => setFrameCount(Number(e.target.value))}
                  min="5"
                  max="30"
                  className="w-16 px-2 py-1 border rounded dark:bg-slate-600 dark:border-slate-500"
                />
              </label>
              <button 
                onClick={extractFrames}
                disabled={isExtracting}
                className="btn btn-primary"
              >
                {isExtracting ? 'กำลังแยกเฟรม...' : 'แยกเฟรม'}
              </button>
            </div>
          </div>

          {frames.length > 0 && (
            <>
              <p className="text-sm text-slate-500">
                เลือกเฟรมที่ต้องการ ({selectedFrames.length} เฟรมที่เลือก)
              </p>
              <div className="grid grid-cols-5 gap-3 max-h-96 overflow-y-auto p-2">
                {frames.map((frame) => (
                  <div 
                    key={frame.id}
                    onClick={() => toggleFrame(frame.id)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedFrames.includes(frame.id) 
                        ? 'border-primary-500 ring-2 ring-primary-200' 
                        : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={frame.dataUrl} alt="" className="w-full aspect-video object-cover" />
                    {selectedFrames.includes(frame.id) && (
                      <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                        <Icons.Check />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {Math.floor(frame.time)}s
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setSelectedFrames(frames.map(f => f.id))} className="btn btn-secondary">
                  เลือกทั้งหมด
                </button>
                <button onClick={() => setSelectedFrames([])} className="btn btn-secondary">
                  ยกเลือกทั้งหมด
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={selectedFrames.length === 0}
                  className="btn btn-primary"
                >
                  ใช้เฟรมที่เลือก ({selectedFrames.length})
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// Main App Component
// ============================================

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [tutorials, setTutorials] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showVideoExtractor, setShowVideoExtractor] = useState(false);
  
  // New tutorial form
  const [newTutorial, setNewTutorial] = useState({
    title: '',
    folderId: null,
    slides: []
  });

  // View mode (for embed)
  const [viewMode, setViewMode] = useState(null);

  // Check URL for view mode
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/view/')) {
      const id = hash.replace('#/view/', '').split('?')[0];
      setViewMode(id);
    }
  }, []);

  // Load data from Firebase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load folders
      const foldersSnap = await getDocs(collection(db, COLLECTIONS.FOLDERS));
      const foldersData = foldersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFolders(foldersData);

      // Load tutorials
      const tutorialsSnap = await getDocs(query(
        collection(db, COLLECTIONS.TUTORIALS),
        orderBy('createdAt', 'desc')
      ));
      const tutorialsData = tutorialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTutorials(tutorialsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Folder operations
  const createFolder = async (name) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.FOLDERS), {
        name,
        createdAt: serverTimestamp()
      });
      setFolders(prev => [...prev, { id: docRef.id, name }]);
      showToast('สร้างโฟลเดอร์สำเร็จ');
    } catch (error) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const renameFolder = async (id, name) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.FOLDERS, id), { name });
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
      showToast('เปลี่ยนชื่อสำเร็จ');
    } catch (error) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const deleteFolder = async (id) => {
    if (!confirm('ต้องการลบโฟลเดอร์นี้?')) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.FOLDERS, id));
      setFolders(prev => prev.filter(f => f.id !== id));
      if (selectedFolder === id) setSelectedFolder(null);
      showToast('ลบโฟลเดอร์สำเร็จ');
    } catch (error) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  // Tutorial operations
  const handleImageUpload = async (files) => {
    const newSlides = await Promise.all(
      files.map(async (file) => {
        // Upload to Firebase Storage
        const storageRef = ref(storage, `${STORAGE_PATHS.IMAGES}/${generateId()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);
        
        return {
          id: generateId(),
          imageUrl,
          caption: '',
          duration: 5,
          hotspots: []
        };
      })
    );

    setNewTutorial(prev => ({
      ...prev,
      slides: [...prev.slides, ...newSlides]
    }));
  };

  const handleVideoFrames = async (frames) => {
    const newSlides = await Promise.all(
      frames.map(async (frame) => {
        // Convert dataUrl to blob and upload
        const response = await fetch(frame.dataUrl);
        const blob = await response.blob();
        const storageRef = ref(storage, `${STORAGE_PATHS.IMAGES}/${generateId()}.jpg`);
        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);
        
        return {
          id: generateId(),
          imageUrl,
          caption: '',
          duration: 5,
          hotspots: []
        };
      })
    );

    setNewTutorial(prev => ({
      ...prev,
      slides: [...prev.slides, ...newSlides]
    }));
    setShowVideoExtractor(false);
  };

  const saveTutorial = async () => {
    if (!newTutorial.title.trim()) {
      showToast('กรุณาใส่ชื่อคู่มือ', 'error');
      return;
    }
    if (newTutorial.slides.length === 0) {
      showToast('กรุณาเพิ่มสไลด์อย่างน้อย 1 รายการ', 'error');
      return;
    }

    try {
      if (selectedTutorial) {
        // Update existing
        await updateDoc(doc(db, COLLECTIONS.TUTORIALS, selectedTutorial.id), {
          ...newTutorial,
          updatedAt: serverTimestamp()
        });
        setTutorials(prev => prev.map(t => 
          t.id === selectedTutorial.id ? { ...t, ...newTutorial } : t
        ));
        showToast('อัพเดทคู่มือสำเร็จ');
      } else {
        // Create new
        const docRef = await addDoc(collection(db, COLLECTIONS.TUTORIALS), {
          ...newTutorial,
          views: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setTutorials(prev => [{ id: docRef.id, ...newTutorial }, ...prev]);
        showToast('สร้างคู่มือสำเร็จ');
      }

      setShowCreateModal(false);
      setSelectedTutorial(null);
      setNewTutorial({ title: '', folderId: null, slides: [] });
    } catch (error) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const deleteTutorial = async (id) => {
    if (!confirm('ต้องการลบคู่มือนี้?')) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.TUTORIALS, id));
      setTutorials(prev => prev.filter(t => t.id !== id));
      showToast('ลบคู่มือสำเร็จ');
    } catch (error) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const editTutorial = (tutorial) => {
    setSelectedTutorial(tutorial);
    setNewTutorial({
      title: tutorial.title,
      folderId: tutorial.folderId,
      slides: tutorial.slides
    });
    setShowCreateModal(true);
  };

  const updateSlide = (updatedSlide) => {
    setNewTutorial(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === updatedSlide.id ? updatedSlide : s)
    }));
  };

  const deleteSlide = (slideId) => {
    setNewTutorial(prev => ({
      ...prev,
      slides: prev.slides.filter(s => s.id !== slideId)
    }));
  };

  const addHotspot = (slideId, hotspot) => {
    const text = prompt('ใส่คำอธิบาย hotspot:');
    if (!text) return;
    
    setNewTutorial(prev => ({
      ...prev,
      slides: prev.slides.map(s => 
        s.id === slideId 
          ? { ...s, hotspots: [...(s.hotspots || []), { ...hotspot, text }] }
          : s
      )
    }));
  };

  // Filter tutorials by folder
  const filteredTutorials = selectedFolder 
    ? tutorials.filter(t => t.folderId === selectedFolder)
    : tutorials;

  // If in view mode, show only the viewer
  if (viewMode) {
    const tutorial = tutorials.find(t => t.id === viewMode);
    return <TutorialViewer tutorial={tutorial} autoplay={window.location.hash.includes('autoplay=true')} />;
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b dark:border-slate-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold">
                T
              </div>
              <div>
                <h1 className="text-xl font-bold">Tutorial Builder</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">ระบบสร้างคู่มือการใช้งาน</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Icons.Plus /> สร้างคู่มือใหม่
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border dark:border-slate-700">
              <FolderManager
                folders={folders}
                selectedFolder={selectedFolder}
                onSelect={setSelectedFolder}
                onCreate={createFolder}
                onDelete={deleteFolder}
                onRename={renameFolder}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-500">กำลังโหลด...</p>
              </div>
            ) : filteredTutorials.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                <Icons.FileText />
                <h3 className="mt-4 font-semibold">ยังไม่มีคู่มือ</h3>
                <p className="text-slate-500 mt-1">คลิก "สร้างคู่มือใหม่" เพื่อเริ่มต้น</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTutorials.map((tutorial) => (
                  <div 
                    key={tutorial.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-700">
                      {tutorial.slides?.[0]?.imageUrl ? (
                        <img 
                          src={tutorial.slides[0].imageUrl} 
                          alt={tutorial.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Icons.Image />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button 
                          onClick={() => editTutorial(tutorial)}
                          className="p-3 bg-white rounded-full shadow-lg mx-1 hover:scale-110 transition-transform"
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          onClick={() => { setSelectedTutorial(tutorial); setShowEmbedModal(true); }}
                          className="p-3 bg-white rounded-full shadow-lg mx-1 hover:scale-110 transition-transform"
                        >
                          <Icons.Code />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {tutorial.slides?.length || 0} สไลด์
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">{tutorial.title}</h3>
                      <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Icons.Eye /> {tutorial.views || 0}
                        </span>
                        <span>{formatDate(tutorial.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Create/Edit Modal */}
        <Modal 
          isOpen={showCreateModal} 
          onClose={() => { setShowCreateModal(false); setSelectedTutorial(null); setNewTutorial({ title: '', folderId: null, slides: [] }); }}
          title={selectedTutorial ? 'แก้ไขคู่มือ' : 'สร้างคู่มือใหม่'}
          size="xl"
        >
          <div className="space-y-6">
            {/* Title & Folder */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อคู่มือ *</label>
                <input
                  type="text"
                  value={newTutorial.title}
                  onChange={(e) => setNewTutorial(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="เช่น วิธีใช้งานระบบลงทะเบียน"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">โฟลเดอร์</label>
                <select
                  value={newTutorial.folderId || ''}
                  onChange={(e) => setNewTutorial(prev => ({ ...prev, folderId: e.target.value || null }))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                >
                  <option value="">-- ไม่ระบุ --</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload Options */}
            <div className="flex gap-3">
              <Dropzone 
                onDrop={handleImageUpload} 
                accept="image/*"
                multiple={true}
              >
                <div className="flex items-center gap-3 py-2">
                  <Icons.Image />
                  <div className="text-left">
                    <p className="font-medium">อัพโหลดภาพ</p>
                    <p className="text-xs text-slate-500">รองรับ JPG, PNG, GIF</p>
                  </div>
                </div>
              </Dropzone>
              
              <button 
                onClick={() => setShowVideoExtractor(true)}
                className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center gap-3"
              >
                <Icons.Video />
                <div className="text-left">
                  <p className="font-medium">แยกเฟรมจากวิดีโอ</p>
                  <p className="text-xs text-slate-500">รองรับ MP4, WebM, MOV</p>
                </div>
              </button>
            </div>

            {/* Slides Preview */}
            {newTutorial.slides.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">สไลด์ ({newTutorial.slides.length})</h4>
                <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {newTutorial.slides.map((slide, index) => (
                    <div key={slide.id} className="relative">
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                        {index + 1}
                      </div>
                      <SlideEditor
                        slide={slide}
                        onUpdate={updateSlide}
                        onDelete={deleteSlide}
                        onAddHotspot={addHotspot}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
              <button 
                onClick={() => { setShowCreateModal(false); setSelectedTutorial(null); }}
                className="btn btn-secondary"
              >
                ยกเลิก
              </button>
              <button 
                onClick={saveTutorial}
                className="btn btn-primary"
              >
                <Icons.Check /> {selectedTutorial ? 'บันทึกการแก้ไข' : 'สร้างคู่มือ'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Video Extractor Modal */}
        <Modal 
          isOpen={showVideoExtractor} 
          onClose={() => setShowVideoExtractor(false)}
          title="แยกเฟรมจากวิดีโอ"
          size="xl"
        >
          <VideoFrameExtractor onExtract={handleVideoFrames} />
        </Modal>

        {/* Embed Code Modal */}
        <EmbedCodeModal 
          tutorial={selectedTutorial}
          isOpen={showEmbedModal}
          onClose={() => { setShowEmbedModal(false); setSelectedTutorial(null); }}
        />

        {/* Toast */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </div>
  );
}

export default App;

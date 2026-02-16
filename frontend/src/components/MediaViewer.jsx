import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, Plus, FolderPlus, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { collectionService } from '../services/api';

const MediaViewer = ({ media, currentIndex, onNavigate, onClose, collections, onAssign }) => {
    const [newCollectionName, setNewCollectionName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    
    // Video State
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true); // Auto-play by default
    const [isMuted, setIsMuted] = useState(false);

    // Safety check
    const file = media[currentIndex];
    if (!file) return null;

    const streamUrl = `http://localhost:8000/stream/${file.id}`;
    const isVideo = file.mime_type.startsWith('video');

    // --- Keyboard Navigation & Shortcuts ---
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'Escape') onClose();
        if (e.key === ' ' && isVideo) { 
            e.preventDefault();
            togglePlay(); 
        }
    }, [currentIndex, isVideo]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleNext = () => {
        if (currentIndex < media.length - 1) onNavigate(currentIndex + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) onNavigate(currentIndex - 1);
    };

    // --- Video Controls ---
    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    // --- Collection Logic ---
    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;
        setIsCreating(true);
        try {
            const res = await collectionService.create(newCollectionName);
            const newCol = res.data;
            await onAssign(file.id, newCol.id); // Auto-assign to new collection
            setNewCollectionName("");
        } catch (error) {
            console.error("Failed to create collection", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
            
            {/* CLOSE BUTTON */}
            <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition z-50 p-2 bg-black/20 rounded-full">
                <X size={24} />
            </button>

            {/* THE CARD */}
            <div className="bg-white w-full max-w-7xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row ring-1 ring-white/10">
                
                {/* LEFT: Media Player Area (Dark) */}
                <div className="flex-1 bg-black relative flex items-center justify-center group overflow-hidden">
                    
                    {/* Navigation Arrows (Hover Only) */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
                        disabled={currentIndex === 0}
                        className="absolute left-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition z-30 backdrop-blur-sm"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleNext(); }} 
                        disabled={currentIndex === media.length - 1}
                        className="absolute right-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition z-30 backdrop-blur-sm"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* MEDIA CONTENT */}
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        {isVideo ? (
                            <div className="relative w-full h-full flex items-center justify-center group/video" onClick={togglePlay}>
                                <video 
                                    ref={videoRef}
                                    src={streamUrl} 
                                    className="max-h-full max-w-full object-contain shadow-2xl"
                                    autoPlay 
                                    loop
                                    playsInline
                                />
                                
                                {/* Custom Play/Pause Overlay */}
                                {!isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                        <div className="p-4 bg-black/50 rounded-full backdrop-blur-md">
                                            <Play size={48} className="text-white fill-white translate-x-1" />
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Right Volume Control */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                    className="absolute bottom-6 right-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition opacity-0 group-hover/video:opacity-100"
                                >
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                            </div>
                        ) : (
                            <img 
                                src={streamUrl} 
                                alt={file.file_name} 
                                className="max-h-full max-w-full object-contain shadow-2xl" 
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT: Control Panel (White) */}
                <div className="w-full md:w-[360px] bg-white flex flex-col border-l border-gray-200">
                    
                    {/* Header Info */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                             <div className={`p-2 rounded-lg ${isVideo ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isVideo ? <Play size={18} fill="currentColor" /> : <FolderPlus size={18} />}
                             </div>
                             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {isVideo ? 'Video Clip' : 'Image File'}
                             </span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 truncate" title={file.file_name}>
                            {file.file_name}
                        </h2>
                        <p className="text-xs text-gray-400 font-mono mt-1">
                            {file.mime_type} • ID: {file.id}
                        </p>
                    </div>

                    {/* Collection List */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Add to Collection
                        </h3>
                        
                        <div className="space-y-2">
                            {collections && collections.length > 0 ? (
                                collections.map(col => {
                                    const isAssigned = file.collections && file.collections.some(c => c.id === col.id);
                                    
                                    return (
                                        <div 
                                            key={col.id}
                                            onClick={() => onAssign(file.id, col.id)}
                                            className={`group relative p-3 pl-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-200 ${
                                                isAssigned 
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                                                : 'bg-white border-gray-200 hover:border-blue-300 text-gray-600 hover:shadow-sm'
                                            }`}
                                        >
                                            <span className="font-medium text-sm">{col.name}</span>
                                            {isAssigned ? (
                                                <CheckCircle size={18} className="text-white" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-blue-400" />
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FolderPlus size={20} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">No collections yet</p>
                                    <p className="text-xs text-gray-400">Create one below to start organizing.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Create Footer */}
                    <div className="p-5 border-t border-gray-100 bg-white">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">New Album</label>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-400"
                                placeholder="e.g. Summer Trip 2024"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                            />
                            <button 
                                onClick={handleCreateCollection}
                                disabled={!newCollectionName || isCreating}
                                className="bg-black text-white px-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-gray-200"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaViewer;
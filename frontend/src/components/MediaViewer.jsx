import React, { useState } from 'react';
import { X, FolderPlus, CloudSync, ChevronRight, Info, CheckCircle2 } from 'lucide-react';

const MediaViewer = ({ file, collections, onAssign, onSync, onClose }) => {
    const [showCollections, setShowCollections] = useState(false);
    
    if (!file) return null;

    const streamUrl = `http://localhost:8000/stream/${file.id}`;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex animate-in fade-in duration-300">
            {/* Top Toolbar */}
            <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 bg-gradient-to-b from-black/70 to-transparent z-10">
                <button onClick={onClose} className="text-white/80 hover:text-white transition">
                    <X size={28} />
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowCollections(!showCollections)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                            showCollections ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                        }`}
                    >
                        <FolderPlus size={18} />
                        Add to Collection
                    </button>
                    <button 
                        onClick={() => onSync(file.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-600/30"
                    >
                        <CloudSync size={18} />
                        Sync to Drive
                    </button>
                </div>
            </div>

            {/* Main Viewing Area */}
            <div className={`flex-1 flex items-center justify-center p-4 transition-all duration-500 ${showCollections ? 'mr-[350px]' : ''}`}>
                {file.mime_type.includes('video') ? (
                    <video controls autoPlay src={streamUrl} className="max-h-full max-w-full rounded shadow-2xl" />
                ) : (
                    <img src={streamUrl} className="max-h-full max-w-full rounded shadow-2xl object-contain" alt={file.file_name} />
                )}
            </div>

            {/* Google Photos Style Sidebar */}
            <div className={`fixed right-0 top-0 bottom-0 w-[350px] bg-[#121212] border-l border-white/10 transition-transform duration-500 z-20 shadow-2xl ${
                showCollections ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-white">Collections</h2>
                        <button className="text-blue-500 text-sm font-bold hover:underline">+ New</button>
                    </div>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {collections.map(col => {
                            const isPinned = file.collections?.some(c => c.id === col.id);
                            return (
                                <button 
                                    key={col.id}
                                    onClick={() => onAssign(file.id, col.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${
                                        isPinned ? 'bg-blue-600/20 border border-blue-500/50' : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className={`text-sm font-bold ${isPinned ? 'text-blue-400' : 'text-gray-300'}`}>{col.name}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Google Drive Folder</span>
                                    </div>
                                    {isPinned ? <CheckCircle2 size={20} className="text-blue-400" /> : <ChevronRight size={18} className="text-gray-600 group-hover:text-white" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                            <Info size={14} />
                            Media Info
                        </div>
                        <div className="text-xs space-y-2 text-gray-500">
                            <p><span className="text-gray-400">Filename:</span> {file.file_name}</p>
                            <p><span className="text-gray-400">Local Path:</span> <span className="break-all">{file.local_path}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaViewer;
import React, { useState, useEffect } from 'react';
import { mediaService, collectionService } from './services/api';
import AlbumGallery from './components/AlbumGallery';
import MediaViewer from './components/MediaViewer';
import { Folder, Play, Loader2, Globe, ChevronDown, LayoutGrid, Settings, Cloud } from 'lucide-react';

function App() {
  // 1. STATE MANAGEMENT
  const [media, setMedia] = useState([]);
  const [collections, setCollections] = useState([]); 
  const [isScanning, setIsScanning] = useState(false);
  const [localPath, setLocalPath] = useState("E:\\McLeodganj"); // Default Path
  
  // CRITICAL FIX: Track INDEX (number), not FILE (object) for navigation
  const [viewerIndex, setViewerIndex] = useState(null);

  // 2. INITIAL FETCH
  useEffect(() => {
    fetchMedia();
    fetchCollections();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await mediaService.getMedia();
      setMedia(res.data);
    } catch (e) { console.error("Media fetch failed", e); }
  };

  const fetchCollections = async () => {
    try {
      const res = await collectionService.getCollections();
      setCollections(res.data || []); 
    } catch (e) { console.error("Collections fetch failed", e); }
  };

  // 3. SCANNING LOGIC
  const startScan = async () => {
    setIsScanning(true);
    try {
      await mediaService.scanLocal();
      const interval = setInterval(async () => {
        const res = await mediaService.getMedia();
        if (res.data.length > 0) setMedia(res.data);
      }, 1500);

      setTimeout(() => {
        clearInterval(interval);
        setIsScanning(false);
      }, 120000);
    } catch (err) {
      alert("Scan failed to start");
      setIsScanning(false);
    }
  };

  return (
    // LIGHT THEME BACKGROUND
    <div className="flex h-screen bg-white text-gray-900 font-sans">
      
      {/* LEFT COLUMN: Main Gallery */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="px-8 py-5 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
               <Cloud size={20} fill="white" />
             </div>
             <h1 className="text-xl font-bold tracking-tight text-gray-800">Trip2Cloud Pro</h1>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
             <button className="hover:text-black transition-colors">My Cloud</button>
             <button className="hover:text-black flex items-center gap-1 transition-colors"><Settings size={16}/> Settings</button>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar">
          <section className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              A Year-by-Year Journey <br/> Through Your Galleries
            </h2>
            <p className="text-gray-500 text-lg mb-12 max-w-2xl leading-relaxed">
              Immerse yourself in the timeless beauty of your memories, organized into smart collections synced with Google Drive.
            </p>

            <div className="flex items-center gap-4 mb-10">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 rounded-full border border-gray-200 font-semibold text-sm hover:bg-gray-100 transition-colors">
                <Globe size={16} /> Global <ChevronDown size={14} />
              </button>
            </div>

            {media.length > 0 ? (
              <AlbumGallery 
                collections={collections} 
                media={media} 
                // CRITICAL: Convert clicked item to Index
                onOpenViewer={(item) => setViewerIndex(media.findIndex(m => m.id === item.id))} 
              />
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <Folder size={32} className="text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">No media found</h3>
                <p className="text-gray-400 mt-1 max-w-xs mx-auto">Point the path to your folder in the sidebar to start discovering files.</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* RIGHT COLUMN: Sidebar Controls */}
      <aside className="w-[360px] border-l border-gray-100 bg-gray-50/50 p-6 hidden xl:flex flex-col gap-8 overflow-y-auto">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">System Control</h3>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <label className="text-xs font-bold text-gray-500 mb-2 block">LOCAL MEDIA SOURCE</label>
            <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 mb-4 focus-within:ring-2 ring-blue-500/20 transition-all">
              <Folder size={16} className="text-gray-400 mr-2 flex-shrink-0" />
              <input 
                className="bg-transparent border-none outline-none text-sm w-full py-1 text-gray-700 placeholder-gray-400"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
              />
            </div>
            <button 
              onClick={startScan}
              disabled={isScanning}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
            >
              {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Play size={16} fill="currentColor" />}
              {isScanning ? 'Scanning...' : 'Start Discovery'}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Activity Feed</h3>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><LayoutGrid size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Indexed Items</p>
                  <p className="text-xs text-gray-400">Total discovered</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">{media.length}</span>
            </div>
            
            <div className="pt-2 border-t border-gray-50 flex justify-between text-xs text-gray-400">
              <span>Status: {isScanning ? 'Syncing...' : 'Ready'}</span>
              <span>v1.0.4 Pro</span>
            </div>
          </div>
        </div>
      </aside>

      {/* OVERLAY: Media Viewer */}
      {viewerIndex !== null && (
        <MediaViewer 
          media={media}
          currentIndex={viewerIndex}
          onNavigate={(index) => setViewerIndex(index)}
          onClose={() => setViewerIndex(null)}
          collections={collections}
          onAssign={async (fileId, colId) => {
             await collectionService.assignFile(fileId, colId);
             fetchMedia(); 
          }}
        />
      )}
    </div>
  );
}

export default App;
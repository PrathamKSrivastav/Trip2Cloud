// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { mediaService, collectionService } from './services/api';
import Gallery from './components/Gallery';
import MediaViewer from './components/MediaViewer';
import { Folder, Play, Loader2 } from 'lucide-react';

function App() {
  const [media, setMedia] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [localPath, setLocalPath] = useState("E:\\McLeodganj"); // Default from your env
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewerFile, setViewerFile] = useState(null);

  // Initial Fetch
  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await mediaService.getMedia();
      setMedia(res.data);
    } catch (e) { console.error("Fetch failed", e); }
  };

  const startScan = async () => {
    setIsScanning(true);
    try {
      // 1. Tell backend to start scanning
      await mediaService.scanLocal();

      // 2. Start Polling: Fetch new items every 1.5 seconds
      const interval = setInterval(async () => {
        const res = await mediaService.getMedia();
        if (res.data.length > 0) {
          setMedia(res.data); // Update gallery in real-time
        }
      }, 1500);

      // Stop polling after 2 minutes or manual stop
      setTimeout(() => {
        clearInterval(interval);
        setIsScanning(false);
      }, 120000);

    } catch (err) {
      alert("Scan failed to start");
      setIsScanning(false);
    }
  };
  
  const handleAssign = async (fileId, colId) => {
    try {
        await collectionService.assignFile(fileId, colId);
        // Refresh local data so MediaViewer knows it's now in that collection
        const mediaRes = await mediaService.getMedia();
        setMedia(mediaRes.data);
        
        // Update the viewer's current file if it's the one we just assigned
        if (viewerFile && viewerFile.id === fileId) {
            const updatedFile = mediaRes.data.find(f => f.id === fileId);
            setViewerFile(updatedFile);
        }
    } catch (err) {
        console.error("Assignment failed", err);
    }
};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Dynamic Navigation Bar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter text-blue-500 italic">Trip2Cloud Pro</h1>

          {/* Folder Selector UI */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1 w-full md:w-1/2">
            <Folder size={18} className="text-gray-400 mr-2" />
            <input 
              className="bg-transparent border-none outline-none text-sm w-full py-1"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              placeholder="Enter absolute path to photos..."
            />
          </div>

          <button 
            onClick={startScan}
            disabled={isScanning}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
            {isScanning ? `Syncing... (${media.length})` : 'Start Scan'}
          </button>
        </div>
      </header>

      {/* Main Gallery View */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {media.length > 0 ? (
          <Gallery 
            media={media} 
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds} 
            onOpenViewer={setViewerFile}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <div className="p-8 border-2 border-dashed border-white/10 rounded-3xl mb-4">
              <Folder size={48} className="opacity-20" />
            </div>
            <p className="text-xl font-bold text-gray-300">Ready for your next trip?</p>
            <p className="text-sm">Verify the path above and click "Start Scan".</p>
          </div>
        )}
      </main>

      {viewerFile && (
        <MediaViewer 
          file={viewerFile} 
          onClose={() => setViewerFile(null)}
          // ... rest of props
        />
      )}
    </div>
  );
}

export default App;
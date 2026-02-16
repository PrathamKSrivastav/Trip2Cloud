import React from 'react';
import { LayoutGrid, List, Image as ImageIcon } from 'lucide-react';

const AlbumGallery = ({ collections = [], media = [], onOpenViewer }) => {
  
  // IF NO COLLECTIONS: Show "All Photos" Grid instead of empty state
  if (!collections || collections.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between">
           <div>
             <h3 className="text-lg font-bold text-blue-900">Unorganized Library</h3>
             <p className="text-blue-600 text-sm">Showing all {media.length} items from your local drive.</p>
           </div>
           <LayoutGrid className="text-blue-400" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1">
            {media.map((item) => (
                <div 
                    key={item.id} 
                    onClick={() => onOpenViewer(item)}
                    className="aspect-square bg-gray-100 relative group overflow-hidden cursor-pointer"
                >
                    <img 
                        src={`http://localhost:8000/thumbnails/${item.file_hash}.webp`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
            ))}
        </div>
      </div>
    );
  }

  // ... (Rest of component remains the same for when you DO have collections)
  return (
    <div>
        {/* Keep existing collection logic here if you want, or I can provide the full file if needed */}
    </div>
  );
};

export default AlbumGallery;
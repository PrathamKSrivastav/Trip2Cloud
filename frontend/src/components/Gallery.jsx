import React from 'react';
import { ImageIcon, Film, CheckCircle } from 'lucide-react';

const Gallery = ({ media, selectedIds, onSelectionChange, onOpenViewer }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {media.map((item, index) => {
        const isSelected = selectedIds.includes(item.id);
        
        return (
          <div 
            key={item.id}
            onClick={() => onOpenViewer(item)}
            className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg transition-all duration-500 ${
              isSelected ? 'ring-4 ring-blue-500 scale-95' : 'hover:scale-[1.02]'
            }`}
          >
            {/* Lazy Loaded Thumbnail */}
            <img 
              src={`http://localhost:8000/thumbnails/${item.file_hash}.webp`}
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSelected ? 'opacity-50' : ''}`}
              alt={item.file_name}
            />

            {/* Selection Checkbox (Visible on Hover or if Selected) */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                const newIds = isSelected ? selectedIds.filter(id => id !== item.id) : [...selectedIds, item.id];
                onSelectionChange(newIds);
              }}
              className={`absolute top-2 left-2 z-10 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <div className={`rounded-full p-1 shadow-xl ${isSelected ? 'bg-blue-500' : 'bg-black/50 backdrop-blur-md'}`}>
                <CheckCircle size={20} className="text-white" />
              </div>
            </div>

            {/* Media Type Icon */}
            <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-md">
              {item.mime_type.includes('video') ? <Film size={14} /> : <ImageIcon size={14} />}
            </div>

            {/* Bottom Info Strip */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
              <p className="text-[10px] font-medium truncate uppercase tracking-widest">{item.file_name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Gallery;
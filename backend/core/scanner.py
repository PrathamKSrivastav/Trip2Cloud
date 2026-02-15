import hashlib
from pathlib import Path
from db.models import MediaFile
from core.processor import MediaProcessor

def get_file_hash(file_path):
    """
    Generates a SHA-256 hash. For speed with large videos, 
    we read in 4KB chunks.
    """
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

class Scanner:
    def __init__(self, db_session, local_path, processor: MediaProcessor):
        self.db = db_session
        self.local_path = local_path
        self.processor = processor

    def sync_local_files(self):
        supported_exts = {'.jpg', '.jpeg', '.png', '.mp4', '.mov', '.mkv', '.heic', '.webp'}
        
        for path in Path(self.local_path).rglob('*'):
            if path.suffix.lower() in supported_exts:
                file_hash = get_file_hash(path)
                existing = self.db.query(MediaFile).filter_by(file_hash=file_hash).first()
                
                if not existing:
                    # 1. Generate thumbnail first
                    self.processor.generate_thumbnail(str(path), file_hash)
                    
                    # 2. Add to database
                    new_file = MediaFile(
                        file_hash=file_hash,
                        local_path=str(path),
                        file_name=path.name,
                        mime_type=f"media/{path.suffix[1:]}"
                    )
                    self.db.add(new_file)
                    
                    # 3. COMMIT IMMEDIATELY so the frontend can see it [CRITICAL FIX]
                    self.db.commit() 
                    print(f"DEBUG: Committed {path.name} to DB")
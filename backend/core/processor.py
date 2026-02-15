import os
import subprocess
from PIL import Image
from pathlib import Path
import logging

# Set up logging for professional error tracking
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MediaProcessor:
    def __init__(self, thumbnail_dir):
        self.thumbnail_dir = Path(thumbnail_dir)
        self.thumbnail_dir.mkdir(parents=True, exist_ok=True)

    def generate_thumbnail(self, file_path, file_hash):
        """
        Determines file type and generates a 400px WebP thumbnail.
        Returns the path to the thumbnail.
        """
        ext = Path(file_path).suffix.lower()
        thumb_path = self.thumbnail_dir / f"{file_hash}.webp"
        
        # skip if thumbnail already exists (saves CPU)
        if thumb_path.exists():
            return str(thumb_path)

        try:
            if ext in ['.jpg', '.jpeg', '.png', '.heic', '.webp']:
                return self._process_image(file_path, thumb_path)
            elif ext in ['.mp4', '.mov', '.mkv', '.avi']:
                return self._process_video(file_path, thumb_path)
        except Exception as e:
            logger.error(f"Failed to process {file_path}: {e}")
        
        return None

    def _process_image(self, source, target):
        with Image.open(source) as img:
            # Preserve aspect ratio while resizing
            img.thumbnail((400, 400)) 
            img.save(target, "WEBP", quality=80)
        return str(target)

    def _process_video(self, source, target):
        # FFmpeg command: grab 1 frame at 1s mark, resize, and save as webp
        cmd = [
            'ffmpeg', '-ss', '00:00:01', '-i', source,
            '-vframes', '1', '-q:v', '2', '-vf', 'scale=400:-1',
            '-f', 'image2', str(target), '-y', '-loglevel', 'error'
        ]
        subprocess.run(cmd, check=True)
        return str(target)
import os
import logging
from pathlib import Path
from googleapiclient.http import MediaFileUpload
from core.drive_auth import get_drive_service
from db.models import MediaFile, Collection

logger = logging.getLogger(__name__)

class DriveSyncEngine:
    def __init__(self, db_session):
        self.db = db_session
        self.service = get_drive_service()
        self.root_id = os.getenv("DRIVE_ROOT_FOLDER_ID")

    def sync_collection(self, collection_id: int):
        """
        Main entry point: Syncs a local collection to a Google Drive folder.
        """
        collection = self.db.query(Collection).get(collection_id)
        if not collection:
            return {"error": "Collection not found"}

        # 1. Ensure the folder exists on Drive
        if not collection.drive_folder_id:
            collection.drive_folder_id = self._create_remote_folder(collection.name)
            self.db.commit()

        results = {"uploaded": 0, "shortcuts": 0, "errors": 0}

        # 2. Iterate through all files pinned to this collection
        for file in collection.files:
            try:
                # Scenario A: File never uploaded to Drive before -> UPLOAD
                if not file.is_uploaded:
                    drive_id = self._upload_raw_file(file.local_path, collection.drive_folder_id)
                    file.drive_file_id = drive_id
                    file.is_uploaded = True
                    results["uploaded"] += 1
                
                # Scenario B: File exists on Drive but needs to be in THIS folder -> SHORTCUT
                else:
                    self._create_drive_shortcut(file.drive_file_id, collection.drive_folder_id, file.file_name)
                    results["shortcuts"] += 1
                
                self.db.commit()
            except Exception as e:
                logger.error(f"Sync failed for {file.file_name}: {e}")
                results["errors"] += 1
        
        return results

    def _create_remote_folder(self, name):
        metadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [self.root_id]
        }
        folder = self.service.files().create(body=metadata, fields='id').execute()
        return folder.get('id')

    def _upload_raw_file(self, local_path, parent_id):
        metadata = {'name': Path(local_path).name, 'parents': [parent_id]}
        media = MediaFileUpload(local_path, resumable=True)
        file = self.service.files().create(body=metadata, media_body=media, fields='id').execute()
        return file.get('id')

    def _create_drive_shortcut(self, target_id, parent_id, name):
        shortcut_metadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.shortcut',
            'shortcutDetails': {'targetId': target_id},
            'parents': [parent_id]
        }
        return self.service.files().create(body=shortcut_metadata).execute()
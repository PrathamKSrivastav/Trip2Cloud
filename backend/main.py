import os
from dotenv import load_dotenv
import mimetypes

# 1. Load the .env file immediately
load_dotenv()
from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from db import database, models
from core import scanner, processor
from core.drive_logic import DriveSyncEngine

# Initialize Database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Cloud Sorter Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

THUMB_DIR = os.getenv("THUMBNAIL_DIR", "./metadata/thumbnails")
if not os.path.exists(THUMB_DIR):
    os.makedirs(THUMB_DIR)
app.mount("/thumbnails", StaticFiles(directory=THUMB_DIR), name="thumbnails")

# --- SCHEMAS ---
class AssignRequest(BaseModel):
    file_id: int
    collection_id: int

class CollectionCreate(BaseModel):
    name: str

# --- API ENDPOINTS ---

@app.get("/media")
def get_all_media(db: Session = Depends(database.get_db)):
    return db.query(models.MediaFile).all()

@app.get("/collections")
def get_collections(db: Session = Depends(database.get_db)):
    return db.query(models.Collection).all()

@app.post("/scan")
def start_scan(background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    # os.getenv matches the key in your .env file
    local_path = os.getenv("LOCAL_MEDIA_PATH")
    
    print(f"DEBUG: Attempting to scan path: {local_path}") # Check your console for this!
    
    if not local_path or not os.path.exists(local_path):
        raise HTTPException(
            status_code=400, 
            detail=f"Path not found: {local_path}. Check your .env configuration."
        )
    
    proc = processor.MediaProcessor(THUMB_DIR)
    file_scanner = scanner.Scanner(db, local_path, proc)
    background_tasks.add_task(file_scanner.sync_local_files)
    return {"status": "success", "message": "Scanning started."}
@app.get("/stream/{file_id}")
def stream_media(file_id: int, db: Session = Depends(database.get_db)):
    file_record = db.query(models.MediaFile).filter(models.MediaFile.id == file_id).first()
    if not file_record or not os.path.exists(file_record.local_path):
        raise HTTPException(status_code=404, detail="File not found")

    mime_type, _ = mimetypes.guess_type(file_record.local_path)
    return FileResponse(file_record.local_path, media_type=mime_type or "application/octet-stream")

@app.post("/assign")
def assign_to_collection(request: AssignRequest, db: Session = Depends(database.get_db)):
    file = db.query(models.MediaFile).get(request.file_id)
    collection = db.query(models.Collection).get(request.collection_id)
    
    if not file or not collection:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if collection not in file.collections:
        file.collections.append(collection)
        db.commit()
    return {"message": f"Pinned {file.file_name} to {collection.name}"}

@app.post("/collections")
def create_collection(collection: CollectionCreate, db: Session = Depends(database.get_db)):
    # Check if exists
    existing = db.query(models.Collection).filter(models.Collection.name == collection.name).first()
    if existing:
        return existing
    
    new_col = models.Collection(name=collection.name)
    db.add(new_col)
    db.commit()
    db.refresh(new_col)
    return new_col

@app.post("/collections/{collection_id}/sync")
def sync_to_drive(collection_id: int, db: Session = Depends(database.get_db)):
    """Triggers the actual Google Drive logic from drive_logic.py"""
    sync_engine = DriveSyncEngine(db)
    results = sync_engine.sync_collection(collection_id)
    return results
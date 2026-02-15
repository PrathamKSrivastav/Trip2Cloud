from sqlalchemy import Column, Integer, String, Boolean, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

# Association table for Many-to-Many relationship (A photo in multiple folders)
file_collections = Table(
    'file_collections', Base.metadata,
    Column('file_id', Integer, ForeignKey('media_files.id')),
    Column('collection_id', Integer, ForeignKey('collections.id'))
)

class MediaFile(Base):
    __tablename__ = 'media_files'
    
    id = Column(Integer, primary_key=True)
    file_hash = Column(String, unique=True, index=True) # SHA-256
    local_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    mime_type = Column(String)
    
    # Sync Status
    is_uploaded = Column(Boolean, default=False)
    drive_file_id = Column(String, nullable=True) # The "Source" ID on Google Drive
    
    # Relationships
    collections = relationship("Collection", secondary=file_collections, back_populates="files")
    created_at = Column(DateTime, default=datetime.utcnow)

class Collection(Base):
    __tablename__ = 'collections'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False) # e.g., "Day 1", "Pratham"
    drive_folder_id = Column(String, nullable=True) # The ID of this specific folder on Drive
    
    # Relationships
    files = relationship("MediaFile", secondary=file_collections, back_populates="collections")
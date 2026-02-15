import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mediaService = {
  // Get all discovered media
  getMedia: () => apiClient.get('/media'),
  
  // Trigger a local system scan
  scanLocal: () => apiClient.post('/scan'),
  
  // Proxy URL for high-res streaming
  getStreamUrl: (fileId) => `${API_BASE_URL}/stream/${fileId}`,
  
  // Thumbnail URL
  getThumbUrl: (hash) => `${API_BASE_URL}/thumbnails/${hash}.webp`,
};

export const collectionService = {
  getCollections: () => apiClient.get('/collections'),
  
  assignFile: (fileId, collectionId) => 
    apiClient.post('/assign', { file_id: fileId, collection_id: collectionId }),
  
  syncToDrive: (collectionId) => 
    apiClient.post(`/collections/${collectionId}/sync`),
};

export default apiClient;
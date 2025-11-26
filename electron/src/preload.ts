import { contextBridge, ipcRenderer } from 'electron';

// Expose API to renderer process
contextBridge.exposeInMainWorld('electron', {
  // Provide an async method to get the API URL
  getApiUrl: () => ipcRenderer.invoke('get-api-url')
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script loaded');
});

// Type definitions for Electron API exposed via contextBridge
export interface ElectronAPI {
  getApiUrl: () => Promise<string>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};

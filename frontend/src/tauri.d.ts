// Type definitions for Tauri API

export interface TauriAPI {
  getApiUrl: () => Promise<string>;
  getServerInfo: () => Promise<{ port: number | null; pid: number | null }>;
}


declare global {
  interface Window {
    __TAURI__?: any;
  }
}
import type { TauriAPI } from './tauri.d';

// Dynamically import Tauri invoke function only when needed
export const tauriAPI: TauriAPI = {
  getApiUrl: async () => {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke('get_api_url');
  },
  getServerInfo: async () => {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke('get_server_info');
  },
};
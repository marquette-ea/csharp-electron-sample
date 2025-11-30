import { useState, useEffect, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { tauriAPI } from './tauri'

interface ServerInfo {
  server?: string
  version?: string
  timestamp?: string
}

interface ServerStatus {
  message?: string
  status?: string
}

function App() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
  const [name, setName] = useState('World')
  const [greeting, setGreeting] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [apiUrl, setApiUrl] = useState<string | null>(null)
  const [platform, setPlatform] = useState<'electron' | 'tauri' | 'web'>('web')

  // Get API URL from Electron or Tauri on mount
  useEffect(() => {
    const getApiUrl = async () => {
      // Check if running in Tauri
      if (window.__TAURI__) {
        setPlatform('tauri')
        try {
          const url = await tauriAPI.getApiUrl()
          setApiUrl(url)
        } catch (err) {
          console.error('Failed to get API URL from Tauri:', err)
          setApiUrl('http://localhost:5000')
        }
      }
      // Check if running in Electron
      else if (window.electron) {
        setPlatform('electron')
        try {
          const url = await window.electron.getApiUrl()
          setApiUrl(url)
        } catch (err) {
          console.error('Failed to get API URL from Electron:', err)
          setApiUrl('http://localhost:5000')
        }
      }
      // Fallback for web/development
      else {
        setPlatform('web')
        setApiUrl('http://localhost:5000')
      }
    }
    void getApiUrl()
  }, [])

  const fetchServerStatus = useCallback(async () => {
    if (!apiUrl) return
    try {
      const response = await fetch(`${apiUrl}/api/status`)
      const data = await response.json()
      setServerStatus(data)
      setError(null)
    } catch (err) {
      setError('Failed to connect to server')
      console.error(err)
    }
  }, [apiUrl])

  const fetchServerInfo = useCallback(async () => {
    if (!apiUrl) return
    try {
      const response = await fetch(`${apiUrl}/api/info`)
      const data = await response.json()
      setServerInfo(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch server info')
      console.error(err)
    }
  }, [apiUrl])

  const fetchGreeting = useCallback(async () => {
    if (!apiUrl) return
    try {
      const response = await fetch(`${apiUrl}/api/hello/${encodeURIComponent(name)}`)
      const data = await response.json()
      setGreeting(data.message)
      setError(null)
    } catch (err) {
      setError('Failed to fetch greeting')
      console.error(err)
    }
  }, [apiUrl, name])

  useEffect(() => {
    if (apiUrl) {
      void fetchServerStatus()
      void fetchServerInfo()
    }
  }, [apiUrl, fetchServerStatus, fetchServerInfo])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>C# ASP.NET + TypeScript React + {platform === 'tauri' ? 'Tauri' : platform === 'electron' ? 'Electron' : 'Web'}</h1>

      {error && <div style={{ color: 'red', margin: '1rem' }}>{error}</div>}

      <div className="card">
        <h2>Server Status</h2>
        {serverStatus ? (
          <div>
            <p>Status: {serverStatus.status}</p>
            <p>Message: {serverStatus.message}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="card">
        <h2>Server Info</h2>
        {serverInfo ? (
          <div>
            <p>Server: {serverInfo.server}</p>
            <p>Version: {serverInfo.version}</p>
            <p>Timestamp: {serverInfo.timestamp}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        <button onClick={fetchServerInfo}>Refresh Info</button>
      </div>

      <div className="card">
        <h2>Greeting API</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={fetchGreeting}>Get Greeting</button>
        {greeting && <p>{greeting}</p>}
      </div>

      <p className="read-the-docs">
        Platform: {platform} | API URL: {apiUrl}
      </p>
    </>
  )
}

export default App

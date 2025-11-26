import { useState, useEffect, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

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

  // Get API URL from window object (will be set by Electron) or use default
  const apiUrl = (window as Window & { API_URL?: string }).API_URL || 'http://localhost:5000'

  const fetchServerStatus = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/`)
      const data = await response.json()
      setServerStatus(data)
      setError(null)
    } catch (err) {
      setError('Failed to connect to server')
      console.error(err)
    }
  }, [apiUrl])

  const fetchServerInfo = useCallback(async () => {
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
    void fetchServerStatus()
    void fetchServerInfo()
  }, [fetchServerStatus, fetchServerInfo])

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
      <h1>C# ASP.NET + TypeScript React + Electron</h1>
      
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
        API URL: {apiUrl}
      </p>
    </>
  )
}

export default App

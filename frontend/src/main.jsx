import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1a1030',
          color: '#f1f0ff',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: '12px',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#a855f7', secondary: '#1a1030' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#1a1030' },
        },
      }}
    />
  </StrictMode>,
)

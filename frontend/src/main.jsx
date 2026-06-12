import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

import './index.css'
import './styles/admin-dashboard.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Poppins, sans-serif',
              borderRadius: '12px',
              background: '#FDF4F9',
              color: '#3D1F35',
              border: '1px solid #E8C8DF',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
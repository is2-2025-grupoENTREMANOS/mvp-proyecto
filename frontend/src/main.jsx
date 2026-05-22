import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
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
    </BrowserRouter>
  </React.StrictMode>,
)

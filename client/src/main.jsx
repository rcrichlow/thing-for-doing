import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BoardProvider } from './context/BoardContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
  </React.StrictMode>,
)

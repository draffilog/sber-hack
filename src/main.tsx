import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ProtocolProvider } from './context/ProtocolContext.tsx'
import { BlockchainContextProvider } from './context/BlockchainContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BlockchainContextProvider>
      <ProtocolProvider>
        <App />
      </ProtocolProvider>
    </BlockchainContextProvider>
  </React.StrictMode>,
)

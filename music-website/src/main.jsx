import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

import GlobalErrorBoundary from './components/GlobalErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
    <GlobalErrorBoundary>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </GlobalErrorBoundary>,
)

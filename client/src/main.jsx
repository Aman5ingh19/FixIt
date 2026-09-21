import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { LanguageProvider } from './contexts/LanguageContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <SocketProvider>
            <App />
            <Toaster
              position="bottom-right"
              containerStyle={{
                bottom: 24,
                right: 24,
              }}
              toastOptions={{
                duration: 2500,
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                },
                success: {
                  duration: 2500,
                  iconTheme: { primary: '#22c55e', secondary: '#f0fdf4' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
                  duration: 3500,
                },
              }}
            >
              {(t) => (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toast.dismiss(t.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toast.dismiss(t.id); }}
                  title="Click to dismiss"
                  style={{ cursor: 'pointer' }}
                >
                  <ToastBar toast={t}>
                    {({ icon, message }) => (
                      <>
                        {icon}
                        {message}
                      </>
                    )}
                  </ToastBar>
                </div>
              )}
            </Toaster>
          </SocketProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

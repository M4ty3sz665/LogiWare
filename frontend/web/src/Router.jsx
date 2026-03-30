import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './Components/ToastProvider.jsx';
import App from './App.jsx';

const LandingPage = lazy(() => import('./Components/LandingPage.jsx'));
const Login = lazy(() => import('./Components/Login.jsx'));
const Register = lazy(() => import('./Components/Register.jsx'));

function hasToken() {
  return Boolean(localStorage.getItem('token'))
}

function GuestOnlyRoute({ children }) {
  return hasToken() ? <Navigate to="/app" replace /> : children
}

function ProtectedRoute({ children }) {
  return hasToken() ? children : <Navigate to="/login" replace />
}

export default function Router() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<div>Betöltés...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
            <Route path="/register" element={<GuestOnlyRoute><Register /></GuestOnlyRoute>} />
            <Route path="/app/*" element={<ProtectedRoute><App /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Task 1: Registration Route */}
        <Route path="/register" element={<Register />} />

        {/* Task 2: Login Route */}
        <Route path="/login" element={<Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />} />

        {/* Task 3: Protected Home Route */}
        <Route path="/home" element={<Home user={user} setUser={setUser} />} />

        {/* Default / Fallback Routes */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

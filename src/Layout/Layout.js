// src/Layout/Layout.js
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

function Layout({ children, user, onLogout }) {
  return (
    <div className="rtd-layout">
      <Header user={user} onLogout={onLogout} />
      <main className="rtd-main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
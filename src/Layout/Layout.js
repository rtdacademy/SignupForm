import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const showBackButton = location.pathname !== '/dashboard';

  // Clone children and pass userEmail as a prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { userEmail: user ? user.email : null });
    }
    return child;
  });

  return (
    <div className="rtd-layout">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onBackClick={showBackButton ? handleBackClick : null}
        onDashboardClick={handleDashboardClick}
      />
      <main className="rtd-main-content">
        {childrenWithProps}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
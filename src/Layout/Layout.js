import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, query, orderByChild, equalTo } from "firebase/database";

function Layout({ children }) {
  const { user, signOut, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user && !isStaff(user)) {
        const db = getDatabase();
        const sanitizedEmail = user.email.replace(/\./g, ',');
        const studentRef = ref(db, `students/${sanitizedEmail}`);
        
        try {
          const snapshot = await get(studentRef);
          if (snapshot.exists()) {
            setStudentData(snapshot.val());
            console.log("Fetched student data:", snapshot.val());
          } else {
            console.log("No data available for this student");
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      }
    };
  
    fetchStudentData();
  }, [user, isStaff]);

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
    navigate(isStaff(user) ? '/teacher-dashboard' : '/dashboard');
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const showBackButton = location.pathname !== '/dashboard' && location.pathname !== '/teacher-dashboard';

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        userEmail: user ? user.email : null,
        isSidebarOpen: isSidebarOpen,
        onSidebarToggle: handleSidebarToggle,
        studentData: studentData
      });
    }
    return child;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onBackClick={showBackButton ? handleBackClick : null}
        onDashboardClick={handleDashboardClick}
        onSidebarToggle={handleSidebarToggle}
        showSidebarToggle={isStaff(user)}
        portalType={isStaff(user) ? "Staff Portal" : "Student Portal"}
      />
      <main className="flex-grow">
        {childrenWithProps}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
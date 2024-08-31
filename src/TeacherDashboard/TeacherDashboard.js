import React, { useState, useEffect } from 'react'; // Added useState to the import
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FaSignOutAlt, FaBars, FaTimes, FaChalkboardTeacher, FaUsers, FaBook, FaChartBar } from 'react-icons/fa';
import './TeacherDashboard.css';

function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Now useState is defined

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user || !(await isSuperAdmin(user.email))) {
        navigate('/dashboard'); // Redirect non-admin users to the dashboard
      }
    };

    checkAdmin();
  }, [user, isSuperAdmin, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`teacher-dashboard ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <header className="dashboard-header">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <button onClick={handleLogout} className="signout-button">
          <FaSignOutAlt /> Sign Out
        </button>
      </header>

      <div className="dashboard-content">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <ul>
              <li><FaChalkboardTeacher /> Dashboard</li>
              <li><FaUsers /> Students</li>
              <li><FaBook /> Courses</li>
              <li><FaChartBar /> Reports</li>
            </ul>
            {user && isSuperAdmin(user.email) && (
              <Link to="/admin-panel" className="admin-link">Admin Panel</Link>
            )}
          </nav>
        </aside>

        <main className="main-content">
          <iframe
            src="https://apps.powerapps.com/play/e42ed678-5bbd-43fc-8c9c-e15ff3b181a8?source=iframe"
            title="Teacher Portal PowerApp"
            className="powerapp-iframe"
          ></iframe>
        </main>
      </div>
    </div>
  );
}

export default TeacherDashboard;

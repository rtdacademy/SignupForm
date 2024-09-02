import React, { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaCalendarAlt, FaChartBar, FaUser, FaPlusCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user, isTeacherEmail } = useAuth(); 

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      if (await isTeacherEmail(user.email)) {
        navigate('/teacher-dashboard');
      }
    };

    checkUserRole();
  }, [user, isTeacherEmail, navigate]);

  const apps = [
    { name: 'My Courses', icon: <FaBook />, path: '/courses', description: 'View and manage your enrolled courses' },
    { name: 'Schedule', icon: <FaCalendarAlt />, path: '/schedule', description: 'Check your course schedule and deadlines' },
    { name: 'Progress Tracker', icon: <FaChartBar />, path: '/progress', description: 'Track your academic progress' },
    { name: 'Profile', icon: <FaUser />, path: '/profile', description: 'Manage your account settings' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-top">
        <h2 className="dashboard-title">Student Dashboard</h2>
        <Link to="/register" className="signup-course-button">
          <FaPlusCircle /> Sign Up for a New Course
        </Link>
      </div>
      <div className="apps-grid">
        {apps.map((app, index) => (
          <Link key={index} to={app.path} className="app-card">
            <div className="app-icon">{app.icon}</div>
            <h3 className="app-name">{app.name}</h3>
            <p className="app-description">{app.description}</p>
            <p className="coming-soon">Coming Soon! This information will be available in your course when you get started.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

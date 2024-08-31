import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaCalendarAlt, FaChartBar, FaUser, FaPlusCircle } from 'react-icons/fa';
import Modal from '../components/Modal/Modal';
import RegistrationForm from '../components/RegistrationForm/RegistrationForm';
import { useAuth } from '../context/AuthContext';
import Layout from '../Layout/Layout';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user, isTeacherEmail } = useAuth(); 
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const apps = [
    { name: 'My Courses', icon: <FaBook />, path: '/courses', description: 'View and manage your enrolled courses' },
    { name: 'Schedule', icon: <FaCalendarAlt />, path: '/schedule', description: 'Check your course schedule and deadlines' },
    { name: 'Progress Tracker', icon: <FaChartBar />, path: '/progress', description: 'Track your academic progress' },
    { name: 'Profile', icon: <FaUser />, path: '/profile', description: 'Manage your account settings' },
  ];

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="dashboard-top">
        <h2 className="dashboard-title">Student Dashboard</h2>
        <button className="signup-course-button" onClick={() => setIsModalOpen(true)}>
          <FaPlusCircle /> Sign Up for a New Course
        </button>
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
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <RegistrationForm onClose={handleCloseModal} />
      </Modal>
    </Layout>
  );
}

export default Dashboard;
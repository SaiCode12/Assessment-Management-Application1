import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Builder from './pages/Builder';
import Assessments from './pages/Assessments';
import LaunchPad from './pages/LaunchPad';
import Reports from './pages/Reports';
import TakeAssessment from './pages/TakeAssessment';
import Profile from './pages/Profile';
import './css/App.css';

const PrivateRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/builder" />} />
            <Route path="builder" element={<Builder />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="launchpad" element={<LaunchPad />} />
            <Route path="launchpad/:id" element={<TakeAssessment />} />
            <Route path="reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

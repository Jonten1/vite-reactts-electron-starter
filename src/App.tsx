import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppBar from './components/AppBar';
import Phone from './components/Phone';
import CallLogsComponent from './components/CallLogs';
import NavBar from './components/navBar/NavBar';
import Login from './components/Login';
import AdminUsers from './components/admin/AdminUsers';
import AdminLogs from './components/admin/Logs';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [adminUsers, setAdminUsers] = useState<boolean>(false);
  const [adminLogs, setAdminLogs] = useState<boolean>(false);

  useEffect(() => {
    window.Main.removeLoading();
  }, []);

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('authToken', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios
      .get('http://localhost:5000/auth/profile')
      .then((response) => {
        setRole(response.data.user.role);
        setEmail(response.data.user.email);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
      });
  };

  const navBarProps = {
    role,
    email,
    setAdminUsers,
    setAdminLogs,
    adminUsers,
    setIsAuthenticated
  };

  return (
    <>
      <div className="flex-none">
        <AppBar />
      </div>
      {window.Main && !isAuthenticated ? (
        <div className="flex align-center">
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <div className="wrapper">
          <NavBar {...navBarProps} />
          <Phone />
          {adminUsers && <AdminUsers />}
          {adminLogs && <AdminLogs />}
          {/* <CallLogsComponent /> */}
        </div>
      )}
    </>
  );
}

export default App;

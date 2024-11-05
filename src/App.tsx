import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppBar from './components/AppBar';
import Phone from './components/Phone';
import CallLogsComponent from './components/CallLogs';
import NavBar from './components/navBar/NavBar';
import Login from './components/Login';
import AdminUsers from './components/admin/AdminUsers';
import AdminLogs from './components/admin/Logs';
import AccountSettings from './components/AccountSettings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [country, setCountry] = useState<string>();
  const [adminUsers, setAdminUsers] = useState<boolean>(false);
  const [adminLogs, setAdminLogs] = useState<boolean>(false);
  const [settingsToggle, setSettingsToggle] = useState<boolean>(false);
  const [cmNumber, setCmNumber] = useState<string | null>(null);
  const [cmNumberWeb, setCmNumberWeb] = useState<string | null>(null);
  const [filteredNumbers, setFilteredNumbers] = useState<string[]>([]);
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('authToken', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios
      .get('http://localhost:8080/auth/profile')
      .then((response) => {
        setRole(response.data.user.role);
        setEmail(response.data.user.email);
        setCountry(response.data.user.country);
        setCmNumber(response.data.user.numberWeb);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
      });
  };
  useEffect(() => {
    // check if the user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      handleLoginSuccess(token);
    }
  }, []);

  useEffect(() => {
    window.Main.removeLoading();
  }, []);

  const accountSettingsProps = {
    country,
    email,
    cmNumber,
    role
  };
  const navBarProps = {
    role,
    email,
    setAdminUsers,
    setAdminLogs,
    setSettingsToggle,
    adminLogs,
    adminUsers,
    setIsAuthenticated,
    setCountry
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
          {settingsToggle && <AccountSettings {...accountSettingsProps} />}
          {role !== 'admin' && <Phone cmNumber={cmNumber} />}
          {role === 'admin' && adminUsers && <AdminUsers />}
          {role === 'admin' && adminLogs && <AdminLogs />}
          {/* <CallLogsComponent /> */}
        </div>
      )}
    </>
  );
}

export default App;

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
  const [numbers, setNumbers] = useState([]);
  const [cmNumber, setCmNumber] = useState<string | null>(null);
  const [cmNumberWeb, setCmNumberWeb] = useState<string | null>(null);

  useEffect(() => {
    window.Main.removeLoading();
  }, []);
  const fetchNumbers = async () => {
    try {
      const response = await fetch('http://localhost:8080/numbers');

      if (!response.ok) {
        throw new Error('Failed to fetch numbers');
      }

      const data = await response.json();
      setNumbers(data.data);
      console.log('Numbers', numbers);

      console.log('Mobile Number:', cmNumber);
      console.log('Web Number:', cmNumberWeb);
    } catch (err: any) {
      console.error(err.message);
    }
  };
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('authToken', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios
      .get('http://localhost:5000/auth/profile')
      .then((response) => {
        setRole(response.data.user.role);
        setEmail(response.data.user.email);
        setCountry(response.data.user.country);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
      });
    fetchNumbers();
  };

  const accountSettingsProps = {
    country,
    email,
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
          {role !== 'admin' && <Phone />}
          {role === 'admin' && adminUsers && <AdminUsers />}
          {role === 'admin' && adminLogs && <AdminLogs />}
          {/* <CallLogsComponent /> */}
        </div>
      )}
    </>
  );
}

export default App;

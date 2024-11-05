import React from 'react';
import { Navbar, Collapse, Menu, MenuHandler, MenuList, MenuItem, Button, Typography } from '@material-tailwind/react';
import SwitchDarkMode from '../SwitchDarkMode';

export default function NavBar({
  setIsAuthenticated,
  role,
  email,
  setAdminUsers,
  adminUsers,
  setAdminLogs,
  adminLogs,
  setCountry,
  setSettingsToggle
}) {
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken'); // Remove token from local storage
    localStorage.removeItem('token');
    setCountry('');
  };
  const toggleAdminUsers = () => {
    setAdminUsers(true);
    setAdminLogs(false);
    setSettingsToggle(false);
  };
  const toggleAdminLogs = () => {
    setAdminLogs(true);
    setAdminUsers(false);
    setSettingsToggle(false);
  };
  const toggleSettingsHandler = () => {
    setSettingsToggle(true);
    setAdminLogs(false);
    setAdminUsers(false);
  };
  return (
    <Navbar className="mx-auto max-w-screen-xl px-6 py-3">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography variant="h6" className="mr-4 py-1.5">
          SkyPhone {role === 'cm' ? '' : 'ADMIN VIEW'}
        </Typography>
        <div className="lg:block">
          <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 sm:flex-row lg:items-center lg:gap-6">
            {role === 'admin' && (
              <Menu>
                <MenuHandler>
                  <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium ">
                    <Button className="flex items-center hover:text-blue-500 transition-colors">Admin</Button>
                  </Typography>
                </MenuHandler>
                <MenuList>
                  <MenuItem onClick={toggleAdminUsers}>Users</MenuItem>
                  <MenuItem onClick={toggleAdminLogs}>Logs</MenuItem>
                  <MenuItem>Stats</MenuItem>
                </MenuList>
              </Menu>
            )}
            <Menu>
              <MenuHandler>
                <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium ">
                  <Button className="flex items-center hover:text-blue-500 transition-colors">Account</Button>
                </Typography>
              </MenuHandler>
              <MenuList>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                <MenuItem onClick={toggleSettingsHandler}>Settings</MenuItem>
              </MenuList>
            </Menu>
            <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
              <a href="#" className="flex items-center hover:text-blue-500 transition-colors">
                Stats
              </a>
            </Typography>
            <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
              <a href="#" className="flex items-center hover:text-blue-500 transition-colors">
                Schedule
              </a>
            </Typography>
            <SwitchDarkMode />
            {/* <SelectLanguage /> */}
          </ul>
        </div>
      </div>
    </Navbar>
  );
}

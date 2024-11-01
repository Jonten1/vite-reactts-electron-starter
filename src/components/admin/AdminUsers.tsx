import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Card,
  Typography,
  Button,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem
} from '@material-tailwind/react';
import { FaPlus, FaSync, FaTimes, FaUser, FaUserCog, FaEdit } from 'react-icons/fa';
import Flag from 'react-world-flags';
import countryList from 'country-list';
import '../../style/call_logs.css';
import EditUser from './EditUser';

export default function AdminUsers() {
  const [open, setOpen] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [fetchedCountries, setFetchedCountries] = useState([]);
  const [registerRole, setRegisterRole] = useState('');
  const [error, setError] = useState('');
  const [userList, setUserList] = useState([]);
  const [countries, setCountries] = useState([]);
  const [addNewCountry, setAddNewCountry] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const toggleNewCountry = () => {
    setAddNewCountry(!addNewCountry);
  };

  const token = localStorage.getItem('token');

  const fetchUserList = async () => {
    try {
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/auth/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user list');
      }

      const data = await response.json();
      setUserList(data);
    } catch (error) {
      console.error('Error fetching user list:', error);
    }
  };

  const fetchCountriesList = async () => {
    const response = await fetch('http://localhost:5000/auth/country_list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch countries list');
    }

    const data = await response.json();
    setFetchedCountries(data);
    setFetchedCountries(data.map((country) => country.countryCode));
    setCountries(countryList.getData().filter((country) => fetchedCountries.includes(country.code)));
  };

  useEffect(() => {
    fetchCountriesList();
    fetchUserList();
  }, []);

  const handleAddCountry = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found.');
        return;
      }

      const response = await fetch('http://localhost:5000/auth/countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ countryCode })
      });

      const data = await response.json();

      if (response.ok) {
        toggleNewCountry();
        fetchCountriesList();
      } else {
        setError(data.error || 'Failed to add country');
      }
    } catch (error) {
      setError('An error occurred while adding the country.');
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, country, registerRole })
      });

      const data = await response.json();
      if (response.ok) {
        fetchUserList();
      } else {
        setError(data.error || 'Failed to register user');
      }
    } catch (error) {
      console.error('Registering error:', error);
    }
  };

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
    fetchCountriesList();
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    console.log(editingUser);
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
      });

      if (response.ok) {
        setEditingUser(null);
        fetchUserList();
      } else {
        setError('Failed to update user');
      }
    } catch (error) {
      setError(error.message);
    }
  };
  const handleDeleteUser = async (deletedUser) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/profile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: deletedUser._id })
      });

      if (response.ok) {
        setEditingUser(null);
        fetchUserList();
      } else {
        setError('Failed to delete user');
      }
    } catch (error) {
      setError('An error occurred while deleting the user.');
    }
  };

  return (
    <div className="flex flex-row mx-auto p-4">
      {!editingUser && (
        <>
          <Card className="m-auto mt-0 p-2">
            <Accordion open={open === 1}>
              <AccordionHeader onClick={() => handleOpen(1)}>
                <div className="flex justify-between items-center w-full">
                  <Typography variant="h5" color="blue-gray">
                    Add user
                  </Typography>
                  <Button className="flex items-center">{open === 1 ? <FaTimes /> : <FaPlus />}</Button>
                </div>
              </AccordionHeader>
              <AccordionBody>
                <form className="mt-8 mb-2 max-w-screen-lg sm:w-96">
                  <div className="mb-1 flex flex-col gap-6">
                    <Typography variant="h6" color="blue-gray" className="-mb-3">
                      Email
                    </Typography>
                    <Input
                      size="lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="firstname.surname@skytechab.se"
                      className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                      labelProps={{
                        className: 'before:content-none after:content-none'
                      }}
                    />
                    <Typography variant="h6" color="blue-gray" className="-mb-3">
                      Password
                    </Typography>
                    <Input
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                      placeholder="password"
                      className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                      labelProps={{
                        className: 'before:content-none after:content-none'
                      }}
                    />
                    <div className="-mb-3 flex justify-evenly align-left">
                      <Typography variant="h7" color="blue-gray" className="-mb-3">
                        {!addNewCountry ? 'Country code (ex. SE)' : 'Select country from list'}
                      </Typography>
                      <Typography variant="h6" color="blue-gray" className="-mb-3">
                        OR
                      </Typography>
                      <Typography variant="h6" color="blue" className="-mb-3 cursor-pointer" onClick={toggleNewCountry}>
                        {addNewCountry ? 'Add new country' : 'Select existing country'}
                      </Typography>
                    </div>
                    {!addNewCountry && (
                      <>
                        <Input
                          size="lg"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          placeholder="SE"
                          className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                          labelProps={{
                            className: 'before:content-none after:content-none'
                          }}
                        />
                        <Button onClick={handleAddCountry}>Add country</Button>
                      </>
                    )}
                    {addNewCountry && (
                      <Menu placement="bottom-start">
                        <MenuHandler>
                          <Button
                            ripple={false}
                            variant="text"
                            color="blue-gray"
                            className="flex h-10 items-center gap-2 border border-blue-gray-200 pl-3"
                          >
                            {country || 'Select Country'}
                          </Button>
                        </MenuHandler>
                        <MenuList className="max-h-[20rem] max-w-[18rem] overflow-auto">
                          {countries.map(({ code, name }) => (
                            <MenuItem
                              key={code}
                              value={name}
                              className="flex items-center gap-2"
                              onClick={() => setCountry(code)}
                            >
                              <Flag code={code} style={{ width: '20px', height: '15px' }} />
                              {code}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Menu>
                    )}
                    <Typography variant="h6" color="blue-gray" className="-mb-3">
                      Role
                    </Typography>
                    <Menu>
                      <MenuHandler>
                        <Button
                          ripple={false}
                          variant="text"
                          color="blue-gray"
                          className="flex h-10 items-center gap-2 border border-blue-gray-200 pl-3"
                        >
                          {registerRole || 'Select Role'}
                        </Button>
                      </MenuHandler>
                      <MenuList className="max-h-[20rem] max-w-[18rem] overflow-auto">
                        <MenuItem
                          value="admin"
                          onClick={() => setRegisterRole('admin')}
                          className="flex items-center gap-2"
                        >
                          <FaUserCog />
                          Admin
                        </MenuItem>
                        <MenuItem value="cm" onClick={() => setRegisterRole('cm')} className="flex items-center gap-2">
                          <FaUser />
                          Country manager
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </div>
                  <Button className="mt-6" onClick={handleRegister} fullWidth>
                    Add user
                  </Button>
                </form>
                {error && <p>{error}</p>}
              </AccordionBody>
            </Accordion>
          </Card>
          <Card className="table-div">
            <button onClick={fetchUserList} className="refresh-button">
              <FaSync />
            </button>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Country</th>
                  <th>Created at</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.country}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <Button onClick={() => handleEditUser(user)} className="edit-button">
                        <FaEdit />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
      {editingUser && (
        <EditUser
          countries={countries}
          user={editingUser}
          onUpdate={handleUpdateUser}
          onDelete={handleDeleteUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

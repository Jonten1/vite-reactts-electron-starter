import React, { useState, useEffect } from 'react';
import { Card, Input, Checkbox, Button, Typography, CardHeader } from '@material-tailwind/react';
import '../../style/call_logs.css';
import { FaSync } from 'react-icons/fa';

export default function AdminUsers() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [registerRole, setRegisterRole] = useState('');
  const [error, setError] = useState('');
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from local storage

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
        console.log(userList);

        if (!response.ok) {
          throw new Error('Failed to fetch user list');
        }

        const data = await response.json();
        setUserList(data);
        console.log('User list:', data);
      } catch (error) {
        console.error('Error fetching user list:', error);
      }
    };

    fetchUserList();
  }, []);

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    console.log(`Registering ${email}`);
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
        console.log('User registered successfully');
      } else {
        setError(data.error || 'Failed to register user');
      }

      // Send the response back to the renderer process
    } catch (error) {
      console.error('Regestring error:', error);
    }
  };
  return (
    <>
      <Card className="m-auto p-2 dark:bg-slate-200">
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Email
            </Typography>
            <Input
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="firstname.surname@skytechab.se"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: 'before:content-none after:content-none'
              }}
            />

            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Password
            </Typography>
            <Input
              type="text"
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
              placeholder="password"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: 'before:content-none after:content-none'
              }}
            />
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Country
            </Typography>
            <Input
              type="text"
              onChange={(e) => setCountry(e.target.value)}
              size="lg"
              placeholder="country"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: 'before:content-none after:content-none'
              }}
            />
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Role
            </Typography>
            <Input
              type="text"
              onChange={(e) => setRegisterRole(e.target.value)}
              size="lg"
              placeholder="role"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: 'before:content-none after:content-none'
              }}
            />
          </div>

          <Button className="mt-6" onClick={handleRegister} fullWidth>
            Register
          </Button>
        </form>
        {error && <p>{error}</p>}
      </Card>
      <Card className="table-div">
        <button className="refresh-button">
          <FaSync />
        </button>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Country</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.country}</td>
                <td>{user.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, Input, Checkbox, Button, Typography, CardHeader } from '@material-tailwind/react';

// Define the props type
interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

// Define the Login component as a default export function
export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('admin@admin');
  const [password, setPassword] = useState('adminnn');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listener for login responses
    window.Main.on('login-response', (response) => {
      setLoading(false); // Stop loading
      if (response.token) {
        onLoginSuccess(response.token); // Handle successful login
        localStorage.setItem('token', response.token);
      } else {
        setError(response.error || 'An error occurred. Please try again.'); // Handle error
      }
    });

    // Cleanup the listener on component unmount
  }, [onLoginSuccess]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true); // Start loading
    console.log(`Logging in with ${email}`);

    // Send the login request
    window.Main.sendMessage('login', { email, password });
  };

  return (
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
            placeholder="name@mail.com"
            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
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
            placeholder="********"
            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: 'before:content-none after:content-none'
            }}
          />
        </div>

        <Button className="mt-6" onClick={handleLogin} disabled={loading} fullWidth>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      {error && <p>{error}</p>}
    </Card>
  );
}

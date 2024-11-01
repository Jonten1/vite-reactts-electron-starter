import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Dialog
} from '@material-tailwind/react';
import { FaTimes } from 'react-icons/fa';
import Flag from 'react-world-flags';

export default function EditUser({ user, onUpdate, onDelete, onClose, countries }) {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user.role);
  const [country, setCountry] = useState(user.country);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleUpdate = () => {
    const updatedUser = { ...user, email, password, role, country };
    console.log(updatedUser);
    onUpdate(updatedUser);
  };
  const handleDelete = () => {
    const deletedUser = { ...user, email, password, role, country };
    console.log('Deleting user:', deletedUser);
    onDelete(deletedUser);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="m-auto mt-4 p-4 max-w-screen-md">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" color="blue-gray">
            Edit User
          </Typography>
          <Button className="flex items-center" onClick={onClose}>
            <FaTimes />
          </Button>
        </div>
        <form className="mt-8 mb-2">
          <div className="mb-6 flex flex-col gap-6">
            <Typography variant="h6" color="blue-gray">
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
            <Typography variant="h6" color="blue-gray">
              Password
            </Typography>
            <Input
              size="lg"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="A strong password"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: 'before:content-none after:content-none'
              }}
            />
            <Typography variant="h6" color="blue-gray">
              Country
            </Typography>
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
                    onClick={() => setCountry(name)}
                  >
                    <Flag code={code} style={{ width: '20px', height: '15px' }} />
                    {name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Typography variant="h6" color="blue-gray">
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
                  {role || 'Select Role'}
                </Button>
              </MenuHandler>
              <MenuList className="max-h-[20rem] max-w-[18rem] overflow-auto">
                <MenuItem value="admin" onClick={() => setRole('admin')} className="flex items-center gap-2">
                  Admin
                </MenuItem>
                <MenuItem value="cm" onClick={() => setRole('cm')} className="flex items-center gap-2">
                  Country manager
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
          <Button className="mt-6" onClick={handleUpdate} fullWidth>
            Update User
          </Button>
          <Button className="mt-6" onClick={openDeleteDialog} fullWidth>
            Delete
          </Button>
        </form>
      </Card>
      <Dialog open={deleteDialogOpen} handler={() => setDeleteDialogOpen(false)} size="sm">
        <div className="p-4">
          <Typography variant="h6">Are you sure you want to delete this user?</Typography>
          <div className="flex justify-between mt-4">
            <Button onClick={handleDelete} color="red">
              Yes, Delete
            </Button>
            <Button onClick={() => setDeleteDialogOpen(false)} color="gray">
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

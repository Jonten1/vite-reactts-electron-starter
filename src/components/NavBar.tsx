import React from 'react';
import {
  Navbar,
  Collapse,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Alert
} from '@material-tailwind/react';
import SwitchDarkMode from './SwitchDarkMode';
import SelectLanguage from './SelectLanguage';
import '../style/sidebar.css';

// Component for a sidebar in tailwind
function NavList() {
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 sm:flex-row lg:items-center lg:gap-6">
      <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
        <a href="#" className="flex items-center hover:text-blue-500 transition-colors">
          Account
        </a>
      </Typography>
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
      <SelectLanguage />
    </ul>
  );
}
export default function Sidebar() {
  const [openNav, setOpenNav] = React.useState(false);
  return (
    <Navbar className="mx-auto max-w-screen-xl px-6 py-3">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography as="a" href="#" variant="h6" className="mr-4 cursor-pointer py-1.5">
          Material Tailwind
        </Typography>
        <div className="lg:block">
          <NavList />
        </div>
      </div>
      <Collapse open={openNav}>
        <NavList />
      </Collapse>
    </Navbar>
  );
}

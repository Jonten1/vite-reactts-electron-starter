import React from 'react';
import { Card, Typography, List, ListItem, ListItemPrefix, ListItemSuffix, Chip } from '@material-tailwind/react';
import SwitchDarkMode from './SwitchDarkMode';
import SelectLanguage from './SelectLanguage';
import '../style/sidebar.css';

// Component for a sidebar in tailwind

export default function Sidebar() {
  return (
    <Card className="sidebar-card">
      <div className="flex justify-evenly mb-2 p-4">
        <Typography variant="h5">Sidebar</Typography> <SwitchDarkMode />
      </div>
      <SelectLanguage />
      <List className="sidebar-list">
        <ListItem>
          <ListItemPrefix></ListItemPrefix>
          Call logs
        </ListItem>
        <ListItem>
          <ListItemPrefix></ListItemPrefix>
          Stats
        </ListItem>
        <ListItem>
          <ListItemPrefix></ListItemPrefix>
          Log Out
        </ListItem>
      </List>
    </Card>
  );
}

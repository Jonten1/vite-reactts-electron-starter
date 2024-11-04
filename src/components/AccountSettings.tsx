import React from 'react';

export default function AccountSettings({ role, email, country, cmNumber }) {
  return (
    <div>
      <h2>User:{email}</h2>
      <p>Role: {role}</p>
      <p>Country: {country}</p>
      <p>Phone: {cmNumber}</p>
    </div>
  );
}

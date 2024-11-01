import React from 'react';

export default function AccountSettings({ role, email, country }) {
  return (
    <div>
      <h2>{role}</h2>
      <p>Email: {email}</p>
      <p>Country: {country}</p>
    </div>
  );
}

import React from 'react';
import UserDashboard from './UserDashboard';
import '../styles/dashboard.css';


/**
 * Wrapper component that includes global styles for the User Dashboard
 * This component provides Tailwind CSS and Material Icons styling
 */
export default function UserDashboardWrapper() {
  return (
    <>

      <UserDashboard />
    </>
  );
}

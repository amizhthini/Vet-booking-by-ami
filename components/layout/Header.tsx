import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Welcome, {user?.name}!</h1>
        <p className="text-sm text-gray-500">You are logged in as: <span className="font-semibold text-teal-600">{user?.role}</span></p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
            <img src="https://picsum.photos/seed/user/40" alt="User Avatar" className="w-10 h-10 rounded-full" />
        </div>
        <Button onClick={logout} variant="secondary" size="sm">Logout</Button>
      </div>
    </header>
  );
};

export default Header;
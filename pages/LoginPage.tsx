import React from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = (role: Role) => {
    login(role);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-teal-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1H6a1 1 0 01-1-1v-3a1 1 0 011-1h.5a1.5 1.5 0 000-3H6a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Welcome to VetSync AI</h1>
          <p className="text-gray-500 mt-2">Please select your role to log in.</p>
        </div>
        <div className="mt-8 space-y-4">
          <Button className="w-full" size="lg" onClick={() => handleLogin('Pet Parent')}>
            Login as Pet Parent
          </Button>
          <Button className="w-full" size="lg" variant="secondary" onClick={() => handleLogin('Veterinarian')}>
            Login as Veterinarian
          </Button>
          <Button className="w-full" size="lg" variant="secondary" onClick={() => handleLogin('Clinic Admin')}>
            Login as Clinic Admin
          </Button>
          <Button className="w-full" size="lg" variant="ghost" onClick={() => handleLogin('Admin')}>
            Login as Admin
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
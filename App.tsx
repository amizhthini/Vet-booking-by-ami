import React, { useState, useCallback } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import VetsPage from './pages/VetsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationPage from './pages/ConsultationPage';
import LoginPage from './pages/LoginPage';
import PlaceholderPage from './pages/PlaceholderPage';
import type { Appointment } from './types';
import { Page } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';


const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };
  
  const startConsultation = useCallback((appointment: Appointment) => {
    setActiveAppointment(appointment);
    setCurrentPage(Page.Consultation);
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      // Pet Parent Pages
      case Page.Dashboard:
        return <DashboardPage navigateTo={navigateTo} startConsultation={startConsultation} />;
      case Page.Vets:
        return <VetsPage />;
      case Page.Appointments:
        return <AppointmentsPage startConsultation={startConsultation} />;
      case Page.Consultation:
        return activeAppointment ? <ConsultationPage appointment={activeAppointment} navigateTo={navigateTo} /> : <DashboardPage navigateTo={navigateTo} startConsultation={startConsultation}/>;
      
      // Vet, Admin & Clinic pages are placeholders
      case Page.Schedule:
      case Page.Patients:
      case Page.VetManagement:
      case Page.ClinicManagement:
      case Page.UserManagement:
      case Page.ScheduleManagement:
      case Page.PatientRecords:
      case Page.MyPets:
        return <PlaceholderPage title={currentPage} />;

      default:
        return <DashboardPage navigateTo={navigateTo} startConsultation={startConsultation}/>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;